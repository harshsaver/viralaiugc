// This is a Vercel Serverless Function
// Place this file in frontend/api/generate-hooks.js

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { product, count = 10 } = req.body;
    
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product information is required"
      });
    }
    
    // Access environment variable WITHOUT VITE_ prefix
    const apiKey = process.env.OPEN_AI_API;
    
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return res.status(500).json({
        success: false,
        message: 'OpenAI service not configured'
      });
    }

    const systemPrompt = `You are a world-class social media content strategist and viral hook expert. Your specialty is creating scroll-stopping hooks that generate millions of views on TikTok, Instagram Reels, and YouTube Shorts. You understand human psychology, emotion, and what makes people stop scrolling.

Your hooks have helped creators go from 0 to millions of followers. You know exactly how to trigger curiosity, create urgency, and tap into deep human desires and fears.`;
    
    const userPrompt = `Create ${count} ULTRA-VIRAL hooks for this product. These hooks MUST make people stop scrolling immediately.

PRODUCT DETAILS:
App Name: ${product.app_name}
Description: ${product.short_description}
${product.long_description ? `Full Details: ${product.long_description}` : ''}
${product.target_audience ? `Target Audience: ${product.target_audience}` : ''}
${product.example_hooks ? `Competitor Hooks for Reference:\n${JSON.parse(product.example_hooks).join('\n')}` : ''}
${product.example_hashtags ? `Trending Hashtags: ${JSON.parse(product.example_hashtags).join(' ')}` : ''}

HOOK CREATION RULES:
1. MAXIMUM 8-12 words per hook (shorter = more viral)
2. Start with psychological triggers:
   - "POV: You just discovered..."
   - "The reason you're still..."
   - "Nobody talks about how..."
   - "This is why 99% of people..."
   - "Stop doing X if you want Y"
   - "I was today years old when..."
   - "Warning: This will change how you..."

3. Use these viral frameworks:
   - Controversy: Challenge common beliefs
   - Curiosity Gap: Tease but don't reveal
   - Pattern Interrupt: Say something unexpected
   - Fear/FOMO: What they're missing out on
   - Social Proof: "Everyone is switching to..."
   - Transformation: Before/after implications
   - Secret/Insider: "What they don't tell you..."

4. Power words to include:
   - Secretly, Actually, Literally, Honestly
   - Shocking, Insane, Crazy, Wild
   - Nobody, Everyone, Finally
   - Stop, Never, Always
   - Hack, Trick, Secret, Truth

5. Emotional triggers:
   - Make them feel smart for discovering this
   - Create urgency without being salesy
   - Tap into their biggest pain points
   - Promise transformation or revelation

6. Format variety:
   - Questions that hit different
   - Bold statements they can't ignore
   - Relatable scenarios (POV style)
   - Controversial takes
   - "Hot takes" that spark debate

ANALYZE the product deeply and create hooks that:
- Address the core problem it solves
- Highlight unique benefits competitors miss
- Create "aha moments"
- Make people feel they NEED this

Return ONLY the hooks, one per line. No numbers, no explanations. Make every single hook so compelling that NOT clicking would feel like a mistake.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 800,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Split by newlines and filter out empty lines
    const hooks = content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && !line.match(/^\d+[\.\)]/))
      .filter(line => line.length < 100);
    
    res.status(200).json({
      success: true,
      hooks: hooks.slice(0, count)
    });
  } catch (error) {
    console.error('Error generating hooks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate hooks',
      error: error.message
    });
  }
} 