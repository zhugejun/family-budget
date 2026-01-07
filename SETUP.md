# Family Budget App - Setup Guide

## 🚀 Quick Start

This is a modern family expense tracking app with AI-powered receipt scanning built with Next.js, Supabase, and Claude AI.

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works great!)
- A Claude API key from Anthropic

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to **SQL Editor** in the Supabase dashboard
4. Copy the contents of `supabase-schema.sql` and run it in the SQL editor
5. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon` `public` key

### 3. Get Claude API Key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** and create a new key
4. Copy the API key (you won't be able to see it again!)

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_CLAUDE_API_KEY=sk-ant-your-key-here
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎨 Features

- ✨ **AI Receipt Scanning** - Upload photos and Claude extracts items automatically
- 💰 **Smart Expense Splitting** - Flexible ratio-based splitting (50/50, 70/30, etc.)
- 📊 **Real-time Tracking** - See who owes what instantly
- ☁️ **Cloud Sync** - Data persisted with Supabase
- 🔐 **Secure** - Row-level security with Supabase Auth
- 📱 **Responsive** - Works beautifully on mobile and desktop

## 📱 How to Use

### Scanning Receipts

1. Click **"Scan Receipt"** tab
2. Drag & drop or click to upload a receipt photo
3. Wait 2-3 seconds for AI to extract items
4. Review and edit if needed

### Adding Manual Expenses

1. Click **"Add Manual"** tab
2. Enter item name, price, and category
3. Click **"Add Expense"**

### Splitting Expenses

1. Go to **"Expenses"** tab
2. Toggle **"Split this expense"** on any item
3. Adjust the split ratio (default is 50/50)
4. Click **"Reset"** to restore default ratio

### Managing Categories

1. Click the **Settings** icon (⚙️) in the header
2. Scroll to **"Expense Categories"**
3. Add, edit, or delete categories
4. Categories are used for both manual entry and receipt scanning

## 🎨 Design System

The app uses:

- **shadcn/ui** components with **Orange** theme
- **DM Sans** for body text
- **Fraunces** for headings
- Warm amber/orange color palette for a friendly feel

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

**Important:** Make sure to add all three environment variables in Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLAUDE_API_KEY`

## 📁 Project Structure

```
family-expense/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles + shadcn theme
├── components/
│   └── FamilyBudgetApp.tsx # Main app component
├── hooks/
│   ├── useAuth.ts          # Authentication hook
│   ├── useExpenses.ts      # Expenses management
│   └── useCategories.ts    # Categories management
├── lib/
│   ├── supabase.ts         # Supabase client
│   ├── claude.ts           # Claude API integration
│   ├── calculations.ts     # Expense calculations
│   └── utils.ts            # Utility functions
├── supabase-schema.sql     # Database schema
└── components.json         # shadcn/ui config
```

## 🔧 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Orange theme)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **AI/OCR:** Claude API (Sonnet 4)
- **Icons:** Lucide React
- **Hosting:** Vercel

## 🐛 Troubleshooting

### Receipt scanning not working?

- Check that your Claude API key is correct in `.env.local`
- Make sure the image is clear and well-lit
- Try a different image format (JPG or PNG)

### Data not persisting?

- Verify Supabase credentials in `.env.local`
- Check that you ran the `supabase-schema.sql` script
- Look for errors in the browser console

### TypeScript errors?

- Run `npm install` to ensure all dependencies are installed
- Restart your IDE/editor
- Check that `tsconfig.json` has the correct paths

## 🗺️ Roadmap

Future features planned:

- [ ] User authentication UI
- [ ] Dashboard with charts and analytics
- [ ] Dynamic family members (add/remove/rename)
- [ ] Recurring expenses
- [ ] Budget limits and alerts
- [ ] Export to CSV/PDF
- [ ] Receipt image gallery
- [ ] Mobile app

## 📄 License

MIT License - feel free to use for personal or commercial projects!

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

---

Built with ❤️ using Next.js, Supabase, and Claude AI
