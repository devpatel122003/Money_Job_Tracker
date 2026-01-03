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
    const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const endDate = nextMonth.toISOString().split("T")[0]

    // Get current month's income to calculate percentage-based allocations
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM income
      WHERE user_id = ${user.id}
      AND income_date >= ${startDate}
      AND income_date < ${endDate}
    `
    const monthlyIncome = Number(incomeResult[0]?.total || 0)

    // For each goal, calculate monthly contributions
    // We'll need to track what was contributed this month
    const goalsWithMonthlyContributions = await Promise.all(
      goals.map(async (goal: any) => {
        let monthlyContribution = 0

        // Calculate how much was contributed to this goal in the current month
        // by looking at income in this month and applying the goal's allocation
        if (goal.is_active && !goal.is_completed && goal.frequency === 'monthly') {
          // Get all income records for this month
          const monthlyIncomeRecords = await sql`
            SELECT amount, income_date
            FROM income
            WHERE user_id = ${user.id}
            AND income_date >= ${startDate}
            AND income_date < ${endDate}
            ORDER BY income_date ASC
          `

          // Calculate contribution from each income based on goal's allocation settings
          for (const incomeRecord of monthlyIncomeRecords) {
            const incomeAmount = Number(incomeRecord.amount)
            let contribution = 0

            if (goal.allocation_type === 'percentage') {
              contribution = (incomeAmount * Number(goal.allocation_value)) / 100
            } else if (goal.allocation_type === 'fixed') {
              contribution = Number(goal.allocation_value)
            }

            monthlyContribution += contribution
          }
        }

        return {
          ...goal,
          monthly_contribution: monthlyContribution
        }
      })
    )

    // Enhance each goal with calculated allocation amount
    const enhancedGoals = goalsWithMonthlyContributions.map((goal: any) => {
      let calculatedAllocation = 0

      // Only calculate allocation for ACTIVE and INCOMPLETE goals
      if (goal.is_active && !goal.is_completed) {
        if (goal.frequency === 'monthly') {
          // For monthly goals: show the ACTUAL contribution made this month
          // This is the "progress" for the current month
          calculatedAllocation = goal.monthly_contribution || 0
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
      // If paused (is_active = false) or completed, calculatedAllocation stays 0

      // Progress calculation uses current_amount regardless of active status
      const progress = goal.target_amount > 0
        ? Math.min((Number(goal.current_amount) / Number(goal.target_amount)) * 100, 100)
        : 0

      // For monthly goals, also calculate monthly progress (this month's contribution vs monthly target)
      let monthlyProgress = 0
      if (goal.frequency === 'monthly' && goal.allocation_type === 'percentage') {
        const monthlyTarget = (monthlyIncome * Number(goal.allocation_value)) / 100
        monthlyProgress = monthlyTarget > 0
          ? Math.min((goal.monthly_contribution / monthlyTarget) * 100, 100)
          : 0
      } else if (goal.frequency === 'monthly' && goal.allocation_type === 'fixed') {
        const monthlyTarget = Number(goal.allocation_value)
        monthlyProgress = monthlyTarget > 0
          ? Math.min((goal.monthly_contribution / monthlyTarget) * 100, 100)
          : 0
      }

      return {
        ...goal,
        calculated_allocation: calculatedAllocation,  // For monthly: actual contribution this month; for overall: allocation amount
        progress: Math.round(progress * 10) / 10,  // Overall progress toward target
        monthly_progress: Math.round(monthlyProgress * 10) / 10,  // This month's progress (for monthly goals)
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

    // Calculate OVERALL progress across ALL goals (active, paused, and completed)
    // This ensures paused goals still show their saved progress
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
    console.log(`  - Active goals: ${enhancedGoals.filter((g: any) => g.is_active && !g.is_completed).length}`)
    console.log(`  - Completed goals: ${enhancedGoals.filter((g: any) => g.is_completed).length}`)
    console.log(`  - Total goals: ${enhancedGoals.length}`)

    return NextResponse.json({
      goals: enhancedGoals,
      summary: {
        total_monthly_allocation: totalMonthlyAllocation,  // Actual contributions this month for monthly goals
        total_overall_allocation: totalOverallAllocation,  // Expected allocation for overall goals
        total_allocation: totalMonthlyAllocation + totalOverallAllocation,
        monthly_income: monthlyIncome,
        active_goals: enhancedGoals.filter((g: any) => g.is_active && !g.is_completed).length,
        completed_goals: enhancedGoals.filter((g: any) => g.is_completed).length,
        total_currently_saved: totalCurrentlySaved,  // ALL goals (active + paused + completed)
        total_target_amount: totalTargetAmount,  // ALL goals (active + paused + completed)
        overall_progress_percentage: Math.round(overallProgressPercentage * 10) / 10  // ALL goals
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