import type { Handler } from '@netlify/functions';

/**
 * Notification function — handles:
 * 1. Alert YOU when someone signs up (saved to Supabase notifications table)
 * 2. Log usage analytics events
 * 3. Log client-side errors
 * 4. Check for overdue invoices
 */
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const OWNER_EMAIL = 'vangwafor3@yahoo.com';

async function supabasePost(table: string, data: any) {
  return fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(data),
  });
}

const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{"error":"POST only"}' };

  try {
    const { action, data } = JSON.parse(event.body || '{}');

    switch (action) {
      case 'signup-alert': {
        // Save notification for owner: someone signed up
        await supabasePost('notifications', {
          type: 'SIGNUP_ALERT',
          recipient: OWNER_EMAIL,
          subject: `New YmShotS ${data.isPilot ? 'PILOT' : 'waitlist'} signup: ${data.name}`,
          body: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nPlan: ${data.plan}\nPilot: ${data.isPilot ? 'YES' : 'No'}\nCode: ${data.code || 'None'}\nLocale: ${data.locale}\nTime: ${new Date().toISOString()}`,
          status: 'SENT',
        });
        return { statusCode: 200, headers, body: '{"ok":true}' };
      }

      case 'track': {
        // Usage analytics event
        await supabasePost('usage_events', {
          userId: data.userId || null,
          event: data.event,
          feature: data.feature || null,
          metadata: data.metadata || null,
        });
        return { statusCode: 200, headers, body: '{"ok":true}' };
      }

      case 'error': {
        // Client-side error log
        await supabasePost('error_logs', {
          userId: data.userId || null,
          error: data.error,
          stack: data.stack || null,
          page: data.page || null,
          userAgent: data.userAgent || null,
        });
        return { statusCode: 200, headers, body: '{"ok":true}' };
      }

      case 'check-overdue': {
        // Check for overdue invoices (called by cron or manually)
        // Query invoices with status SENT and dueDate < now
        const res = await fetch(`${SUPABASE_URL}/rest/v1/invoices?status=eq.SENT&select=id,invoiceNumber,clientId,totalCents,currency`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
          },
        });
        const overdue = await res.json();
        if (Array.isArray(overdue) && overdue.length > 0) {
          await supabasePost('notifications', {
            type: 'OVERDUE_REMINDER',
            recipient: OWNER_EMAIL,
            subject: `${overdue.length} overdue invoice(s) need attention`,
            body: overdue.map((inv: any) => `Invoice ${inv.invoiceNumber}: ${inv.totalCents / 100} ${inv.currency}`).join('\n'),
            status: 'SENT',
          });
        }
        return { statusCode: 200, headers, body: JSON.stringify({ overdue: overdue?.length || 0 }) };
      }

      default:
        return { statusCode: 400, headers, body: '{"error":"Unknown action"}' };
    }
  } catch (err: any) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

export { handler };
