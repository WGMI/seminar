import { Pool } from 'pg'

// Create a connection pool
// In serverless environments, we need to handle connections carefully
let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Parse connection string to check if it's a Neon connection
    const isNeon = connectionString.includes('neon.tech') || connectionString.includes('neon')
    
    pool = new Pool({
      connectionString,
      // Connection pool settings optimized for Neon serverless
      max: 1, // Limit connections for serverless
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // Increased timeout for Neon
      // SSL configuration - Neon requires SSL
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
      // Additional settings for better Neon compatibility
      allowExitOnIdle: true,
      // Keep connections alive
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    })

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err)
      // Reset pool on error to allow reconnection
      pool = null
    })
  }

  return pool
}

// Query helper function with retry logic for Neon
export async function query<T = any>(
  text: string,
  params?: any[],
  retries = 1
): Promise<T[]> {
  const start = Date.now()
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const pool = getPool()
      const res = await pool.query(text, params)
      const duration = Date.now() - start
      
      // Log slow queries in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.log('Slow query:', { text, duration, rows: res.rowCount })
      }
      
      return res.rows as T[]
    } catch (error: any) {
      // If it's a connection error and we have retries left, reset pool and retry
      if (
        attempt < retries &&
        (error.code === 'ETIMEDOUT' || 
         error.code === 'ECONNREFUSED' ||
         error.message?.includes('timeout') ||
         error.message?.includes('Connection terminated'))
      ) {
        console.warn(`Database connection error (attempt ${attempt + 1}/${retries + 1}), retrying...`, error.message)
        // Reset pool to force new connection
        if (pool) {
          try {
            await pool.end()
          } catch {
            // Ignore errors when closing
          }
          pool = null
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }
      
      console.error('Database query error:', error)
      throw error
    }
  }
  
  throw new Error('Query failed after retries')
}

// Single row query helper
export async function queryOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] || null
}

// Close the pool (useful for cleanup in tests)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// Health check function
export async function checkConnection(): Promise<boolean> {
  try {
    await query('SELECT 1')
    return true
  } catch {
    return false
  }
}
