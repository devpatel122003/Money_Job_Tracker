import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getUserSession } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        await sql`
      DELETE FROM planned_expenses 
      WHERE id = ${id} AND user_id = ${user.id}
    `

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting planned expense:", error)
        return NextResponse.json({ error: "Failed to delete planned expense" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { is_paid } = body

        const result = await sql`
      UPDATE planned_expenses 
      SET is_paid = ${is_paid}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

        return NextResponse.json(result[0])
    } catch (error) {
        console.error("Error updating planned expense:", error)
        return NextResponse.json({ error: "Failed to update planned expense" }, { status: 500 })
    }
}