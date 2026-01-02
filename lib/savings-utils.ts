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
        // Get active savings goals
        const savingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${userId}
      AND is_active = TRUE
      ORDER BY priority DESC
    `

        // Calculate contributions for each goal
        const contributions: { goalId: number; amount: number }[] = []

        for (const goal of savingsGoals) {
            let contributionAmount = 0

            // Only auto-contribute to monthly goals
            if (goal.frequency === 'monthly') {
                if (goal.allocation_type === 'percentage') {
                    contributionAmount = (incomeAmount * Number(goal.allocation_value || 0)) / 100
                } else if (goal.allocation_type === 'fixed') {
                    contributionAmount = Number(goal.allocation_value || 0)
                }

                if (contributionAmount > 0) {
                    contributions.push({
                        goalId: goal.id,
                        amount: contributionAmount
                    })
                }
            }
        }

        // Apply contributions to each goal
        for (const contribution of contributions) {
            await sql`
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
      `
        }

        console.log(`Auto-contributed to ${contributions.length} savings goals for user ${userId}`)
    } catch (error) {
        console.error("Error auto-contributing to savings:", error)
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