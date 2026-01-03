"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    PiggyBank,
    Target,
    Calculator,
    Calendar,
    CreditCard,
    Wallet,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Info,
    Lightbulb,
    Zap
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                            <Lightbulb className="h-10 w-10" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            How Student Tracker Works
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
                            A comprehensive guide to understanding your finances. Learn how we calculate income, expenses, savings, and available balance.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Quick Overview Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                    <TrendingUp className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Track</p>
                                    <h3 className="font-bold text-lg">Income</h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                All money you earn from jobs, hourly work, or other sources
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center">
                                    <TrendingDown className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Monitor</p>
                                    <h3 className="font-bold text-lg">Expenses</h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Everything you spend, categorized for better insights
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                                    <PiggyBank className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Build</p>
                                    <h3 className="font-bold text-lg">Savings</h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Automatic contributions to your financial goals
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                                    <Wallet className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Know</p>
                                    <h3 className="font-bold text-lg">Available</h3>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Real-time view of your spendable money
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="income" className="space-y-8">
                    <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
                        <TabsTrigger value="income" className="flex items-center gap-2 py-3">
                            <TrendingUp className="h-4 w-4" />
                            <span className="hidden sm:inline">Income</span>
                        </TabsTrigger>
                        <TabsTrigger value="expenses" className="flex items-center gap-2 py-3">
                            <TrendingDown className="h-4 w-4" />
                            <span className="hidden sm:inline">Expenses</span>
                        </TabsTrigger>
                        <TabsTrigger value="savings" className="flex items-center gap-2 py-3">
                            <PiggyBank className="h-4 w-4" />
                            <span className="hidden sm:inline">Savings</span>
                        </TabsTrigger>
                        <TabsTrigger value="budgets" className="flex items-center gap-2 py-3">
                            <BarChart3 className="h-4 w-4" />
                            <span className="hidden sm:inline">Budgets</span>
                        </TabsTrigger>
                        <TabsTrigger value="balance" className="flex items-center gap-2 py-3">
                            <Calculator className="h-4 w-4" />
                            <span className="hidden sm:inline">Balance</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Income Tab */}
                    <TabsContent value="income" className="space-y-6">
                        <Card className="border-2 border-blue-200">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                                        <TrendingUp className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Income Tracking</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            How we track and manage your earnings
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* What is Income */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-blue-600" />
                                        <h3 className="font-semibold text-lg">What is Income?</h3>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Income is all the money you earn. This includes salary from jobs, hourly wages, freelance work, gifts, or any other money coming in.
                                    </p>
                                </div>

                                {/* Income Types */}
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white">Types</Badge>
                                        Income Sources
                                    </h4>
                                    <div className="grid sm:grid-cols-2 gap-3">
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Salary/Wages</p>
                                                <p className="text-sm text-muted-foreground">Regular job income</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Hourly Work</p>
                                                <p className="text-sm text-muted-foreground">Based on hours × rate</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Freelance</p>
                                                <p className="text-sm text-muted-foreground">Project-based earnings</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium">Other Sources</p>
                                                <p className="text-sm text-muted-foreground">Gifts, refunds, etc.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* What Happens */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        <h3 className="font-semibold text-lg">What Happens When You Add Income?</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-blue-600 rounded-r-lg">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-blue-600 font-bold">1</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Income is Recorded</p>
                                                <p className="text-sm text-muted-foreground">The amount is added to your total income for the month</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-green-600 rounded-r-lg">
                                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-green-600 font-bold">2</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Automatic Savings Contributions</p>
                                                <p className="text-sm text-muted-foreground">
                                                    All active savings goals automatically receive their allocated percentage or fixed amount
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div className="flex items-start gap-3 p-3 bg-white border-l-4 border-purple-600 rounded-r-lg">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
                                                <span className="text-purple-600 font-bold">3</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Balance Updates</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Your total balance and available balance are recalculated
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Example */}
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Calculator className="h-4 w-4" />
                                    <AlertTitle>Example</AlertTitle>
                                    <AlertDescription className="space-y-2 mt-2">
                                        <p>You add <strong>$1,000</strong> income from your job:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>Emergency Fund (10% monthly goal) → Gets $100 automatically</li>
                                            <li>Vacation Fund (5% overall goal) → Gets $50 automatically</li>
                                            <li>Your total balance increases by $1,000</li>
                                            <li>Your available balance increases by $850 ($1000 - $150 saved)</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Expenses Tab */}
                    <TabsContent value="expenses" className="space-y-6">
                        <Card className="border-2 border-red-200">
                            <CardHeader className="bg-gradient-to-r from-red-50 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-red-600 flex items-center justify-center">
                                        <TrendingDown className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Expense Tracking</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            How we categorize and track your spending
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-red-600" />
                                        <h3 className="font-semibold text-lg">What are Expenses?</h3>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Expenses are all the money you spend. Every purchase, bill, or payment reduces your total balance and available money.
                                    </p>
                                </div>

                                {/* Categories */}
                                <div className="bg-red-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <Badge variant="outline" className="bg-white">Categories</Badge>
                                        Common Expense Types
                                    </h4>
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {[
                                            "Food & Dining",
                                            "Transportation",
                                            "Housing",
                                            "Utilities",
                                            "Entertainment",
                                            "Healthcare",
                                            "Shopping",
                                            "Education",
                                            "Other"
                                        ].map((category) => (
                                            <div key={category} className="flex items-center gap-2 p-2 bg-white rounded border">
                                                <CreditCard className="h-4 w-4 text-red-600" />
                                                <span className="text-sm font-medium">{category}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Impact */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-600" />
                                        <h3 className="font-semibold text-lg">Impact on Your Balance</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="p-4 bg-white border-2 rounded-lg">
                                            <p className="font-medium mb-2">When you add an expense:</p>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-600 font-bold">•</span>
                                                    <span>Reduces your <strong>Total Balance</strong></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-600 font-bold">•</span>
                                                    <span>Reduces your <strong>Available Balance</strong></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-600 font-bold">•</span>
                                                    <span>Counts toward your <strong>Budget Limits</strong></span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-red-600 font-bold">•</span>
                                                    <span>Does NOT affect money already saved in goals</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                <Alert className="border-red-200 bg-red-50">
                                    <Calculator className="h-4 w-4" />
                                    <AlertTitle>Example</AlertTitle>
                                    <AlertDescription className="space-y-2 mt-2">
                                        <p>You spend <strong>$150</strong> on groceries:</p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>Total balance: $5,000 → $4,850</li>
                                            <li>Available balance: $2,000 → $1,850</li>
                                            <li>Food budget: $300 → $150 remaining</li>
                                            <li>Savings goals: Unchanged ($3,000 stays locked)</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Savings Tab */}
                    <TabsContent value="savings" className="space-y-6">
                        <Card className="border-2 border-green-200">
                            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center">
                                        <PiggyBank className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Savings Goals</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Automatic wealth building system
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Goal Types */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="h-5 w-5 text-blue-600" />
                                            <h4 className="font-semibold">Monthly Goals</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            Recurring savings that happen automatically every time you earn income
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Allocation Type:</span>
                                                <span className="font-medium">Percentage or Fixed</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>When it saves:</span>
                                                <span className="font-medium">Every income</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress resets:</span>
                                                <span className="font-medium">Monthly</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Target className="h-5 w-5 text-green-600" />
                                            <h4 className="font-semibold">Overall Goals</h4>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">
                                            One-time targets that build up until you reach your goal
                                        </p>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Allocation Type:</span>
                                                <span className="font-medium">Optional % or Fixed</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>When it saves:</span>
                                                <span className="font-medium">Every income</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span>Progress resets:</span>
                                                <span className="font-medium">Never</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* How Savings Work */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-yellow-600" />
                                        Automatic Contribution System
                                    </h3>

                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2">
                                        <div className="space-y-4">
                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                                                    1
                                                </div>
                                                <div>
                                                    <p className="font-semibold mb-1">Create a Goal</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Set target amount, choose monthly or overall, define allocation (10% or $100)
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                                                    2
                                                </div>
                                                <div>
                                                    <p className="font-semibold mb-1">Earn Income</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Every time you add income, ALL active goals automatically receive their allocation
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold">
                                                    3
                                                </div>
                                                <div>
                                                    <p className="font-semibold mb-1">Watch It Grow</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Track monthly progress and overall progress toward your targets
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Monthly Progress */}
                                <Alert className="border-blue-200 bg-blue-50">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Understanding Monthly Progress</AlertTitle>
                                    <AlertDescription className="space-y-2 mt-2 text-sm">
                                        <p>For <strong>monthly goals</strong>, you'll see two progress bars:</p>
                                        <div className="space-y-2 pl-3">
                                            <div>
                                                <p className="font-medium">📊 Overall Progress</p>
                                                <p className="text-muted-foreground">How much you've saved toward the final target</p>
                                            </div>
                                            <div>
                                                <p className="font-medium">📅 This Month Progress</p>
                                                <p className="text-muted-foreground">How much you've saved this month vs your monthly target</p>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {/* Example */}
                                <Alert className="border-green-200 bg-green-50">
                                    <Calculator className="h-4 w-4" />
                                    <AlertTitle>Example: Emergency Fund</AlertTitle>
                                    <AlertDescription className="space-y-3 mt-2">
                                        <div>
                                            <p className="font-medium mb-2">Goal Setup:</p>
                                            <ul className="text-sm space-y-1">
                                                <li>• Type: Monthly Goal</li>
                                                <li>• Target: $10,000</li>
                                                <li>• Allocation: 10% of income</li>
                                                <li>• Current: $3,500</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-medium mb-2">You earn $1,500:</p>
                                            <ul className="text-sm space-y-1">
                                                <li>✅ $150 automatically goes to Emergency Fund (10%)</li>
                                                <li>✅ New total: $3,650</li>
                                                <li>✅ Overall progress: 36.5%</li>
                                                <li>✅ This month progress updates in real-time</li>
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {/* Control */}
                                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5 text-orange-600" />
                                        Goal Control
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Pause a Goal:</strong> It stops receiving automatic contributions</p>
                                        <p><strong>Reactivate:</strong> It starts receiving contributions again from new income</p>
                                        <p><strong>Complete:</strong> When target is reached, it automatically stops</p>
                                        <p className="text-orange-700 font-medium mt-3">
                                            💡 Paused/completed goals still count toward your total saved amount
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Budgets Tab */}
                    <TabsContent value="budgets" className="space-y-6">
                        <Card className="border-2 border-purple-200">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-purple-600 flex items-center justify-center">
                                        <BarChart3 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Budget Management</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Control your spending by category
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-5 w-5 text-purple-600" />
                                        <h3 className="font-semibold text-lg">What are Budgets?</h3>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Budgets are monthly spending limits you set for different categories. They help you stay on track and avoid overspending.
                                    </p>
                                </div>

                                {/* How Budgets Work */}
                                <div className="bg-purple-50 p-4 rounded-lg space-y-4">
                                    <h4 className="font-semibold">How Budgets Work:</h4>
                                    <div className="space-y-3">
                                        <div className="bg-white p-3 rounded border">
                                            <p className="font-medium text-sm mb-1">1. Set Monthly Limit</p>
                                            <p className="text-xs text-muted-foreground">Choose a category and set how much you want to spend</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <p className="font-medium text-sm mb-1">2. Track Automatically</p>
                                            <p className="text-xs text-muted-foreground">As you add expenses, they count toward your budget</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <p className="font-medium text-sm mb-1">3. Visual Warnings</p>
                                            <p className="text-xs text-muted-foreground">Get alerts when approaching or exceeding limits</p>
                                        </div>
                                        <div className="bg-white p-3 rounded border">
                                            <p className="font-medium text-sm mb-1">4. Monthly Reset</p>
                                            <p className="text-xs text-muted-foreground">Budgets reset automatically each month</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Colors */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Budget Status Indicators:</h4>
                                    <div className="grid gap-3">
                                        <div className="flex items-center gap-3 p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                                            <div className="h-12 w-12 rounded bg-green-600 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Under Budget (0-80%)</p>
                                                <p className="text-sm text-muted-foreground">You're doing great! Plenty of room left</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                                            <div className="h-12 w-12 rounded bg-yellow-600 flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Near Limit (80-100%)</p>
                                                <p className="text-sm text-muted-foreground">Watch your spending in this category</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                                            <div className="h-12 w-12 rounded bg-red-600 flex items-center justify-center flex-shrink-0">
                                                <AlertCircle className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Over Budget (100%+)</p>
                                                <p className="text-sm text-muted-foreground">You've exceeded your limit for this category</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Alert className="border-purple-200 bg-purple-50">
                                    <Calculator className="h-4 w-4" />
                                    <AlertTitle>Example</AlertTitle>
                                    <AlertDescription className="space-y-2 mt-2">
                                        <p>Food budget: <strong>$500/month</strong></p>
                                        <ul className="list-disc list-inside space-y-1 text-sm">
                                            <li>Week 1: Spent $120 → 24% used (Green)</li>
                                            <li>Week 2: Spent $220 → 44% used (Green)</li>
                                            <li>Week 3: Spent $430 → 86% used (Yellow warning)</li>
                                            <li>Week 4: Spent $530 → 106% used (Red alert)</li>
                                        </ul>
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Balance Calculations Tab */}
                    <TabsContent value="balance" className="space-y-6">
                        <Card className="border-2 border-indigo-200">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-lg bg-indigo-600 flex items-center justify-center">
                                        <Calculator className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl">Balance Calculations</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Understanding your financial numbers
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                {/* Four Key Numbers */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* Total Balance */}
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <DollarSign className="h-6 w-6 text-blue-600" />
                                            <h4 className="font-bold text-lg">Total Balance</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-white/80 p-3 rounded">
                                                <p className="text-sm font-mono font-bold text-blue-600 mb-1">
                                                    Total Income - Total Expenses
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Your gross balance before any deductions
                                                </p>
                                            </div>
                                            <p className="text-sm">
                                                This is ALL the money you have, including what's saved in goals.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Total Saved */}
                                    <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <PiggyBank className="h-6 w-6 text-green-600" />
                                            <h4 className="font-bold text-lg">Total Saved</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-white/80 p-3 rounded">
                                                <p className="text-sm font-mono font-bold text-green-600 mb-1">
                                                    Sum of All Goals' Current Amounts
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Money locked in savings goals
                                                </p>
                                            </div>
                                            <p className="text-sm">
                                                This money is part of your total balance but set aside for goals.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Planned Expenses */}
                                    <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="h-6 w-6 text-orange-600" />
                                            <h4 className="font-bold text-lg">Planned Expenses</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-white/80 p-3 rounded">
                                                <p className="text-sm font-mono font-bold text-orange-600 mb-1">
                                                    Sum of Future Scheduled Bills
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Money you'll need for upcoming expenses
                                                </p>
                                            </div>
                                            <p className="text-sm">
                                                Future commitments like rent, bills, planned purchases.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Available Balance */}
                                    <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-lg">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wallet className="h-6 w-6 text-purple-600" />
                                            <h4 className="font-bold text-lg">Available Balance</h4>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="bg-white/80 p-3 rounded">
                                                <p className="text-sm font-mono font-bold text-purple-600 mb-1">
                                                    Total - Saved - Planned
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Your actual spendable money
                                                </p>
                                            </div>
                                            <p className="text-sm">
                                                This is what you can freely spend without affecting your goals or plans.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* The Formula */}
                                <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-lg border-2 border-indigo-200">
                                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        The Complete Formula
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-lg border-2 border-indigo-300">
                                            <p className="font-mono text-sm md:text-base font-bold text-center text-indigo-600">
                                                Available Balance = Total Balance - Total Saved - Planned Expenses
                                            </p>
                                        </div>
                                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                                            <div className="text-center p-3 bg-white rounded border">
                                                <p className="font-semibold text-blue-600">Total Balance</p>
                                                <p className="text-xs text-muted-foreground mt-1">All your money</p>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded border">
                                                <p className="font-semibold text-green-600">- Total Saved</p>
                                                <p className="text-xs text-muted-foreground mt-1">Money in goals</p>
                                            </div>
                                            <div className="text-center p-3 bg-white rounded border">
                                                <p className="font-semibold text-orange-600">- Planned</p>
                                                <p className="text-xs text-muted-foreground mt-1">Future bills</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Example */}
                                <Alert className="border-indigo-200 bg-indigo-50">
                                    <Calculator className="h-4 w-4" />
                                    <AlertTitle>Complete Example</AlertTitle>
                                    <AlertDescription className="space-y-4 mt-3">
                                        <div className="space-y-2">
                                            <p className="font-semibold">Your Financial State:</p>
                                            <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                                <div className="bg-white p-2 rounded">
                                                    <p className="text-muted-foreground">Total Income (all time)</p>
                                                    <p className="font-bold text-blue-600">$20,000</p>
                                                </div>
                                                <div className="bg-white p-2 rounded">
                                                    <p className="text-muted-foreground">Total Expenses (all time)</p>
                                                    <p className="font-bold text-red-600">$12,000</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 1: Calculate Total Balance</p>
                                            <div className="bg-white p-3 rounded text-sm">
                                                <p className="font-mono">$20,000 - $12,000 = <span className="font-bold text-blue-600">$8,000</span></p>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 2: Check Savings Goals</p>
                                            <div className="space-y-1 text-sm">
                                                <div className="bg-white p-2 rounded flex justify-between">
                                                    <span>Emergency Fund</span>
                                                    <span className="font-mono">$3,500</span>
                                                </div>
                                                <div className="bg-white p-2 rounded flex justify-between">
                                                    <span>Vacation Fund</span>
                                                    <span className="font-mono">$2,000</span>
                                                </div>
                                                <div className="bg-green-100 p-2 rounded flex justify-between font-bold">
                                                    <span>Total Saved</span>
                                                    <span className="font-mono text-green-600">$5,500</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 3: Check Planned Expenses</p>
                                            <div className="space-y-1 text-sm">
                                                <div className="bg-white p-2 rounded flex justify-between">
                                                    <span>Rent (next month)</span>
                                                    <span className="font-mono">$1,200</span>
                                                </div>
                                                <div className="bg-orange-100 p-2 rounded flex justify-between font-bold">
                                                    <span>Total Planned</span>
                                                    <span className="font-mono text-orange-600">$1,200</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="font-semibold">Step 4: Calculate Available Balance</p>
                                            <div className="bg-purple-100 p-4 rounded border-2 border-purple-300">
                                                <p className="font-mono text-sm mb-2">$8,000 - $5,500 - $1,200</p>
                                                <p className="font-mono text-2xl font-bold text-purple-600">= $1,300</p>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    This is your actual spendable money right now!
                                                </p>
                                            </div>
                                        </div>
                                    </AlertDescription>
                                </Alert>

                                {/* Why This Matters */}
                                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5 text-yellow-600" />
                                        Why This Matters
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                        If we only showed you the <strong>Total Balance ($8,000)</strong>, you might think you have all that money to spend.
                                        But $5,500 is already committed to your savings goals, and $1,200 is needed for planned expenses.
                                        Your <strong>Available Balance ($1,300)</strong> shows your TRUE spendable cash.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer Tips */}
                <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-transparent mt-12">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Lightbulb className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Pro Tips</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Set up savings goals FIRST, then they automatically work for you</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Create budgets for categories where you tend to overspend</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Check your Available Balance before making big purchases</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Pause savings goals temporarily if you need extra cash for emergencies</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}