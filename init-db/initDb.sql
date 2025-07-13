-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify the extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Create the vector store table
CREATE TABLE IF NOT EXISTS vector_store (
                                            id UUID PRIMARY KEY,
                                            content TEXT,
                                            metadata JSONB,
                                            embedding VECTOR(768)  -- 768 dimensions for nomic-embed-text
    );

-- Create an HNSW index on the embedding column using cosine distance
CREATE INDEX IF NOT EXISTS vector_store_embedding_idx
    ON vector_store USING hnsw (embedding vector_cosine_ops);
