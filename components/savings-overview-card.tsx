"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Target } from "lucide-react"

interface SavingsOverviewCardProps {
    summary: {
        total_monthly_allocation: number
        total_overall_allocation: number
        total_allocation: number
        monthly_income: number
        active_goals: number
        completed_goals: number
        total_currently_saved?: number
        total_target_amount?: number
        overall_progress_percentage?: number
    }
    totalBalance: number
    availableBalance: number
    goals: any[]
    onManageClick?: () => void
}

export function SavingsOverviewCard({
    summary,
    totalBalance,
    availableBalance,
    goals,
    onManageClick,
}: SavingsOverviewCardProps) {
    const savingsPercentage = summary.monthly_income > 0
        ? ((summary.total_monthly_allocation / summary.monthly_income) * 100).toFixed(1)
        : "0"

    // Use summary values if available, otherwise calculate from goals
    const totalSavingsProgress = summary.total_currently_saved ?? goals.reduce((sum, goal) => {
        return sum + Number(goal.current_amount || 0)
    }, 0)

    const totalSavingsTarget = summary.total_target_amount ?? goals.reduce((sum, goal) => {
        return sum + Number(goal.target_amount || 0)
    }, 0)

    const overallProgress = summary.overall_progress_percentage ?? (
        totalSavingsTarget > 0
            ? Math.min((totalSavingsProgress / totalSavingsTarget) * 100, 100)
            : 0
    )

    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Allocated */}
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Total Allocated
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                        ${summary.total_allocation.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {summary.active_goals} active goal{summary.active_goals !== 1 ? 's' : ''}
                    </p>
                </CardContent>
            </Card>

            {/* Available Balance */}
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Available Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={`text-3xl font-bold ${availableBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${availableBalance.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        After savings & planned
                    </p>
                </CardContent>
            </Card>

            {/* Savings Rate */}
            {summary.monthly_income > 0 && summary.total_monthly_allocation > 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            Savings Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-600">
                            {savingsPercentage}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ${summary.total_monthly_allocation.toFixed(2)} monthly
                        </p>
                        <Progress value={parseFloat(savingsPercentage)} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            )}

            {/* Overall Progress */}
            {totalSavingsTarget > 0 && (
                <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4 text-orange-600" />
                            Overall Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">
                            {overallProgress.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ${totalSavingsProgress.toFixed(2)} of ${totalSavingsTarget.toFixed(2)}
                        </p>
                        <Progress value={overallProgress} className="h-2 mt-2" />
                    </CardContent>
                </Card>
            )}
        </div>
    )
}