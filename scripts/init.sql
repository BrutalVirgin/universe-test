CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) UNIQUE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('facebook', 'tiktok')),
    funnel_stage VARCHAR(50) NOT NULL CHECK (funnel_stage IN ('top', 'bottom')),
    event_type VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );
