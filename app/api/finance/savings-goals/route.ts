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

    // Get current month date range
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0]
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const endDate = nextMonth.toISOString().split("T")[0]

    // Get current month's income
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
      AND income_date >= ${startDate}
      AND income_date < ${endDate}
    `
    const monthlyIncome = Number(incomeResult[0]?.total || 0)

    // Update month_start_amount for goals if we've entered a new month
    await sql`
      UPDATE savings_goals
      SET 
        month_start_amount = current_amount,
        month_start_date = ${currentMonthStartStr}::DATE
      WHERE user_id = ${user.id}
      AND (
        month_start_date IS NULL 
        OR month_start_date < ${currentMonthStartStr}::DATE
      )
    `

    // Enhance each goal with calculated values
    const enhancedGoals = goals.map((goal: any) => {
      let calculatedAllocation = 0
      let monthlyContribution = 0

      // Calculate monthly contribution (what was actually added this month)
      if (goal.frequency === 'monthly') {
        // Monthly contribution = current_amount - month_start_amount
        monthlyContribution = Math.max(
          Number(goal.current_amount || 0) - Number(goal.month_start_amount || 0),
          0
        )
      }

      // Only calculate allocation for ACTIVE and INCOMPLETE goals
      if (goal.is_active && !goal.is_completed) {
        if (goal.frequency === 'monthly') {
          // For monthly goals: show actual contribution made this month
          calculatedAllocation = monthlyContribution
        } else if (goal.frequency === 'overall') {
          // For overall goals: show income-based allocation
          if (goal.allocation_type === 'percentage' && goal.allocation_value) {
            calculatedAllocation = (monthlyIncome * Number(goal.allocation_value)) / 100
          } else if (goal.allocation_type === 'fixed' && goal.allocation_value) {
            calculatedAllocation = Number(goal.allocation_value)
          } else {
            // Default 5% per income for overall goals without specific allocation
            const remaining = Number(goal.target_amount) - Number(goal.current_amount)
            if (remaining > 0) {
              calculatedAllocation = Math.min((monthlyIncome * 5) / 100, remaining)
            }
          }
        }
      }

      // Progress calculation uses current_amount regardless of active status
      const progress = goal.target_amount > 0
        ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
        : 0

      // Calculate monthly target and progress for monthly goals
      let monthlyTarget = 0
      let monthlyProgress = 0

      if (goal.frequency === 'monthly') {
        if (goal.allocation_type === 'percentage') {
          monthlyTarget = (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        } else if (goal.allocation_type === 'fixed') {
          monthlyTarget = Number(goal.allocation_value || 0)
        }

        monthlyProgress = monthlyTarget > 0
          ? Math.min((monthlyContribution / monthlyTarget) * 100, 100)
          : 0
      }

      return {
        ...goal,
        calculated_allocation: calculatedAllocation,  // Actual monthly contribution or expected overall allocation
        monthly_contribution: monthlyContribution,     // How much added this month
        monthly_target: monthlyTarget,                 // Expected target for this month
        monthly_progress: Math.round(monthlyProgress * 10) / 10,  // Progress toward monthly target
        progress: Math.round(progress * 10) / 10,     // Overall progress toward final target
        remaining: Math.max(Number(goal.target_amount) - Number(goal.current_amount), 0)
      }
    })

    // Calculate total allocations for ACTIVE and INCOMPLETE goals only
    const totalMonthlyAllocation = enhancedGoals
      .filter((g: any) => g.frequency === 'monthly' && g.is_active && !g.is_completed)
      .reduce((sum: number, g: any) => sum + g.calculated_allocation, 0)

    const totalOverallAllocation = enhancedGoals
      .filter((g: any) => g.frequency === 'overall' && g.is_active && !g.is_completed)
      .reduce((sum: number, g: any) => sum + g.calculated_allocation, 0)

    // Calculate OVERALL progress across ALL goals
    const totalCurrentlySaved = enhancedGoals
      .reduce((sum: number, g: any) => sum + Number(g.current_amount || 0), 0)

    const totalTargetAmount = enhancedGoals
      .reduce((sum: number, g: any) => sum + Number(g.target_amount || 0), 0)

    const overallProgressPercentage = totalTargetAmount > 0
      ? Math.min((totalCurrentlySaved / totalTargetAmount) * 100, 100)
      : 0

    console.log('[SAVINGS-GOALS] Summary calculated:')
    console.log(`  - Total currently saved: $${totalCurrentlySaved}`)
    console.log(`  - Total target: $${totalTargetAmount}`)
    console.log(`  - Overall progress: ${overallProgressPercentage.toFixed(1)}%`)
    console.log(`  - Monthly contributions this month: $${totalMonthlyAllocation}`)
    console.log(`  - Active goals: ${enhancedGoals.filter((g: any) => g.is_active && !g.is_completed).length}`)
    console.log(`  - Total goals: ${enhancedGoals.length}`)

    return NextResponse.json({
      goals: enhancedGoals,
      summary: {
        total_monthly_allocation: totalMonthlyAllocation,  // Actual monthly contributions
        total_overall_allocation: totalOverallAllocation,  // Expected overall allocations
        total_allocation: totalMonthlyAllocation + totalOverallAllocation,
        monthly_income: monthlyIncome,
        active_goals: enhancedGoals.filter((g: any) => g.is_active && !g.is_completed).length,
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

    // Set month_start_amount to current_amount for new goals
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthStartStr = monthStart.toISOString().split('T')[0]

    const result = await sql`
      INSERT INTO savings_goals (
        user_id, goal_name, target_amount, current_amount, target_date, description,
        allocation_type, allocation_value, frequency, color, priority, is_active,
        month_start_amount, month_start_date
      )
      VALUES (
        ${user.id}, ${goal_name}, ${target_amount}, ${current_amount || 0}, 
        ${target_date}, ${description},
        ${allocation_type}, ${allocation_value}, ${frequency}, ${color}, ${priority}, ${is_active},
        ${current_amount || 0}, ${monthStartStr}
      )
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error creating savings goal:", error)
    return NextResponse.json({ error: "Failed to create savings goal" }, { status: 500 })
  }
}