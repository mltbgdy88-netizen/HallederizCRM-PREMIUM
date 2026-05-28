import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
const HASH_PREFIX = "scrypt_v1";
const DEFAULT_N = 16384;
const DEFAULT_R = 8;
const DEFAULT_P = 1;
const KEY_LEN = 64;

async function deriveKey(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number; maxmem: number }
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(derivedKey as Buffer);
    });
  });
}

function toBase64Url(buffer: Buffer): string {
  return buffer.toString("base64url");
}

function fromBase64Url(value: string): Buffer {
  return Buffer.from(value, "base64url");
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derivedKey = await deriveKey(password, salt, KEY_LEN, {
    N: DEFAULT_N,
    r: DEFAULT_R,
    p: DEFAULT_P,
    maxmem: 128 * 1024 * 1024
  });

  return [
    HASH_PREFIX,
    String(DEFAULT_N),
    String(DEFAULT_R),
    String(DEFAULT_P),
    toBase64Url(salt),
    toBase64Url(derivedKey)
  ].join("$");
}

function parseHash(hash: string):
  | { n: number; r: number; p: number; salt: Buffer; expected: Buffer }
  | null {
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== HASH_PREFIX) {
    return null;
  }

  const n = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return null;
  }

  try {
    const salt = fromBase64Url(parts[4] ?? "");
    const expected = fromBase64Url(parts[5] ?? "");
    if (!salt.length || !expected.length) {
      return null;
    }
    return { n, r, p, salt, expected };
  } catch {
    return null;
  }
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  const parsed = parseHash(passwordHash);
  if (!parsed) {
    return false;
  }

  const derived = await deriveKey(password, parsed.salt, parsed.expected.length, {
    N: parsed.n,
    r: parsed.r,
    p: parsed.p,
    maxmem: 128 * 1024 * 1024
  });

  if (derived.length !== parsed.expected.length) {
    return false;
  }

  return timingSafeEqual(derived, parsed.expected);
}
