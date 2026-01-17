-- ============================================
-- RAG System Database Setup
-- Run this script on Railway Postgres to enable pgvector
-- ============================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 3. Create document_sections table (if not created by Prisma migration)
-- Note: This is a backup in case Prisma migration doesn't handle Unsupported type correctly
CREATE TABLE IF NOT EXISTS document_sections (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}',
    embedding vector(768),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS document_sections_embedding_idx 
ON document_sections 
USING hnsw (embedding vector_cosine_ops);

-- 5. Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS document_sections_created_at_idx 
ON document_sections (created_at);

-- 6. Verify table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'document_sections';

-- ============================================
-- Test Query (run after inserting some documents)
-- ============================================
-- SELECT content, metadata, 
--        1 - (embedding <=> '[0.1, 0.2, ...]'::vector) AS similarity
-- FROM document_sections
-- ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector
-- LIMIT 3;
