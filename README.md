# Student Job & Finance Tracker

A comprehensive web application for students to track their job applications and manage their finances in one place.

## Features

### 📊 Dashboard
- Quick overview of all your job applications and financial data
- Visual charts and statistics
- Quick navigation to Jobs and Finance sections

### 💼 Job Application Tracker
- Add and manage job applications
- Track application status through the entire process:
  - Saved
  - Applied
  - Phone Screen
  - Interview
  - Offer
  - Rejected
  - Accepted
- Search and filter applications
- View statistics (total applications, in progress, offers)
- Visual charts showing status distribution and timeline

### 💰 Finance Tracker
- Track income sources
- Monitor expenses by category
- View monthly financial summary (income, expenses, balance)
- Categorize expenses for better insights
- Visual charts for expense categories and income vs expenses

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with custom components
- **Database**: PostgreSQL (Neon)
- **Authentication**: Custom JWT-based auth with bcryptjs
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- PostgreSQL database (Neon recommended)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd student-job-and-finance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory with your database connection:
   ```env
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

4. **Set up the database**
   
   Run the SQL scripts in your PostgreSQL database in this order:
   ```bash
   # Execute these SQL files against your database
   scripts/001-create-schema.sql
   scripts/003-fix-schema-for-auth.sql
   scripts/005-fix-schema-alignment.sql
   scripts/006-add-hourly-rate-columns.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
student-job-and-finance-app/
├── app/
│   ├── (protected)/          # Protected routes (require authentication)
│   │   ├── finance/          # Finance tracking page
│   │   ├── jobs/             # Job applications page
│   │   └── layout.tsx        # Layout with navigation
│   ├── api/                  # API routes
│   │   ├── applications/     # Job applications endpoints
│   │   ├── auth/             # Authentication endpoints
│   │   └── finance/          # Finance endpoints
│   ├── login/                # Login page
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Dashboard page
├── components/               # React components
│   ├── ui/                   # Reusable UI components
│   ├── navigation.tsx        # Main navigation
│   ├── dashboard-client.tsx  # Dashboard component
│   ├── job-application-form.tsx
│   ├── income-form.tsx
│   ├── expense-form.tsx
│   └── ...charts.tsx         # Various chart components
├── lib/                      # Utility functions
│   ├── auth.ts               # Authentication utilities
│   ├── db.ts                 # Database connection
│   └── utils.ts              # General utilities
├── scripts/                  # Database migration scripts
├── public/                   # Static assets
└── styles/                   # Global styles
```

## Database Schema

### Tables
- **users** - User accounts
- **job_applications** - Job application tracking
- **income** - Income entries
- **expenses** - Expense entries
- **budgets** - Budget planning (optional)

See `scripts/001-create-schema.sql` for full schema details.

## Usage

### Creating an Account
1. Navigate to `/login`
2. Click "Sign Up"
3. Enter your details and create an account

### Adding a Job Application
1. Go to the Jobs page
2. Click "Add Application"
3. Fill in the company name, position, and other details
4. Track the status as you progress

### Managing Finances
1. Go to the Finance page
2. Add income sources (part-time job, freelance, etc.)
3. Track expenses with categories
4. View your monthly summary and charts

## Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXT_PUBLIC_STACK_PROJECT_ID` | Stack Auth project ID (if using) | No |
| `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` | Stack Auth key | No |
| `STACK_SECRET_SERVER_KEY` | Stack Auth secret | No |

## Security Notes

- Passwords are hashed using bcryptjs
- Authentication uses HTTP-only cookies
- Database credentials should never be committed to version control
- Always use HTTPS in production

## Contributing

This is a student project. Feel free to fork and modify for your own use.

## License

This project is available for personal and educational use.

## Support

For issues or questions, please open an issue on GitHub.

---

**Note**: This version has the sync feature removed. All data must be entered manually through the web interface.
