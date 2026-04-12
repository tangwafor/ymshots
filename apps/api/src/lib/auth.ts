import * as jose from 'jose';
import type { FastifyRequest, FastifyReply } from 'fastify';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me');
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

export interface JwtPayload {
  sub: string;       // userId
  email: string;
  plan: string;
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .setIssuer('ymshots')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: { sub: string }): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
    .setIssuer('ymshots')
    .sign(JWT_REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jose.jwtVerify(token, JWT_SECRET, { issuer: 'ymshots' });
  return payload as unknown as JwtPayload;
}

export async function verifyRefreshToken(token: string): Promise<{ sub: string }> {
  const { payload } = await jose.jwtVerify(token, JWT_REFRESH_SECRET, { issuer: 'ymshots' });
  return payload as unknown as { sub: string };
}

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }

  try {
    const token = header.slice(7);
    const payload = await verifyAccessToken(token);
    (request as any).userId = payload.sub;
    (request as any).userEmail = payload.email;
    (request as any).userPlan = payload.plan;
  } catch {
    return reply.status(401).send({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
  }
}
