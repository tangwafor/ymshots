/**
 * Payment Provider Abstraction Layer
 *
 * YmShotS supports multiple payment providers to serve photographers globally:
 * - NotchPay: MTN MoMo + Orange Money (Cameroon, francophone Africa)
 * - CinetPay: Mobile Money across FCFA zone
 * - Flutterwave: Pan-African cards + Mobile Money
 * - Stripe: International cards (US, EU, supported African countries)
 * - Manual: Cash + Bank transfer (photographer confirms receipt)
 */

export type ProviderName = 'NOTCHPAY' | 'CINETPAY' | 'FLUTTERWAVE' | 'STRIPE' | 'MANUAL';

export interface PaymentRequest {
  invoiceId: string;
  amountCents: number;
  currency: string;         // 'XAF' for Cameroon, 'USD', 'EUR', etc.
  method: string;           // 'MOBILE_MONEY_MTN', 'CARD', 'CASH', etc.
  phoneNumber?: string;     // For mobile money
  email?: string;           // For card/Stripe
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  providerTxId?: string;
  status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  checkoutUrl?: string;     // Redirect URL for hosted checkout
  providerResponse?: unknown;
  error?: string;
}

export interface PaymentProvider {
  name: ProviderName;
  initiate(request: PaymentRequest): Promise<PaymentResult>;
  verify(transactionId: string): Promise<PaymentResult>;
  supportedMethods(): string[];
  supportedCurrencies(): string[];
}

// ─── NotchPay (Cameroon primary) ───

export class NotchPayProvider implements PaymentProvider {
  name: ProviderName = 'NOTCHPAY';
  private apiKey: string;
  private baseUrl = 'https://api.notchpay.co';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const res = await fetch(`${this.baseUrl}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amountCents / 100,  // NotchPay uses whole units
          currency: request.currency,
          phone: request.phoneNumber,
          email: request.email,
          description: request.description || `YmShotS Invoice ${request.invoiceId}`,
          reference: request.invoiceId,
        }),
      });
      const data = await res.json();

      if (data.status === 'Accepted' || data.status === 'success') {
        return {
          success: true,
          providerTxId: data.transaction?.reference || data.reference,
          status: 'PROCESSING',
          checkoutUrl: data.authorization_url,
          providerResponse: data,
        };
      }
      return { success: false, status: 'FAILED', error: data.message, providerResponse: data };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  async verify(transactionId: string): Promise<PaymentResult> {
    try {
      const res = await fetch(`${this.baseUrl}/payments/${transactionId}`, {
        headers: { 'Authorization': this.apiKey },
      });
      const data = await res.json();
      const status = data.transaction?.status === 'complete' ? 'SUCCEEDED' : 'PENDING';
      return { success: status === 'SUCCEEDED', providerTxId: transactionId, status, providerResponse: data };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  supportedMethods() { return ['MOBILE_MONEY_MTN', 'MOBILE_MONEY_ORANGE', 'CARD']; }
  supportedCurrencies() { return ['XAF', 'XOF', 'USD', 'EUR']; }
}

// ─── Flutterwave (Pan-African) ───

export class FlutterwaveProvider implements PaymentProvider {
  name: ProviderName = 'FLUTTERWAVE';
  private secretKey: string;
  private baseUrl = 'https://api.flutterwave.com/v3';

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const res = await fetch(`${this.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tx_ref: request.invoiceId,
          amount: request.amountCents / 100,
          currency: request.currency,
          payment_options: request.method === 'MOBILE_MONEY_MTN' ? 'mobilemoneycameroon' : 'card',
          customer: { email: request.email, phone_number: request.phoneNumber },
          meta: request.metadata,
          customizations: {
            title: 'YmShotS Invoice',
            description: request.description,
          },
        }),
      });
      const data = await res.json();

      if (data.status === 'success') {
        return {
          success: true,
          providerTxId: data.data?.tx_ref,
          status: 'PROCESSING',
          checkoutUrl: data.data?.link,
          providerResponse: data,
        };
      }
      return { success: false, status: 'FAILED', error: data.message, providerResponse: data };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  async verify(transactionId: string): Promise<PaymentResult> {
    try {
      const res = await fetch(`${this.baseUrl}/transactions/${transactionId}/verify`, {
        headers: { 'Authorization': `Bearer ${this.secretKey}` },
      });
      const data = await res.json();
      const status = data.data?.status === 'successful' ? 'SUCCEEDED' : 'PENDING';
      return { success: status === 'SUCCEEDED', providerTxId: transactionId, status, providerResponse: data };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  supportedMethods() { return ['MOBILE_MONEY_MTN', 'MOBILE_MONEY_ORANGE', 'CARD', 'BANK_TRANSFER']; }
  supportedCurrencies() { return ['XAF', 'XOF', 'NGN', 'GHS', 'KES', 'USD', 'EUR', 'GBP']; }
}

// ─── Stripe (International) ───

export class StripeProvider implements PaymentProvider {
  name: ProviderName = 'STRIPE';
  private secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Use Stripe Payment Links or Checkout Sessions
      const Stripe = require('stripe');
      const stripe = new Stripe(this.secretKey);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: request.currency.toLowerCase(),
            product_data: { name: `YmShotS Invoice ${request.invoiceId}` },
            unit_amount: request.amountCents,
          },
          quantity: 1,
        }],
        mode: 'payment',
        metadata: { invoiceId: request.invoiceId, ...request.metadata },
      });

      return {
        success: true,
        providerTxId: session.id,
        status: 'PROCESSING',
        checkoutUrl: session.url,
        providerResponse: { sessionId: session.id },
      };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  async verify(transactionId: string): Promise<PaymentResult> {
    try {
      const Stripe = require('stripe');
      const stripe = new Stripe(this.secretKey);
      const session = await stripe.checkout.sessions.retrieve(transactionId);
      const status = session.payment_status === 'paid' ? 'SUCCEEDED' : 'PENDING';
      return { success: status === 'SUCCEEDED', providerTxId: transactionId, status, providerResponse: session };
    } catch (e: any) {
      return { success: false, status: 'FAILED', error: e.message };
    }
  }

  supportedMethods() { return ['CARD', 'STRIPE']; }
  supportedCurrencies() { return ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NGN', 'ZAR', 'KES']; }
}

