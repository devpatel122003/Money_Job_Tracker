import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
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
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7

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

// ============================================================================
// PASSWORD RESET FUNCTIONS - PRODUCTION READY (NO TRANSACTIONS)
// ============================================================================

/**
 * Create a secure password reset token
 * Uses crypto.randomBytes for cryptographically secure random tokens
 */
export async function createPasswordResetToken(
  email: string
): Promise<{ token: string; userId: number } | null> {
  // Check if user exists
  const user = await getUser(email)
  if (!user) {
    return null
  }

  // Generate cryptographically secure random token
  const token = crypto.randomBytes(32).toString("hex")

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  // Invalidate any existing tokens for this user
  await sql`
    UPDATE password_reset_tokens
    SET used = true
    WHERE user_id = ${user.id} AND used = false
  `

  // Store new token in database
  await sql`
    INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES (${user.id}, ${token}, ${expiresAt})
  `

  return { token, userId: user.id }
}

/**
 * Verify if a password reset token is valid
 */
export async function verifyPasswordResetToken(token: string): Promise<{
  valid: boolean
  userId?: number
  reason?: string
}> {
  try {
    const result = await sql`
      SELECT user_id, expires_at, used
      FROM password_reset_tokens
      WHERE token = ${token}
    `

    if (result.length === 0) {
      return { valid: false, reason: "Token not found" }
    }

    const tokenData = result[0]

    if (tokenData.used) {
      return { valid: false, reason: "Token already used" }
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      return { valid: false, reason: "Token expired" }
    }

    return { valid: true, userId: tokenData.user_id }
  } catch (error) {
    console.error("Error verifying password reset token:", error)
    return { valid: false, reason: "Verification error" }
  }
}

/**
 * Reset user password with a valid token
 * Note: Uses separate queries instead of transaction for compatibility
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const verification = await verifyPasswordResetToken(token)

  if (!verification.valid || !verification.userId) {
    return false
  }

  try {
    const passwordHash = await hashPassword(newPassword)

    // Update password first
    const updateResult = await sql`
      UPDATE users
      SET password_hash = ${passwordHash}
      WHERE id = ${verification.userId}
      RETURNING id
    `

    // If password update failed, don't mark token as used
    if (!updateResult || updateResult.length === 0) {
      return false
    }

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens
      SET used = true
      WHERE token = ${token}
    `

    return true
  } catch (error) {
    console.error("Error resetting password:", error)
    return false
  }
}

/**
 * Get user information from a valid reset token
 */
export async function getUserByResetToken(token: string) {
  try {
    const result = await sql`
      SELECT u.id, u.email, u.name
      FROM users u
      JOIN password_reset_tokens prt ON u.id = prt.user_id
      WHERE prt.token = ${token}
        AND prt.used = false
        AND prt.expires_at > NOW()
    `
    return result[0]
  } catch (error) {
    console.error("Error getting user by reset token:", error)
    return null
  }
}

/**
 * Rate limiting: Check if too many reset requests from this email
 */
export async function checkResetRateLimit(email: string): Promise<boolean> {
  try {
    const user = await getUser(email)
    if (!user) return false

    const result = await sql`
      SELECT COUNT(*) as count
      FROM password_reset_tokens
      WHERE user_id = ${user.id}
        AND created_at > NOW() - INTERVAL '1 hour'
    `

    const count = parseInt(result[0].count)
    return count >= 3 // Max 3 requests per hour
  } catch (error) {
    console.error("Error checking rate limit:", error)
    return false
  }
}

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredResetTokens(): Promise<number> {
  try {
    const result = await sql`
      DELETE FROM password_reset_tokens
      WHERE expires_at < NOW() - INTERVAL '7 days'
      RETURNING id
    `
    return result.length
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error)
    return 0
  }
}