"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
    MoreVertical,
    Trash2,
    Edit,
    Power,
    PowerOff,
    DollarSign,
    Calendar,
    TrendingUp,
    Target as TargetIcon,
    Plus
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"

interface SavingsGoalsListProps {
    goals: any[]
    onEdit: (goal: any) => void
    onRefresh: () => void
}

export function SavingsGoalsList({ goals, onEdit, onRefresh }: SavingsGoalsListProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [contributeDialogOpen, setContributeDialogOpen] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<any>(null)
    const [contributeAmount, setContributeAmount] = useState("")
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!selectedGoal) return

        setLoading(true)
        try {
            const response = await fetch(`/api/finance/savings-goals/${selectedGoal.id}`, {
                method: "DELETE",
            })

            if (response.ok) {
                onRefresh()
                setDeleteDialogOpen(false)
            } else {
                alert("Failed to delete goal")
            }
        } catch (error) {
            console.error("Error deleting goal:", error)
            alert("Failed to delete goal")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleActive = async (goal: any) => {
        setLoading(true)
        try {
            const response = await fetch(`/api/finance/savings-goals/${goal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "toggle" }),
            })

            if (response.ok) {
                onRefresh()
            } else {
                alert("Failed to update goal")
            }
        } catch (error) {
            console.error("Error updating goal:", error)
            alert("Failed to update goal")
        } finally {
            setLoading(false)
        }
    }

    const handleContribute = async () => {
        if (!selectedGoal || !contributeAmount) return

        setLoading(true)
        try {
            const response = await fetch(`/api/finance/savings-goals/${selectedGoal.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "contribute",
                    amount: parseFloat(contributeAmount)
                }),
            })

            if (response.ok) {
                onRefresh()
                setContributeDialogOpen(false)
                setContributeAmount("")
            } else {
                alert("Failed to contribute")
            }
        } catch (error) {
            console.error("Error contributing:", error)
            alert("Failed to contribute")
        } finally {
            setLoading(false)
        }
    }

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500",
            pink: "bg-pink-500",
            indigo: "bg-indigo-500",
            red: "bg-red-500",
            yellow: "bg-yellow-500",
        }
        return colors[color] || colors.blue
    }

    const getBorderColor = (color: string) => {
        const colors: Record<string, string> = {
            blue: "border-blue-200",
            green: "border-green-200",
            purple: "border-purple-200",
            orange: "border-orange-200",
            pink: "border-pink-200",
            indigo: "border-indigo-200",
            red: "border-red-200",
            yellow: "border-yellow-200",
        }
        return colors[color] || colors.blue
    }

    // REMOVED: Empty state - let parent component handle it
    // This prevents duplicate empty states

    return (
        <>
            <div className="grid gap-4 md:grid-cols-2">
                {goals.map((goal) => (
                    <Card key={goal.id} className={`border-2 ${getBorderColor(goal.color)}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`h-3 w-3 rounded-full ${getColorClass(goal.color)}`} />
                                        <CardTitle className="text-lg">{goal.goal_name}</CardTitle>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-2">
                                        <Badge variant="outline">
                                            {goal.frequency === "monthly" ? "Monthly" : "Overall Goal"}
                                        </Badge>
                                        {!goal.is_active && (
                                            <Badge variant="outline" className="border-orange-500 text-orange-700">
                                                ⏸ Paused
                                            </Badge>
                                        )}
                                        {goal.is_completed && (
                                            <Badge variant="outline" className="border-purple-500 text-purple-700">
                                                ✓ Completed
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => {
                                            setSelectedGoal(goal)
                                            setContributeDialogOpen(true)
                                        }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Contribute
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onEdit(goal)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleActive(goal)}>
                                            {goal.is_active ? (
                                                <>
                                                    <PowerOff className="h-4 w-4 mr-2" />
                                                    Pause
                                                </>
                                            ) : (
                                                <>
                                                    <Power className="h-4 w-4 mr-2" />
                                                    Activate
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                setSelectedGoal(goal)
                                                setDeleteDialogOpen(true)
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Overall Progress */}
                            <div>
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-muted-foreground">Overall Progress</span>
                                    <span className="font-medium">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-2" />
                                <div className="flex justify-between text-sm mt-1">
                                    <span className="font-medium">${Number(goal.current_amount).toFixed(2)}</span>
                                    <span className="text-muted-foreground">${Number(goal.target_amount).toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Monthly Progress - Only for monthly goals */}
                            {goal.frequency === "monthly" && goal.is_active && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">This Month</span>
                                        </div>
                                        {goal.monthly_progress !== undefined && (
                                            <span className="text-sm font-bold text-blue-600">
                                                {goal.monthly_progress}%
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold text-blue-600">
                                        ${goal.calculated_allocation?.toFixed(2) || "0.00"}
                                        {goal.allocation_type === "percentage" && (
                                            <span className="text-sm font-normal text-blue-700 ml-1">
                                                of {goal.allocation_value}% target
                                            </span>
                                        )}
                                        {goal.allocation_type === "fixed" && (
                                            <span className="text-sm font-normal text-blue-700 ml-1">
                                                of ${Number(goal.allocation_value).toFixed(2)} target
                                            </span>
                                        )}
                                    </p>
                                    {goal.monthly_progress !== undefined && (
                                        <Progress value={goal.monthly_progress} className="h-1.5 mt-2" />
                                    )}
                                </div>
                            )}

                            {/* Overall Goals Allocation Info */}
                            {goal.frequency === "overall" && goal.is_active && goal.calculated_allocation > 0 && (
                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-900">Expected Allocation</span>
                                    </div>
                                    <p className="text-lg font-bold text-green-600">
                                        ${goal.calculated_allocation?.toFixed(2) || "0.00"}
                                        {goal.allocation_type === "percentage" && goal.allocation_value && (
                                            <span className="text-sm font-normal text-green-700 ml-1">
                                                ({goal.allocation_value}% per income)
                                            </span>
                                        )}
                                    </p>
                                </div>
                            )}

                            {/* Remaining */}
                            {goal.remaining > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <TargetIcon className="h-4 w-4" />
                                        Remaining
                                    </span>
                                    <span className="font-medium">${goal.remaining.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Target Date */}
                            {goal.target_date && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        Target Date
                                    </span>
                                    <span className="font-medium">
                                        {new Date(goal.target_date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            )}

                            {/* Description */}
                            {goal.description && (
                                <p className="text-sm text-muted-foreground italic border-t pt-3">
                                    {goal.description}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Savings Goal?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{selectedGoal?.goal_name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700">
                            {loading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Contribute Dialog */}
            <Dialog open={contributeDialogOpen} onOpenChange={setContributeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Contribute to {selectedGoal?.goal_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Current: ${Number(selectedGoal?.current_amount || 0).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Target: ${Number(selectedGoal?.target_amount || 0).toFixed(2)}</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contributeAmount">Amount to Contribute ($)</Label>
                            <Input
                                id="contributeAmount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={contributeAmount}
                                onChange={(e) => setContributeAmount(e.target.value)}
                                placeholder="100.00"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={() => setContributeDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleContribute} disabled={loading || !contributeAmount}>
                                {loading ? "Contributing..." : "Contribute"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}