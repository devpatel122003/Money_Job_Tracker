# Advanced Finance Tracking Features

## What's New 🎉

### 1. **Monthly Budget Management**
Set spending limits for each expense category and track your progress throughout the month.

**Features:**
- Set budgets for any expense category (food, transportation, housing, etc.)
- Visual progress bars showing spending vs budget
- Color-coded warnings:
  - **Green**: On track
  - **Yellow**: Near limit (80%+)
  - **Red**: Over budget
- Month-specific budgets
- Budget overview dashboard

### 2. **Savings Goals**
Set and track your savings targets with deadline tracking.

**Features:**
- Create unlimited savings goals
- Track progress with visual indicators
- Set optional target dates
- Add descriptions to remember why you're saving
- Update current savings amount
- Completion celebration when goals are achieved

### 3. **Monthly View**
Navigate through different months to see historical data and plan ahead.

**Features:**
- Month navigation with previous/next buttons
- "Today" button to quickly return to current month
- All data (income, expenses, budgets) filtered by selected month
- Compare spending patterns across months

### 4. **Enhanced Dashboard**
Completely redesigned finance dashboard with tabs and better organization.

**Tabs:**
- **Overview**: Charts and quick budget summary
- **Budgets**: Manage all your monthly budgets
- **Savings Goals**: Track your financial goals
- **Transactions**: View and manage income & expenses

**Stats Cards:**
- Total Income
- Total Expenses
- Net Balance
- Budget Health (how many budgets you're staying within)

### 5. **Visual Progress Tracking**
- Progress bars for budgets showing spend vs limit
- Progress bars for savings goals showing current vs target
- Color-coded indicators for budget status
- Achievement badges when goals are completed

## Database Changes

### New Table: `savings_goals`
Run this migration script: `007-add-savings-goals.sql`

```sql
CREATE TABLE IF NOT EXISTS savings_goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  goal_name VARCHAR(255) NOT NULL,
  target_amount DECIMAL(10, 2) NOT NULL,
  current_amount DECIMAL(10, 2) DEFAULT 0,
  target_date DATE,
  description TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## New API Endpoints

### Budgets
- `GET /api/finance/budgets?month=YYYY-MM` - Get budgets for specific month
- `POST /api/finance/budgets` - Create new budget
- `DELETE /api/finance/budgets/[id]` - Delete budget

### Savings Goals
- `GET /api/finance/savings-goals` - Get all savings goals
- `POST /api/finance/savings-goals` - Create new savings goal
- `DELETE /api/finance/savings-goals/[id]` - Delete savings goal
- `PATCH /api/finance/savings-goals/[id]` - Update savings goal progress

### Enhanced Existing Endpoints
- `GET /api/finance/summary?month=YYYY-MM` - Summary for specific month
- `GET /api/finance/income?month=YYYY-MM` - Income for specific month
- `GET /api/finance/expenses?month=YYYY-MM` - Expenses for specific month

## New Components

1. **BudgetForm** (`components/budget-form.tsx`)
   - Dialog form for setting monthly budgets
   - Category selection
   - Budget amount input

2. **SavingsGoalForm** (`components/savings-goal-form.tsx`)
   - Dialog form for creating savings goals
   - Goal name, target amount, current amount
   - Optional target date and description

## How to Use

### Setting a Budget
1. Go to Finance Dashboard
2. Click "Budgets" tab
3. Click "Set Budget"
4. Choose category and set monthly limit
5. Budget automatically applies to current month

### Creating a Savings Goal
1. Go to Finance Dashboard
2. Click "Savings Goals" tab
3. Click "New Goal"
4. Enter goal details (name, target amount, etc.)
5. Track progress as you save

### Viewing Different Months
1. Use the month navigation at the top right
2. Click Previous/Next to change months
3. Click "Today" to return to current month
4. All data updates to show selected month

## Tips for Best Use

1. **Set Realistic Budgets**: Start conservative and adjust as you learn your spending patterns
2. **Review Monthly**: At the end of each month, review your budget performance
3. **Multiple Goals**: Break large savings goals into smaller milestones
4. **Regular Updates**: Update your savings goals regularly to stay motivated
5. **Category Budgets**: Focus on categories where you tend to overspend

## Budget Categories

Available categories for budgeting:
- Food
- Transportation
- Housing
- Education
- Entertainment
- Utilities
- Healthcare
- Shopping
- Other

## Future Enhancements (Ideas)

- Recurring budget templates
- Budget recommendations based on spending history
- Savings goal milestones
- Export budget reports
- Budget vs actual comparison charts
- Weekly spending alerts
- Automatic savings goal contributions

## Troubleshooting

**Budget not showing?**
- Make sure you're viewing the correct month
- Check that the budget start date matches the current month

**Savings goal progress not updating?**
- Manually update the current amount in the goal
- Or use the PATCH endpoint to update programmatically

**Over budget warnings?**
- Review your expenses in that category
- Consider adjusting the budget if it's unrealistic
- Look for ways to cut spending in that area

---

**Need Help?** Check the API documentation or create an issue on GitHub.
