import { sql } from "@/lib/db"
import { NextResponse } from "next/server"
import { getUserSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const user = await getUserSession()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const frequency = searchParams.get("frequency") // 'monthly', 'overall', or null for all

    let goals
    if (frequency) {
      goals = await sql`
        SELECT * FROM savings_goals 
        WHERE user_id = ${user.id}
        AND frequency = ${frequency}
        ORDER BY priority DESC, created_at DESC
      `
    } else {
      goals = await sql`
        SELECT * FROM savings_goals 
        WHERE user_id = ${user.id}
        ORDER BY priority DESC, created_at DESC
      `
    }

    // Get current month's income to calculate percentage-based allocations
    const now = new Date()
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const endDate = nextMonth.toISOString().split("T")[0]

    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
      AND income_date >= ${startDate}
      AND income_date < ${endDate}
    `
    const monthlyIncome = Number(incomeResult[0]?.total || 0)

    // Enhance each goal with calculated allocation amount
    const enhancedGoals = goals.map((goal: any) => {
      let calculatedAllocation = 0

      if (goal.is_active) {
        if (goal.allocation_type === 'percentage' && goal.frequency === 'monthly') {
          calculatedAllocation = (monthlyIncome * Number(goal.allocation_value)) / 100
        } else if (goal.allocation_type === 'fixed' && goal.frequency === 'monthly') {
          calculatedAllocation = Number(goal.allocation_value)
        } else if (goal.frequency === 'overall') {
          // For overall goals, allocation is how much is still needed
          const remaining = Number(goal.target_amount) - Number(goal.current_amount)
          calculatedAllocation = remaining > 0 ? remaining : 0
        }
      }

      const progress = goal.target_amount > 0
        ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
        : 0

      return {
        ...goal,
        calculated_allocation: calculatedAllocation,
        progress: Math.round(progress * 10) / 10,
        remaining: Math.max(Number(goal.target_amount) - Number(goal.current_amount), 0)
      }
    })

    // Calculate total allocations for ACTIVE goals
    const totalMonthlyAllocation = enhancedGoals
      .filter((g: any) => g.frequency === 'monthly' && g.is_active)
      .reduce((sum: number, g: any) => sum + g.calculated_allocation, 0)

    const totalOverallAllocation = enhancedGoals
      .filter((g: any) => g.frequency === 'overall' && g.is_active)
      .reduce((sum: number, g: any) => sum + g.calculated_allocation, 0)

    // Calculate OVERALL progress across ALL goals (active or not)
    const totalCurrentlySaved = enhancedGoals
      .reduce((sum: number, g: any) => sum + Number(g.current_amount || 0), 0)

    const totalTargetAmount = enhancedGoals
      .reduce((sum: number, g: any) => sum + Number(g.target_amount || 0), 0)

    const overallProgressPercentage = totalTargetAmount > 0
      ? Math.min((totalCurrentlySaved / totalTargetAmount) * 100, 100)
      : 0

    return NextResponse.json({
      goals: enhancedGoals,
      summary: {
        total_monthly_allocation: totalMonthlyAllocation,
        total_overall_allocation: totalOverallAllocation,
        total_allocation: totalMonthlyAllocation + totalOverallAllocation,
        monthly_income: monthlyIncome,
        active_goals: enhancedGoals.filter((g: any) => g.is_active).length,
        completed_goals: enhancedGoals.filter((g: any) => g.is_completed).length,
        total_currently_saved: totalCurrentlySaved,
        total_target_amount: totalTargetAmount,
        overall_progress_percentage: Math.round(overallProgressPercentage * 10) / 10
      }
    })
  } catch (error) {
    console.error("Error fetching savings goals:", error)
    return NextResponse.json({ error: "Failed to fetch savings goals" }, { status: 500 })
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
      goal_name,
      target_amount,
      current_amount,
      target_date,
      description,
      allocation_type = 'fixed',
      allocation_value,
      frequency = 'overall',
      color = 'blue',
      priority = 0,
      is_active = true
    } = body

    // Validation
    if (!goal_name || !target_amount) {
      return NextResponse.json({ error: "Goal name and target amount are required" }, { status: 400 })
    }

    if (allocation_type === 'percentage' && (allocation_value < 0 || allocation_value > 100)) {
      return NextResponse.json({ error: "Percentage must be between 0 and 100" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO savings_goals (
        user_id, goal_name, target_amount, current_amount, target_date, description,
        allocation_type, allocation_value, frequency, color, priority, is_active
      )
      VALUES (
        ${user.id}, ${goal_name}, ${target_amount}, ${current_amount || 0}, 
        ${target_date}, ${description},
        ${allocation_type}, ${allocation_value}, ${frequency}, ${color}, ${priority}, ${is_active}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating savings goal:", error)
    return NextResponse.json({ error: "Failed to create savings goal" }, { status: 500 })
  }
}