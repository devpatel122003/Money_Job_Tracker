import { NextResponse } from "next/server"
import { createPasswordResetToken, checkResetRateLimit } from "@/lib/auth"
import { sendPasswordResetEmail } from "@/lib/email"
import { headers } from "next/headers"

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
        }

        // Check rate limiting
        const rateLimitExceeded = await checkResetRateLimit(email)
        if (rateLimitExceeded) {
            // For security, still return success message
            return NextResponse.json({
                message: "If an account exists with this email, a password reset link has been sent.",
            })
        }

        // Get request metadata for security logging
        const headersList = await headers()
        const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        // Create reset token
        const result = await createPasswordResetToken(email, {
            ipAddress,
            userAgent,
        })

        if (!result) {
            // For security, don't reveal if email exists
            // Always return success message
            return NextResponse.json({
                message: "If an account exists with this email, a password reset link has been sent.",
            })
        }

        // Generate reset URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
        if (!baseUrl) {
            console.error("NEXT_PUBLIC_APP_URL not configured")
            return NextResponse.json(
                { error: "Server configuration error. Please contact support." },
                { status: 500 }
            )
        }

        const resetUrl = `${baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`}/reset-password?token=${result.token}`

        // Send email with reset link
        try {
            await sendPasswordResetEmail({
                to: email,
                resetUrl,
                userName: undefined, // We don't want to reveal user info
            })

            console.log(`Password reset email sent to ${email} from IP ${ipAddress}`)

            return NextResponse.json({
                message: "If an account exists with this email, a password reset link has been sent.",
            })
        } catch (emailError) {
            console.error("Failed to send password reset email:", emailError)

            // Log the error but still return success to user
            // In production, you might want to use a dead letter queue for retry
            return NextResponse.json({
                message: "If an account exists with this email, a password reset link has been sent.",
            })
        }
    } catch (error) {
        console.error("Password reset request error:", error)
        return NextResponse.json(
            { error: "An error occurred. Please try again later." },
            { status: 500 }
        )
    }
}

// Implement rate limiting at the route level (optional, additional protection)
export const runtime = "nodejs" // Ensure we're using Node.js runtime for crypto
export const dynamic = "force-dynamic" // Disable caching for this endpoint