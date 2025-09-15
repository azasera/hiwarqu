-- Create hiwar table
CREATE TABLE IF NOT EXISTS public.hiwar (
    id TEXT PRIMARY KEY,
    title_ar TEXT NOT NULL,
    title_id TEXT NOT NULL,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    lines JSONB NOT NULL,
    meta JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vocabulary table
CREATE TABLE IF NOT EXISTS public.vocabulary (
    id TEXT PRIMARY KEY,
    arabic TEXT NOT NULL,
    indonesian TEXT NOT NULL,
    root TEXT,
    category TEXT NOT NULL DEFAULT 'Umum',
    examples TEXT[] DEFAULT '{}',
    frequency INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hiwar_title_ar ON public.hiwar USING GIN (to_tsvector('arabic', title_ar));
CREATE INDEX IF NOT EXISTS idx_hiwar_title_id ON public.hiwar USING GIN (to_tsvector('indonesian', title_id));
CREATE INDEX IF NOT EXISTS idx_hiwar_tags ON public.hiwar USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_hiwar_created_at ON public.hiwar (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vocabulary_arabic ON public.vocabulary USING GIN (to_tsvector('arabic', arabic));
CREATE INDEX IF NOT EXISTS idx_vocabulary_indonesian ON public.vocabulary USING GIN (to_tsvector('indonesian', indonesian));
CREATE INDEX IF NOT EXISTS idx_vocabulary_category ON public.vocabulary (category);
CREATE INDEX IF NOT EXISTS idx_vocabulary_frequency ON public.vocabulary (frequency DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.hiwar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a learning app)
-- Allow all operations for authenticated and anonymous users
CREATE POLICY "Allow all operations on hiwar" ON public.hiwar
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on vocabulary" ON public.vocabulary
    FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_hiwar_updated_at BEFORE UPDATE ON public.hiwar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vocabulary_updated_at BEFORE UPDATE ON public.vocabulary
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();