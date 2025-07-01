interface Product {
  app_name: string;
  short_description: string;
  long_description: string | null;
  target_audience: string | null;
  example_hooks: string | null;
  example_hashtags: string | null;
}

export async function generateHooks(
  product: Product, 
  openaiApiKey: string,
  count: number = 10
): Promise<string[]> {
  try {
    const systemPrompt = `You are a social media content expert specializing in creating viral hooks for TikTok and Instagram Reels. Generate engaging, attention-grabbing hooks that drive viewer retention.`;
    
    const userPrompt = `Generate ${count} viral hooks for the following product:

App Name: ${product.app_name}
Description: ${product.short_description}
${product.long_description ? `Detailed Description: ${product.long_description}` : ''}
${product.target_audience ? `Target Audience: ${product.target_audience}` : ''}
${product.example_hooks ? `Example hooks from competitors:\n${JSON.parse(product.example_hooks).join('\n')}` : ''}
${product.example_hashtags ? `Relevant hashtags: ${JSON.parse(product.example_hashtags).join(' ')}` : ''}

Requirements:
- Keep hooks short and punchy (under 50 characters ideally)
- Use psychological triggers (curiosity, FOMO, urgency)
- Include power words and emotional language
- Make them scroll-stopping and engaging
- Vary the hook styles (questions, statements, POV, challenges)
- Make them relevant to the product's value proposition

Return ONLY the hooks, one per line, without numbers or bullets.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Split by newlines and filter out empty lines
    const hooks = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/)); // Remove numbered lines
    
    return hooks.slice(0, count);
  } catch (error) {
    console.error('Error generating hooks:', error);
    throw error;
  }
} 