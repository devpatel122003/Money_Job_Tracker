import { NextResponse } from "next/server"
import { createUser, setUserSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password, name, rememberMe } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain an uppercase letter" }, { status: 400 })
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({ error: "Password must contain a lowercase letter" }, { status: 400 })
    }

    if (!/\d/.test(password)) {
      return NextResponse.json({ error: "Password must contain a number" }, { status: 400 })
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return NextResponse.json({ error: "Password must contain a special character" }, { status: 400 })
    }

    const user = await createUser(email, password, name)

    await setUserSession(user.id, rememberMe)

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    if (error?.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 })
  }
}
