import { NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { getUserSession } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const id = params.id

        await query(`DELETE FROM planned_expenses WHERE id = $1 AND user_id = $2`, [id, user.id])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting planned expense:", error)
        return NextResponse.json({ error: "Failed to delete planned expense" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUserSession()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const id = params.id
        const body = await request.json()
        const { is_paid } = body

        const result = await query(
            `UPDATE planned_expenses 
       SET is_paid = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 AND user_id = $3 
       RETURNING *`,
            [is_paid, id, user.id]
        )

        return NextResponse.json(result.rows[0])
    } catch (error) {
        console.error("Error updating planned expense:", error)
        return NextResponse.json({ error: "Failed to update planned expense" }, { status: 500 })
    }
}