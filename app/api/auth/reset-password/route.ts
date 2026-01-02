import { NextResponse } from "next/server"
import { resetPassword, verifyPasswordResetToken, getUserByResetToken } from "@/lib/auth"
import { sendPasswordChangedEmail } from "@/lib/email"

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json(
                { error: "Token and password are required" },
                { status: 400 }
            )
        }

        // Validate password strength
        const validationError = validatePassword(password)
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 })
        }

        // Verify token is valid before attempting reset
        const verification = await verifyPasswordResetToken(token)
        if (!verification.valid) {
            let errorMessage = "Invalid or expired reset token"

            // Provide more specific error for better UX (but not too specific for security)
            if (verification.reason === "Token expired") {
                errorMessage = "This reset link has expired. Please request a new one."
            } else if (verification.reason === "Token already used") {
                errorMessage = "This reset link has already been used. Please request a new one if needed."
            }

            return NextResponse.json({ error: errorMessage }, { status: 400 })
        }

        // Get user info before resetting (for email notification)
        const user = await getUserByResetToken(token)

        // Reset the password
        const success = await resetPassword(token, password)

        if (!success) {
            return NextResponse.json(
                { error: "Failed to reset password. Please try again." },
                { status: 500 }
            )
        }

        // Send confirmation email (don't block the response on this)
        if (user) {
            sendPasswordChangedEmail(user.email, user.name).catch((error) => {
                console.error("Failed to send password changed email:", error)
                // Don't fail the request if email fails
            })
        }

        console.log(`Password successfully reset for user ID: ${verification.userId}`)

        return NextResponse.json({
            message: "Password reset successfully. You can now log in with your new password.",
        })
    } catch (error) {
        console.error("Password reset error:", error)
        return NextResponse.json(
            { error: "An error occurred. Please try again later." },
            { status: 500 }
        )
    }
}

/**
 * Validate password strength
 * Returns error message if invalid, null if valid
 */
function validatePassword(password: string): string | null {
    if (password.length < 8) {
        return "Password must be at least 8 characters long"
    }

    if (password.length > 128) {
        return "Password must be less than 128 characters"
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter"
    }

    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter"
    }

    if (!/\d/.test(password)) {
        return "Password must contain at least one number"
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return "Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)"
    }

    // Check for common weak passwords
    const weakPasswords = [
        "password123",
        "12345678",
        "qwerty123",
        "abc123456",
        "password1",
        "welcome123",
    ]
    if (weakPasswords.includes(password.toLowerCase())) {
        return "This password is too common. Please choose a stronger password"
    }

    return null
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"