import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createUser(email: string, password: string, name: string) {
  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    RETURNING id, email, name, created_at
  `

  return result[0]
}

export async function getUser(email: string) {
  const result = await sql`
    SELECT id, email, password_hash, name, created_at
    FROM users
    WHERE email = ${email}
  `
  return result[0]
}

export async function getUserById(id: number) {
  const result = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${id}
  `
  return result[0]
}

export async function setUserSession(userId: number, rememberMe = false) {
  const cookieStore = await cookies()
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7 // 30 days if remember me, else 7 days

  cookieStore.set("user_id", userId.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge,
  })
}

export async function getUserSession() {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  if (!userId) return null

  const user = await getUserById(Number.parseInt(userId))
  return user
}

export async function clearUserSession() {
  const cookieStore = await cookies()
  cookieStore.delete("user_id")
}
