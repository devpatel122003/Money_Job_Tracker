"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { PiggyBank, TrendingUp, Target, Eye, EyeOff } from "lucide-react"
import { useState } from "react"

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
    onManageClick: () => void
}

export function SavingsOverviewCard({
    summary,
    totalBalance,
    availableBalance,
    goals,
    onManageClick,
}: SavingsOverviewCardProps) {
    const [showDetails, setShowDetails] = useState(false)

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
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <PiggyBank className="h-5 w-5 text-blue-600" />
                        Savings Overview
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDetails(!showDetails)}
                        className="h-8 w-8 p-0"
                    >
                        {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs text-muted-foreground mb-1">Total Allocated</p>
                        <p className="text-xl font-bold text-blue-600">
                            ${summary.total_allocation.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-100">
                        <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
                        <p className="text-xl font-bold text-green-600">
                            ${availableBalance.toFixed(2)}
                        </p>
                    </div>
                </div>

                {/* Savings Rate */}
                {summary.monthly_income > 0 && summary.total_monthly_allocation > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium">Savings Rate</span>
                            </div>
                            <span className="text-sm font-bold text-purple-600">{savingsPercentage}%</span>
                        </div>
                        <Progress value={parseFloat(savingsPercentage)} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            ${summary.total_monthly_allocation.toFixed(2)} of ${summary.monthly_income.toFixed(2)} monthly income
                        </p>
                    </div>
                )}

                {/* Overall Progress */}
                {totalSavingsTarget > 0 && (
                    <div className="bg-white p-3 rounded-lg border border-orange-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium">Overall Progress</span>
                            </div>
                            <span className="text-sm font-bold text-orange-600">{overallProgress.toFixed(1)}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                            ${totalSavingsProgress.toFixed(2)} of ${totalSavingsTarget.toFixed(2)} total saved
                        </p>
                    </div>
                )}

                {/* Details */}
                {showDetails && (
                    <div className="space-y-2 pt-2 border-t">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Monthly Allocation:</span>
                            <span className="font-medium">${summary.total_monthly_allocation.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Overall Goals Remaining:</span>
                            <span className="font-medium">${summary.total_overall_allocation.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Saved:</span>
                            <span className="font-medium text-green-600">${totalSavingsProgress.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Active Goals:</span>
                            <span className="font-medium">{summary.active_goals}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completed Goals:</span>
                            <span className="font-medium text-green-600">{summary.completed_goals}</span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <Button
                    onClick={onManageClick}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                >
                    Manage Savings Goals
                </Button>
            </CardContent>
        </Card>
    )
}