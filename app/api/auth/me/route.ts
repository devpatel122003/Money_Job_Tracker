import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return NextResponse.json({ error: "Failed to check auth" }, { status: 500 })
  }
}