// ─── Manual (Cash / Bank Transfer) ───

export class ManualProvider implements PaymentProvider {
  name: ProviderName = 'MANUAL';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    // Cash and bank transfers are confirmed by the photographer manually.
    // No external API call needed.
    return {
      success: true,
      providerTxId: `manual-${Date.now()}`,
      status: 'PENDING',  // Stays pending until photographer confirms
    };
  }

  async verify(_transactionId: string): Promise<PaymentResult> {
    // Manual verification is done in-app by the photographer
    return { success: true, status: 'PENDING' };
  }

  supportedMethods() { return ['CASH', 'BANK_TRANSFER', 'OTHER']; }
  supportedCurrencies() { return ['XAF', 'USD', 'EUR', 'NGN', 'GHS', 'KES', 'GBP', 'CAD']; }
}

// ─── Factory ───

export function createProvider(name: ProviderName, config: Record<string, string>): PaymentProvider {
  switch (name) {
    case 'NOTCHPAY':    return new NotchPayProvider(config.apiKey);
    case 'FLUTTERWAVE':  return new FlutterwaveProvider(config.secretKey);
    case 'STRIPE':       return new StripeProvider(config.secretKey);
    case 'CINETPAY':     return new NotchPayProvider(config.apiKey); // Similar API pattern
    case 'MANUAL':       return new ManualProvider();
    default:             return new ManualProvider();
  }
}

// ─── Resolve best provider for a payment method ───

export function resolveProvider(method: string, configuredProviders: ProviderName[]): ProviderName {
  if (method === 'CASH' || method === 'BANK_TRANSFER' || method === 'OTHER') return 'MANUAL';
  if (method === 'STRIPE') return 'STRIPE';

  // Mobile money → prefer NotchPay (Cameroon-native), fall back to Flutterwave
  if (method === 'MOBILE_MONEY_MTN' || method === 'MOBILE_MONEY_ORANGE') {
    if (configuredProviders.includes('NOTCHPAY')) return 'NOTCHPAY';
    if (configuredProviders.includes('CINETPAY')) return 'CINETPAY';
    if (configuredProviders.includes('FLUTTERWAVE')) return 'FLUTTERWAVE';
  }

  // Card → prefer Stripe (best card processing), fall back to Flutterwave
  if (method === 'CARD' || method === 'FLUTTERWAVE') {
    if (configuredProviders.includes('STRIPE')) return 'STRIPE';
    if (configuredProviders.includes('FLUTTERWAVE')) return 'FLUTTERWAVE';
    if (configuredProviders.includes('NOTCHPAY')) return 'NOTCHPAY';
  }

  return 'MANUAL';
}
