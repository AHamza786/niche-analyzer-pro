-- Create update jobs table for tracking background updates
CREATE TABLE IF NOT EXISTS update_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    processed_items INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_update_jobs_status ON update_jobs(status);
CREATE INDEX IF NOT EXISTS idx_update_jobs_created_at ON update_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_update_jobs_type ON update_jobs(type);

-- Create trigger for updated_at
CREATE TRIGGER update_update_jobs_updated_at BEFORE UPDATE ON update_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
