-- Create keywords table
CREATE TABLE IF NOT EXISTS keywords (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create books table
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    asin VARCHAR(20) NOT NULL UNIQUE,
    title TEXT NOT NULL,
    publisher VARCHAR(255),
    price DECIMAL(10,2),
    current_bsr INTEGER,
    review_count INTEGER DEFAULT 0,
    publication_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create BSR history table for tracking sales trends
CREATE TABLE IF NOT EXISTS bsr_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    bsr INTEGER NOT NULL,
    date DATE NOT NULL,
    daily_sales INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(book_id, date)
);

-- Create keyword metrics table for calculated analytics
CREATE TABLE IF NOT EXISTS keyword_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    total_sales INTEGER DEFAULT 0,
    self_pub_sales INTEGER DEFAULT 0,
    demand_trend VARCHAR(20) DEFAULT 'stable',
    royalties DECIMAL(12,2) DEFAULT 0,
    new_publications_30d INTEGER DEFAULT 0,
    supply_trend VARCHAR(20) DEFAULT 'stable',
    success_rate DECIMAL(5,2) DEFAULT 0,
    self_pub_percentage DECIMAL(5,2) DEFAULT 0,
    opportunity_score DECIMAL(5,2) DEFAULT 0,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(keyword_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_keyword_id ON books(keyword_id);
CREATE INDEX IF NOT EXISTS idx_books_current_bsr ON books(current_bsr);
CREATE INDEX IF NOT EXISTS idx_bsr_history_book_id ON bsr_history(book_id);
CREATE INDEX IF NOT EXISTS idx_bsr_history_date ON bsr_history(date);
CREATE INDEX IF NOT EXISTS idx_keyword_metrics_opportunity_score ON keyword_metrics(opportunity_score DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_keywords_updated_at BEFORE UPDATE ON keywords
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
