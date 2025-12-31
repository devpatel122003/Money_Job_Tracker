# Quick Setup Guide - Advanced Finance Features

## 🚀 Step-by-Step Setup

### Step 1: Run Database Migration

You need to create the `savings_goals` table. Connect to your Neon database and run this SQL:

**Option A: Using Neon Console (Easiest)**
1. Go to https://console.neon.tech
2. Login and select your project
3. Click "SQL Editor" in the left sidebar
4. Copy and paste this SQL:

```sql
-- Add savings_goals table for tracking financial goals
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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_completed ON savings_goals(is_completed);
```

5. Click "Run" (or press Ctrl+Enter on Windows, Cmd+Enter on Mac)
6. You should see "Success" message

**Option B: Using psql Command Line**
```bash
psql "YOUR_DATABASE_URL" -f scripts/007-add-savings-goals.sql
```

**Option C: Using any PostgreSQL GUI Tool**
- TablePlus
- DBeaver
- pgAdmin
- Postico (Mac)

Just connect with your `DATABASE_URL` and execute the SQL above.

### Step 2: Restart Your Development Server

After running the migration:
```bash
# Stop the server (Ctrl+C)
# Then restart it
npm run dev
```

### Step 3: Test the Features

1. **Go to Finance Dashboard**
   - Navigate to http://localhost:3000/finance

2. **Test Monthly Navigation**
   - Use the arrows to change months
   - Click "Today" to return to current month

3. **Create a Budget**
   - Click "Budgets" tab
   - Click "Set Budget" button
   - Select category (e.g., "Food")
   - Enter amount (e.g., "500")
   - Click "Save Budget" button
   - ✅ Budget should appear with progress bar

4. **Create a Savings Goal**
   - Click "Savings Goals" tab
   - Click "New Goal" button
   - Enter goal name (e.g., "Emergency Fund")
   - Enter target amount (e.g., "1000")
   - Optionally enter current amount and target date
   - Click "Create Goal" button
   - ✅ Goal should appear with progress bar

5. **Add Transactions**
   - Go to "Transactions" tab
   - Add some income and expenses
   - Watch your budget progress update automatically!

## 🎯 Features Overview

### Monthly Budgets
- Set spending limits per category
- Visual progress bars (Green → Yellow → Red)
- Automatic budget health score
- Over-budget warnings

### Savings Goals
- Unlimited goals
- Progress tracking
- Optional deadlines
- Achievement indicators
- Custom descriptions

### Monthly View
- Navigate any month (past/future)
- Filter all data by month
- Compare spending patterns

### Dashboard Tabs
1. **Overview** - Charts + quick budget summary
2. **Budgets** - All budget details
3. **Savings Goals** - Goal tracking
4. **Transactions** - Income/Expense lists

## ⚠️ Common Issues

### Issue: "relation 'savings_goals' does not exist"
**Solution:** Run the migration SQL (Step 1 above)

### Issue: Budget form buttons not visible
**Solution:** The form should scroll if content is long. Make sure you're scrolling down in the dialog.

### Issue: Can't select category in budget form
**Solution:** Click on the dropdown and select from the list. The category must be selected before the save button is enabled.

### Issue: Budget shows 0/0
**Solution:** Add some expenses first, then the budget will show actual progress.

## 📊 Testing Checklist

- [ ] Database migration completed successfully
- [ ] Server restarted
- [ ] Can navigate between months
- [ ] Can create a budget
- [ ] Can delete a budget
- [ ] Can create a savings goal
- [ ] Can delete a savings goal
- [ ] Budget progress updates when adding expenses
- [ ] Savings goals tab shows properly
- [ ] Overview tab shows budget summary
- [ ] Transactions tab shows income and expenses

## 🎓 Example Workflow

1. **January**: Set budgets for the month (Food: $400, Transport: $100, etc.)
2. **Throughout Month**: Add income and expenses as they happen
3. **Watch Progress**: See your budget bars fill up in real-time
4. **Set Goals**: Create savings goal "Summer Vacation - $2000"
5. **Update Savings**: Each month, update your current savings amount
6. **Review**: At month end, navigate to next month and set new budgets

## 💡 Pro Tips

- Start with conservative budgets and adjust up if needed
- Set multiple small goals rather than one huge goal
- Review your Overview tab weekly
- Use the monthly navigation to compare spending patterns
- Budget categories that you tend to overspend in

---

**Need More Help?** Check FINANCE_FEATURES.md for detailed feature documentation.
