import { cookies } from "next/headers";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "./config";

export interface SessionPayload extends JWTPayload {
  userId: number;
  organizationId: number;
}

const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!);

export async function encryptSession(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_MS / 1000}s`)
    .sign(encodedKey);
}

export async function decryptSession(token?: string) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await encryptSession(payload);
  (await cookies()).set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + SESSION_DURATION_MS),
    sameSite: "lax",
    path: "/",
  });
}

export async function readSessionCookie() {
  return decryptSession((await cookies()).get(SESSION_COOKIE_NAME)?.value);
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}