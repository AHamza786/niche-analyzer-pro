# Niche Analyzer Dashboard

A comprehensive Amazon Kindle Direct Publishing (KDP) niche analysis tool that helps authors and publishers identify profitable book market opportunities through data-driven insights.

## 🚀 Features

### Core Analytics

- **Keyword Analysis**: Analyze search terms and calculate opportunity scores
- **Competition Assessment**: Evaluate market saturation and competition levels
- **Sales Estimation**: Convert BSR (Best Seller Rank) to estimated daily sales
- **Trend Analysis**: Track demand and supply trends over time
- **ROI Calculations**: Estimate potential profits and return on investment

### Dashboard Capabilities

- **Real-time Data**: Live market analysis and metrics
- **Interactive Charts**: Visual trend analysis with Recharts
- **Sortable Tables**: Comprehensive data tables with filtering
- **Market Insights**: AI-powered recommendations and insights
- **Historical Tracking**: Track performance over time

### Advanced Features

- **Seasonal Adjustments**: Account for seasonal market variations
- **Market Saturation Detection**: Identify oversaturated niches
- **Success Rate Analysis**: Calculate probability of success
- **Automated Updates**: Background data refresh system
- **Export Capabilities**: Download analysis results

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Local Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <your-repo-url>
   cd kdp-analyzer
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Environment Variables**
   Create a `.env.local` file in the root directory:
   \`\`\`env

   # Supabase Configuration

   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Database URLs (from Supabase)

   POSTGRES_URL=your_postgres_connection_string
   POSTGRES_PRISMA_URL=your_postgres_prisma_url
   POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
   POSTGRES_USER=your_postgres_user
   POSTGRES_PASSWORD=your_postgres_password
   POSTGRES_DATABASE=your_postgres_database
   POSTGRES_HOST=your_postgres_host

   # JWT Secret

   SUPABASE_JWT_SECRET=your_jwt_secret
   \`\`\`

4. **Database Setup**
   Run the SQL scripts in your Supabase SQL editor:
   \`\`\`bash

   # Run these files in order:

   scripts/001-create-tables.sql
   scripts/002-seed-sample-data.sql
   scripts/003-create-update-jobs-table.sql
   \`\`\`

5. **Start Development Server**
   \`\`\`bash
   npm run dev
   \`\`\`

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Schema

### Main Tables

- **keywords**: Store search terms and metadata
- **books**: Amazon book data with BSR, prices, reviews
- **bsr_history**: Historical BSR tracking for trend analysis
- **keyword_metrics**: Calculated analytics and opportunity scores
- **update_jobs**: Background job tracking for data updates

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Copy your project URL and API keys
3. Run the provided SQL scripts to create tables
4. Configure Row Level Security (RLS) if needed

### Environment Variables

Get your Supabase credentials from:

- Project Settings → API → Project URL
- Project Settings → API → Project API keys
- Project Settings → Database → Connection string

## 📊 API Endpoints

### Keywords

- `GET /api/keywords` - List all keywords
- `POST /api/keywords` - Create new keyword
- `POST /api/keywords/[id]/analyze` - Analyze keyword

### Books

- `GET /api/books` - List books for a keyword
- `POST /api/books` - Add new book data

### Updates

- `POST /api/updates/trigger` - Trigger data update
- `GET /api/updates/status/[id]` - Check update status
- `GET /api/updates/history` - Update history

## 🎯 Usage

### Analyzing a Keyword

1. Enter a keyword in the analyzer input
2. Click "Analyze Keyword" to fetch market data
3. Review the opportunity score and metrics
4. Check competition analysis and trends
5. View detailed insights and recommendations

### Understanding Metrics

- **Opportunity Score**: 0-100 scale indicating market potential
- **Demand Trend**: Market demand direction (growing/stable/declining)
- **Competition Level**: Market saturation assessment
- **Success Rate**: Probability of achieving good sales
- **ROI Estimate**: Expected return on investment

## 🏗️ Project Structure

\`\`\`
kdp-analyzer/
├── app/ # Next.js app directory
│ ├── api/ # API routes
│ ├── globals.css # Global styles
│ ├── layout.tsx # Root layout
│ └── page.tsx # Main dashboard
├── components/ # React components
│ ├── dashboard/ # Dashboard-specific components
│ └── ui/ # Reusable UI components
├── lib/ # Utility libraries
│ ├── services/ # Business logic services
│ ├── supabase/ # Database client
│ ├── types/ # TypeScript definitions
│ └── utils/ # Helper functions
├── scripts/ # Database scripts
└── styles/ # Additional styles
\`\`\`

## 🔄 Data Update System

The application includes an automated data update system:

- **Daily Updates**: Refresh BSR data and sales estimates
- **Weekly Analysis**: Recalculate opportunity scores
- **Background Jobs**: Non-blocking update processing
- **Status Tracking**: Monitor update progress
- **Error Handling**: Robust error recovery

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables in Vercel

Add all the same environment variables from `.env.local` to your Vercel project settings.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Supabase](https://supabase.com/)
- Charts by [Recharts](https://recharts.org/)


**Note**: This tool provides market analysis based on available data and algorithms. Always conduct your own research before making publishing decisions.
