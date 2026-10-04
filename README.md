# ExpenseFlow

A clean and intuitive personal finance manager to track daily expenses, manage accounts, monitor budgets, and achieve your savings goals.

---

## ✨ Features

- **Multi-Account Ledger**: Manage checking, high-yield savings, credit cards, cash, and investment accounts with atomic transfers.
- **Transactions & Filtering**: Record expenses, income, and transfers with multi-criteria filtering, search, and CSV import/export.
- **Monthly Budgets**: Set category-level spending limits with real-time progress tracking and alert indicators.
- **Analytics & Health Score**: Visual cash flow analysis, category breakdowns, month-end projections, and financial health scoring.
- **Subscriptions & Recurring**: Track recurring commitments, billing schedules, and renewal countdowns.
- **Savings Goals**: Set financial milestones, track contributions, and calculate monthly pacing.
- **Theme Support**: Seamless one-click Light and Dark mode switching from the top navigation bar.
- **Resilient Dual-Mode Architecture**: Operates with the Express REST API backend or offline with local state storage.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **State Management**: TanStack Query v5, Zustand v5, React Hook Form, Zod
- **Backend**: Node.js, Express v5, tsx
- **Database & ORM**: PostgreSQL 16, Prisma ORM v6
- **Testing**: Vitest (30 unit tests)

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation

```bash
# Clone the repository
git clone https://github.com/VinayKrishna-7/Expense_Tracker.git
cd Expense_Tracker

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate
```

### Running the App

```bash
# Start frontend development server
npm run dev

# Start backend REST API server (optional)
npm run server
```

The frontend will be available at `http://localhost:5173` (or next available port), and the API at `http://localhost:5000`.

---

## 🧪 Testing & Build

```bash
# Run unit tests
npm run test

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/expenseflow?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="http://localhost:5173"
API_URL="http://localhost:5000/api"
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + K` / `Cmd + K` | Open Command Palette |
| `N` | Open New Expense Modal |
| `?` | View Keyboard Shortcuts |
| `Esc` | Close Active Modal / Palette |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
