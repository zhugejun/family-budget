# Family Budget App (Local-First)

A beautiful, privacy-focused family expense tracking application built with **Next.js**, **SQLite3**, and **Claude AI**.

This app is designed to run completely locally on your machine or private network. It features AI-powered receipt scanning, recurring expense automation, and detailed analytics—all with **zero cloud dependencies** and **no mandatory user accounts**.

## ✨ Key Features

- 🏠 **Privacy First** - 100% local database and file storage. No cloud accounts required.
- � **Auth-Free Access** - Direct access to the dashboard. Perfect for local home servers.
- 🤖 **AI Receipt Scanning** - Batch upload receipts (images/PDFs) and extract items automatically using **Claude 4.5 Sonnet**.
- 🔄 **Recurring Expenses** - Automatically generate monthly/weekly/annual expenses for subscriptions, rent, and utilities.
- � **Smart Expense Splitting** - Custom split ratios (e.g., 50/50, 70/30) with instance totals for separate family members.
- 📊 **Rich Analytics** - Beautiful charts for spending trends, category breakdowns, and member comparisons.
- 🖼️ **Receipt Gallery** - Store and view legal proof of your expenses with a built-in lightbox gallery.
- 📱 **Fully Responsive** - Premium UI designed for desktop, tablet, and mobile.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite3 (via `better-sqlite3`)
- **AI Engine**: Claude API (Anthropic)
- **Styling**: Tailwind CSS v4 & Lucide Icons
- **Visuals**: Recharts for data visualization
- **Components**: shadcn/ui components

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/family-expense.git
cd family-expense
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root directory:

```env
# Required for AI Receipt Scanning
CLAUDE_API_KEY=your-anthropic-api-key-here
```

### 4. Run the application

```bash
npm run dev
```

Visit **http://localhost:3000** to start tracking!

## 💾 Data Management

- **Database**: All data is stored in `data/budget.db`.
- **Receipt Images**: Uploaded images are stored in `public/receipts/`.
- **Backups**: Simply copy the `data/` and `public/receipts/` folders to backup your entire application state.

## 📁 Project Structure

```
family-expense/
├── app/
│   ├── api/local/        # Local SQLite API routes
│   ├── dashboard/       # Main dashboard application
│   └── globals.css      # Design system & theme
├── components/
│   ├── dashboard/       # UI components (charts, forms, lists)
│   └── ui/              # Base shadcn/ui components
├── hooks/
│   ├── useLocal*.ts     # Data management hooks (SQLite-backend)
├── lib/
│   ├── db/              # SQLite connection and schema.sql
│   ├── claude.ts        # AI logic for receipt extraction
│   └── calculations.ts   # Financial split logic
└── data/                # SQLite database folder (auto-created)
```

## 🎨 Design System

The app features a curated **Amber & Stone** aesthetic, optimized for a warm, family-oriented feel combined with professional-grade glassmorphism effects and modern typography (**Fraunces** for headings, **Inter** for body).

---

**Built with ❤️ for private family financial management.**
