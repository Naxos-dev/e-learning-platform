import type { Role } from '@prisma/client';
import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtPayload {
  sub: string;
  role: Role;
}

// On fixe explicitement l'algorithme (plutôt que de laisser jsonwebtoken deviner depuis le
// header du token) pour écarter toute confusion d'algorithme, même si HS256 étant la seule clé
// utilisée ici (pas de paire RSA/HMAC mixte), ce n'est pas exploitable dans cette config actuelle.
const JWT_ALGORITHM = 'HS256';

const signOptions: SignOptions = {
  algorithm: JWT_ALGORITHM,
  expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
};

const verifyOptions: VerifyOptions = {
  algorithms: [JWT_ALGORITHM],
};

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, signOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET, verifyOptions) as JwtPayload;
}
