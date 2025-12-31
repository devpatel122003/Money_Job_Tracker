// File path: app/api/applications/route.ts

import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const applications = await sql`
      SELECT * FROM job_applications 
      WHERE user_id = ${user.id}
      ORDER BY application_date DESC
    `
    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      positionTitle,
      jobUrl,
      location,
      salaryRange,
      applicationStatus = "applied",
      applicationDate,
      notes,
      contactName,
      contactEmail,
      followUpDate,
    } = body

    const result = await sql`
      INSERT INTO job_applications (
        user_id, company_name, position_title, job_url, location,
        salary_range, application_status, application_date, notes,
        contact_name, contact_email, follow_up_date
      ) VALUES (
        ${user.id}, ${companyName}, ${positionTitle}, ${jobUrl || null}, ${location || null},
        ${salaryRange || null}, ${applicationStatus}, ${applicationDate || null}, ${notes || null},
        ${contactName || null}, ${contactEmail || null}, ${followUpDate || null}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Failed to create application" }, { status: 500 })
  }
}