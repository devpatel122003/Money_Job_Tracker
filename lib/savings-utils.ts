import { sql } from "@/lib/db"

/**
 * Auto-contribute to savings goals when income is added
 * This function allocates income to active monthly savings goals automatically
 * 
 * @param userId - The user's ID
 * @param incomeAmount - The amount of income added
 * @param incomeDate - The date of the income (to determine which goals are active)
 */
export async function autoContributeToSavings(
    userId: number,
    incomeAmount: number,
    incomeDate: string
): Promise<void> {
    try {
        console.log('='.repeat(50))
        console.log(`[AUTO-CONTRIBUTE] Starting for user ${userId}`)
        console.log(`[AUTO-CONTRIBUTE] Income amount: $${incomeAmount}`)
        console.log(`[AUTO-CONTRIBUTE] Income date: ${incomeDate}`)

        // Get active savings goals
        const savingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${userId}
      AND is_active = TRUE
      ORDER BY priority DESC
    `

        console.log(`[AUTO-CONTRIBUTE] Found ${savingsGoals.length} active goals`)

        if (savingsGoals.length === 0) {
            console.log('[AUTO-CONTRIBUTE] No active goals found, skipping auto-contribute')
            return
        }

        // Log each goal found
        savingsGoals.forEach((goal: any) => {
            console.log(`[AUTO-CONTRIBUTE] Goal: ${goal.goal_name}`)
            console.log(`  - Frequency: ${goal.frequency}`)
            console.log(`  - Allocation Type: ${goal.allocation_type}`)
            console.log(`  - Allocation Value: ${goal.allocation_value}`)
            console.log(`  - Current Amount: ${goal.current_amount}`)
            console.log(`  - Is Active: ${goal.is_active}`)
        })

        // Calculate contributions for each goal
        const contributions: { goalId: number; goalName: string; amount: number }[] = []

        for (const goal of savingsGoals) {
            let contributionAmount = 0

            // Only auto-contribute to monthly goals
            if (goal.frequency === 'monthly') {
                if (goal.allocation_type === 'percentage') {
                    contributionAmount = (incomeAmount * Number(goal.allocation_value || 0)) / 100
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Percentage ${goal.allocation_value}% of $${incomeAmount} = $${contributionAmount}`)
                } else if (goal.allocation_type === 'fixed') {
                    contributionAmount = Number(goal.allocation_value || 0)
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Fixed amount = $${contributionAmount}`)
                }

                if (contributionAmount > 0) {
                    contributions.push({
                        goalId: goal.id,
                        goalName: goal.goal_name,
                        amount: contributionAmount
                    })
                }
            } else {
                console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Skipping (frequency=${goal.frequency}, only monthly goals auto-contribute)`)
            }
        }

        console.log(`[AUTO-CONTRIBUTE] Will contribute to ${contributions.length} goals`)

        // Apply contributions to each goal
        for (const contribution of contributions) {
            console.log(`[AUTO-CONTRIBUTE] Updating ${contribution.goalName} with +$${contribution.amount}`)

            const result = await sql`
        UPDATE savings_goals
        SET 
          current_amount = current_amount + ${contribution.amount},
          is_completed = CASE 
            WHEN current_amount + ${contribution.amount} >= target_amount THEN TRUE 
            ELSE is_completed 
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${contribution.goalId}
        AND user_id = ${userId}
        RETURNING id, goal_name, current_amount, target_amount, is_completed
      `

            if (result && result.length > 0) {
                console.log(`[AUTO-CONTRIBUTE] ✅ ${result[0].goal_name}:`)
                console.log(`  - New current_amount: $${result[0].current_amount}`)
                console.log(`  - Target: $${result[0].target_amount}`)
                console.log(`  - Completed: ${result[0].is_completed}`)
            } else {
                console.log(`[AUTO-CONTRIBUTE] ❌ Failed to update goal ${contribution.goalName}`)
            }
        }

        console.log(`[AUTO-CONTRIBUTE] ✅ Successfully contributed to ${contributions.length} savings goals`)
        console.log('='.repeat(50))
    } catch (error) {
        console.error("[AUTO-CONTRIBUTE] ❌ Error:", error)
        // Don't throw - we don't want to fail income creation if savings fails
    }
}

/**
 * Calculate total savings allocation for display purposes
 * Shows how much WILL BE allocated (not already allocated)
 */
export async function calculateSavingsAllocation(
    userId: number,
    monthlyIncome: number
): Promise<{
    monthlySavingsAllocation: number
    overallSavingsAllocation: number
    totalSavingsAllocation: number
}> {
    const savingsGoals = await sql`
    SELECT * FROM savings_goals
    WHERE user_id = ${userId}
    AND is_active = TRUE
  `

    let monthlySavingsAllocation = 0
    let overallSavingsAllocation = 0

    savingsGoals.forEach((goal: any) => {
        if (goal.frequency === 'monthly' && goal.allocation_type === 'fixed') {
            monthlySavingsAllocation += Number(goal.allocation_value || 0)
        } else if (goal.frequency === 'monthly' && goal.allocation_type === 'percentage') {
            monthlySavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        } else if (goal.frequency === 'overall') {
            const remaining = Number(goal.target_amount) - Number(goal.current_amount)
            if (remaining > 0) {
                overallSavingsAllocation += remaining
            }
        }
    })

    return {
        monthlySavingsAllocation,
        overallSavingsAllocation,
        totalSavingsAllocation: monthlySavingsAllocation + overallSavingsAllocation
    }
}