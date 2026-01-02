"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface PasswordRequirement {
    label: string
    valid: boolean
}

function PasswordStrength({ password }: { password: string }) {
    const requirements: PasswordRequirement[] = [
        { label: "At least 8 characters", valid: password.length >= 8 },
        { label: "Contains uppercase letter", valid: /[A-Z]/.test(password) },
        { label: "Contains lowercase letter", valid: /[a-z]/.test(password) },
        { label: "Contains number", valid: /\d/.test(password) },
        { label: "Contains special character", valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ]

    if (!password) return null

    const validCount = requirements.filter((r) => r.valid).length
    const strength =
        validCount === 5 ? "strong" : validCount >= 3 ? "medium" : "weak"

    return (
        <div className="space-y-2 mt-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strength === "strong"
                                ? "w-full bg-green-600"
                                : strength === "medium"
                                    ? "w-2/3 bg-yellow-600"
                                    : "w-1/3 bg-red-600"
                            }`}
                    />
                </div>
                <span
                    className={`text-xs font-medium ${strength === "strong"
                            ? "text-green-600"
                            : strength === "medium"
                                ? "text-yellow-600"
                                : "text-red-600"
                        }`}
                >
                    {strength === "strong" ? "Strong" : strength === "medium" ? "Medium" : "Weak"}
                </span>
            </div>
            <div className="space-y-1">
                {requirements.map((req, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        {req.valid ? (
                            <Check className="h-3 w-3 text-green-600" />
                        ) : (
                            <X className="h-3 w-3 text-gray-400" />
                        )}
                        <span className={req.valid ? "text-green-600" : "text-muted-foreground"}>
                            {req.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. Please request a new password reset.")
        }
    }, [token])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            setLoading(false)
            return
        }

        // Client-side validation
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            setLoading(false)
            return
        }

        try {
            const response = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || "Failed to reset password. Please try again.")
                return
            }

            setSuccess(true)

            // Log out the user (clear their session)
            await fetch("/api/auth/logout", { method: "POST" }).catch(() => {
                // Ignore logout errors
            })

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push("/login")
                router.refresh()
            }, 3000)
        } catch (err) {
            setError("Failed to connect. Please check your internet connection and try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="flex items-center justify-center mb-4">
                        <div className="rounded-full bg-red-100 p-3">
                            <AlertCircle className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <CardTitle className="text-center">Invalid Reset Link</CardTitle>
                    <CardDescription className="text-center">
                        This password reset link is invalid or has expired.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="font-medium text-yellow-900 mb-2">Common Reasons:</p>
                        <ul className="list-disc list-inside space-y-1 text-yellow-800">
                            <li>The link has expired (links expire after 1 hour)</li>
                            <li>The link has already been used</li>
                            <li>The link was not copied correctly</li>
                        </ul>
                    </div>

                    <Button asChild className="w-full">
                        <Link href="/forgot-password">Request New Reset Link</Link>
                    </Button>
                    <div className="text-center">
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        )
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
                    <CardTitle className="text-center">Password Reset Successful!</CardTitle>
                    <CardDescription className="text-center">
                        Your password has been successfully reset. You've been logged out for security. Redirecting to login...
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Reset Your Password</CardTitle>
                <CardDescription>
                    Choose a strong password that you haven't used before
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <PasswordStrength password={password} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                required
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                autoComplete="new-password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {confirmPassword && password !== confirmPassword && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                <X className="h-3 w-3" />
                                Passwords do not match
                            </p>
                        )}
                        {confirmPassword && password === confirmPassword && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Passwords match
                            </p>
                        )}
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
                                Resetting Password...
                            </>
                        ) : (
                            "Reset Password"
                        )}
                    </Button>

                    <div className="text-center">
                        <Link href="/login" className="text-sm text-primary hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                        After resetting, you'll be logged out and can log in with your new password.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}