// File path: app/api/applications/[id]/route.ts

import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const {
      companyName,
      positionTitle,
      jobUrl,
      location,
      salaryRange,
      applicationStatus,
      applicationDate,
      notes,
      contactName,
      contactEmail,
      followUpDate,
    } = body

    const result = await sql`
      UPDATE job_applications 
      SET 
        company_name = COALESCE(${companyName}, company_name),
        position_title = COALESCE(${positionTitle}, position_title),
        job_url = ${jobUrl || null},
        location = ${location || null},
        salary_range = ${salaryRange || null},
        application_status = COALESCE(${applicationStatus}, application_status),
        application_date = COALESCE(${applicationDate}, application_date),
        notes = ${notes || null},
        contact_name = ${contactName || null},
        contact_email = ${contactEmail || null},
        follow_up_date = ${followUpDate || null},
        last_updated = CURRENT_TIMESTAMP
      WHERE id = ${id} AND user_id = ${user.id}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    await sql`DELETE FROM job_applications WHERE id = ${id} AND user_id = ${user.id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting application:", error)
    return NextResponse.json({ error: "Failed to delete application" }, { status: 500 })
  }
}