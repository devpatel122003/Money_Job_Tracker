import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await sql`
      DELETE FROM savings_goals 
      WHERE id = ${parseInt(id)} AND user_id = ${user.id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting savings goal:", error)
    return NextResponse.json({ error: "Failed to delete savings goal" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Handle different types of updates
    const {
      action, // 'contribute', 'update', 'toggle'
      amount, // For contribute action
      ...updateFields
    } = body

    if (action === 'contribute') {
      // Add to current_amount
      const result = await sql`
        UPDATE savings_goals 
        SET 
          current_amount = current_amount + ${amount},
          is_completed = CASE 
            WHEN current_amount + ${amount} >= target_amount THEN TRUE 
            ELSE is_completed 
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(id)} AND user_id = ${user.id}
        RETURNING *
      `
      return NextResponse.json(result[0])
    }

    if (action === 'toggle') {
      // Toggle is_active status
      const result = await sql`
        UPDATE savings_goals 
        SET 
          is_active = NOT is_active,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${parseInt(id)} AND user_id = ${user.id}
        RETURNING *
      `
      return NextResponse.json(result[0])
    }

    // General update - build dynamic query
    const allowedFields = [
      'goal_name', 'target_amount', 'current_amount', 'target_date', 'description',
      'allocation_type', 'allocation_value', 'frequency', 'color', 'priority', 'is_active', 'is_completed'
    ]

    const updates = Object.keys(updateFields)
      .filter(key => allowedFields.includes(key))
      .reduce((acc, key) => {
        acc[key] = updateFields[key]
        return acc
      }, {} as any)

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    // Build the SET clause dynamically
    const setClause = Object.keys(updates)
      .map((key) => `${key} = $${key}`)
      .join(', ')

    const result = await sql`
      UPDATE savings_goals 
      SET ${sql.unsafe(setClause)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${parseInt(id)} AND user_id = ${user.id}
      RETURNING *
    `.values(updates)

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating savings goal:", error)
    return NextResponse.json({ error: "Failed to update savings goal" }, { status: 500 })
  }
}