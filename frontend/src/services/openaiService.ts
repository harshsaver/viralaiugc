interface Product {
  app_name: string;
  short_description: string;
  long_description: string | null;
  target_audience: string | null;
  example_hooks: string | null;
  example_hashtags: string | null;
  value_proposition: string | null;
  social_strategy: string | null;
}

export async function generateHooks(
  product: Product, 
  count: number = 10
): Promise<string[]> {
  try {
    // Try Vercel serverless function first (for production)
    // Then fall back to local backend (for development)
    const endpoints = [
      '/api/generate-hooks',  // Vercel serverless function
      'http://localhost:3000/generate-hooks'  // Local backend
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product,
            count
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || `Server error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to generate hooks');
        }
        
        return data.hooks || [];
      } catch (error) {
        lastError = error as Error;
        // If it's not a network error, throw it immediately
        if (!(error instanceof TypeError && error.message.includes('Failed to fetch'))) {
          throw error;
        }
        // Otherwise, try the next endpoint
      }
    }

    // If all endpoints failed
    throw new Error('Unable to connect to AI service. Please ensure either the backend server is running locally or deploy to Vercel.');
  } catch (error) {
    console.error('Error generating hooks:', error);
    throw error;
  }
} 