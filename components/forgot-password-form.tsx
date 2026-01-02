"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess(false)

        // Basic client-side validation
        if (!email || !email.includes("@")) {
            setError("Please enter a valid email address")
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.toLowerCase().trim() }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "An error occurred. Please try again.")
                return
            }

            setSuccess(true)
        } catch (err) {
            setError("Failed to connect. Please check your internet connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-center">Check Your Email</CardTitle>
                    <CardDescription className="text-center">
                        If an account exists with <strong>{email}</strong>, we've sent password reset instructions to
                        that address.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm text-muted-foreground bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="font-medium text-blue-900">Next Steps:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-800">
                            <li>Check your email inbox for the reset link</li>
                            <li>Check your spam folder if you don't see it</li>
                            <li>The reset link will expire in 1 hour</li>
                            <li>You can request a new link if needed</li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/login">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-sm"
                            onClick={() => {
                                setSuccess(false)
                                setEmail("")
                            }}
                        >
                            Send to a different email
                        </Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Forgot Password?</CardTitle>
                <CardDescription>
                    Enter your email address and we'll send you a secure link to reset your password
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            placeholder="you@student.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                        Having trouble? Contact support for help with your account.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}