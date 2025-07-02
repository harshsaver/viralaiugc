// This is a Vercel Serverless Function
// Place this file in frontend/api/generate-carousel-text.js

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
    const { product, slideNumber, existingTexts = [] } = req.body;
    
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

    const systemPrompt = `You are an expert carousel content creator for social media platforms like TikTok and Instagram. You create concise, engaging text for carousel slides that tells a compelling story about products. Each slide should have brief, punchy text that works together to create a narrative flow.`;
    
    const userPrompt = `Create a single piece of text for slide ${slideNumber} of a product carousel.

PRODUCT DETAILS:
App Name: ${product.app_name}
Description: ${product.short_description}
${product.long_description ? `Full Details: ${product.long_description}` : ''}
${product.target_audience ? `Target Audience: ${product.target_audience}` : ''}
${product.value_proposition ? `Value Proposition: ${product.value_proposition}` : ''}
${product.social_strategy ? `Social Strategy: ${product.social_strategy}` : ''}

${existingTexts.length > 0 ? `EXISTING SLIDES TEXT:
${existingTexts.map((text, i) => `Slide ${i + 1}: ${text}`).join('\n')}` : ''}

CAROUSEL TEXT RULES:
1. Keep it EXTREMELY brief - maximum 8-12 words per slide
2. Use the slide number to determine the content:
   - Slide 1: Hook or problem statement
   - Slide 2-3: Build tension or explain the issue
   - Slide 4-5: Introduce the solution (the product)
   - Slide 6-7: Benefits or results
   - Slide 8+: Call to action or final thought

3. Make each slide text:
   - Stand alone but connect to the story
   - Create curiosity for the next slide
   - Use emotional or power words
   - Be conversational and relatable

4. Text formatting:
   - Use line breaks strategically for impact
   - Keep centered alignment in mind
   - Make it readable on mobile

5. Avoid:
   - Long sentences
   - Complex words
   - Too much punctuation
   - Being too salesy

Based on the slide number and existing content, generate ONE piece of text for slide ${slideNumber}. Return ONLY the text, no explanations or slide numbers.`;

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
        temperature: 0.8,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content?.trim() || '';
    
    res.status(200).json({
      success: true,
      text: text
    });
  } catch (error) {
    console.error('Error generating carousel text:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate carousel text',
      error: error.message
    });
  }
} 