import { sql } from "@/lib/db"

/**
 * Auto-contribute to savings goals when income is added
 * This function allocates income to ALL ACTIVE savings goals automatically
 * 
 * NEW LOGIC:
 * - All active goals (both monthly and overall) receive contributions from income
 * - Monthly goals: use their allocation_type (percentage or fixed)
 * - Overall goals: receive contributions based on percentage if specified, or proportionally
 * - Inactive goals (is_active=false) do NOT receive any contributions
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

        // Get ALL active savings goals (both monthly and overall)
        const savingsGoals = await sql`
      SELECT * FROM savings_goals
      WHERE user_id = ${userId}
      AND is_active = TRUE
      AND is_completed = FALSE
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

            // Handle monthly frequency goals
            if (goal.frequency === 'monthly') {
                if (goal.allocation_type === 'percentage') {
                    contributionAmount = (incomeAmount * Number(goal.allocation_value || 0)) / 100
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Monthly ${goal.allocation_value}% of $${incomeAmount} = $${contributionAmount}`)
                } else if (goal.allocation_type === 'fixed') {
                    contributionAmount = Number(goal.allocation_value || 0)
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Fixed monthly amount = $${contributionAmount}`)
                }
            }
            // Handle overall frequency goals - NEW LOGIC
            else if (goal.frequency === 'overall') {
                // For overall goals, contribute based on allocation if specified
                if (goal.allocation_type === 'percentage' && goal.allocation_value) {
                    contributionAmount = (incomeAmount * Number(goal.allocation_value || 0)) / 100
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Overall ${goal.allocation_value}% of $${incomeAmount} = $${contributionAmount}`)
                } else if (goal.allocation_type === 'fixed' && goal.allocation_value) {
                    contributionAmount = Number(goal.allocation_value || 0)
                    console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Fixed overall amount = $${contributionAmount}`)
                } else {
                    // If no allocation specified, contribute proportionally based on remaining
                    // This ensures overall goals still benefit from income
                    const remaining = Number(goal.target_amount) - Number(goal.current_amount)
                    if (remaining > 0) {
                        // Default: allocate 5% of income to each overall goal without specific allocation
                        contributionAmount = (incomeAmount * 5) / 100
                        console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Default 5% of $${incomeAmount} = $${contributionAmount}`)
                    }
                }
            }

            // Only add contribution if amount is positive and doesn't exceed target
            if (contributionAmount > 0) {
                const remaining = Number(goal.target_amount) - Number(goal.current_amount)
                // Cap contribution at remaining amount
                const finalContribution = Math.min(contributionAmount, remaining)

                if (finalContribution > 0) {
                    contributions.push({
                        goalId: goal.id,
                        goalName: goal.goal_name,
                        amount: finalContribution
                    })

                    if (finalContribution < contributionAmount) {
                        console.log(`[AUTO-CONTRIBUTE] ${goal.goal_name}: Capped contribution from $${contributionAmount} to $${finalContribution} (remaining: $${remaining})`)
                    }
                }
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
    AND is_completed = FALSE
  `

    let monthlySavingsAllocation = 0
    let overallSavingsAllocation = 0

    savingsGoals.forEach((goal: any) => {
        if (goal.frequency === 'monthly' && goal.allocation_type === 'fixed') {
            monthlySavingsAllocation += Number(goal.allocation_value || 0)
        } else if (goal.frequency === 'monthly' && goal.allocation_type === 'percentage') {
            monthlySavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
        } else if (goal.frequency === 'overall') {
            // For overall goals, calculate allocation based on their settings
            if (goal.allocation_type === 'percentage' && goal.allocation_value) {
                overallSavingsAllocation += (monthlyIncome * Number(goal.allocation_value || 0)) / 100
            } else if (goal.allocation_type === 'fixed' && goal.allocation_value) {
                overallSavingsAllocation += Number(goal.allocation_value || 0)
            } else {
                // Default 5% allocation if not specified
                const remaining = Number(goal.target_amount) - Number(goal.current_amount)
                if (remaining > 0) {
                    overallSavingsAllocation += Math.min((monthlyIncome * 5) / 100, remaining)
                }
            }
        }
    })

    return {
        monthlySavingsAllocation,
        overallSavingsAllocation,
        totalSavingsAllocation: monthlySavingsAllocation + overallSavingsAllocation
    }
}