const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const { bundle } = require("@remotion/bundler");
const { getCompositions, renderMedia } = require("@remotion/renderer");
const generateDynamicVideo = require("../src/generateDynamicVideo");
const { uploadToSupabase } = require("../libs/supabase/storage");

// Create output directory if it doesn't exist
const outputDir = path.resolve(__dirname, "../out");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" })); // Increased limit for larger requests
app.use("/videos", express.static(outputDir));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Hook generation endpoint (SECURE - API key stays on backend)
app.post("/generate-hooks", async (req, res) => {
  try {
    const { product, count = 10 } = req.body;
    
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Product information is required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("OpenAI API key not configured");
      return res.status(500).json({
        success: false,
        message: "OpenAI service not configured"
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
    
    res.json({
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
});

// Test endpoint to verify props are being received correctly
app.post("/test-props", (req, res) => {
  console.log("Test endpoint received:", req.body);
  res.json({
    received: req.body,
    message: "Props received successfully",
  });
});

app.post("/render-video", async (req, res) => {
  try {
    // Log the raw request body first
    console.log("Raw request body:", JSON.stringify(req.body));

    // Extract props with defaults
    const durationInSeconds = req.body.durationInSeconds || 10;
    const audioOffsetInSeconds = req.body.audioOffsetInSeconds || 0; // Changed default to 0
    const titleText = req.body.titleText || "Default Title";
    const textPosition = req.body.textPosition || "bottom";
    const enableAudio = req.body.enableAudio !== false; // Default to true

    // Split screen parameters
    const splitScreen = req.body.splitScreen || false;
    const splitPosition = req.body.splitPosition;

    // Direct URL parameters
    const videoSource = req.body.videoSourceUrl;
    const demoVideoSource = req.body.demoVideoSourceUrl;
    const audioSource = req.body.audioSourceUrl;

    // Validate splitPosition value
    const validSplitPositions = [
      "left-right",
      "right-left",
      "top-bottom",
      "bottom-top",
    ];
    if (splitScreen && !validSplitPositions.includes(splitPosition)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid splitPosition value. Must be one of: left-right, right-left, top-bottom, bottom-top",
      });
    }

    // Log explicit values for debugging
    console.log("\nExtracted titleText:", titleText);
    console.log("Duration of the Video (seconds):", durationInSeconds);
    console.log("Extracted textPosition:", textPosition);
    console.log("Enable additional audio:", enableAudio);
    console.log("Split screen mode:", splitScreen);
    console.log("Split screen position:", splitPosition);
    console.log("Video source URL:", videoSource);
    console.log("Demo video source URL:", demoVideoSource);
    console.log("Audio source URL:", audioSource);
    console.log("Audio offset (seconds):", audioOffsetInSeconds);

    // Generate a dynamic video component with the specified values
    console.log("\nGenerating dynamic component with title:", titleText);
    const { indexPath, componentName } = generateDynamicVideo({
      titleText,
      durationInSeconds,
      audioOffsetInSeconds,
      textPosition,
      videoSource,
      audioSource,
      enableAudio: true, // Always enable audio if audioSource is provided
      splitScreen,
      demoVideoSource,
      splitPosition,
    });

    console.log("Generated dynamic component:", componentName);
    console.log("Dynamic index path:", indexPath);

    // Generate a unique filename
    const outputFilename = `video-${Date.now()}.mp4`;
    const outputPath = path.resolve(outputDir, outputFilename);

    // Bundle the dynamic Remotion project
    console.log("Bundling dynamic component...");
    // Don't pass bundleOptions, use default options
    const bundled = await bundle(indexPath);

    // Get the compositions
    const compositions = await getCompositions(bundled);
    const composition = compositions.find((c) => c.id === componentName);

    if (!composition) {
      throw new Error(`Composition '${componentName}' not found`);
    }

    // Calculate frames based on duration
    const durationInFrames = Math.floor(durationInSeconds * composition.fps);

    // Render the video
    console.log("Starting render...");
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      durationInFrames,
      timeoutInMilliseconds: 420000, // 7 minutes overall timeout
      delayRenderTimeoutInMilliseconds: 300000, // 5 minutes for delayRender timeouts

      onProgress: (progress) => {
        // Use process.stdout.write with \r to update the same line
        process.stdout.write(
          `\rRendering progress: ${Math.floor(progress.progress * 100)}%`
        );

        // Add a newline when rendering is complete
        if (progress.progress === 1) {
          process.stdout.write("\n");
        }
      },
    });

    // Clean up the generated component files
    try {
      fs.unlinkSync(indexPath);
      fs.unlinkSync(indexPath.replace("-index.jsx", ".jsx"));
      console.log("Cleaned up temporary component files");
    } catch (err) {
      console.warn("Failed to clean up temporary component files:", err);
    }

    console.log("Video rendered successfully. Uploading to Supabase...");

    // Upload the rendered video to Supabase storage
    const supabaseUrl = await uploadToSupabase(outputPath, outputFilename);
    console.log("Video uploaded to Supabase:", supabaseUrl);

    // Clean up the local video file
    try {
      fs.unlinkSync(outputPath);
      console.log("Deleted local video file");
    } catch (err) {
      console.warn("Failed to delete local video file:", err);
    }

    console.log(
      "\n-------------------------------------------\n-------------------------------------------\n"
    );

    // Return the Supabase URL to download the video
    res.json({
      success: true,
      message: "Video rendered and uploaded successfully",
      videoUrl: supabaseUrl,
      usedValues: {
        titleText,
        textPosition,
        splitScreen,
        splitPosition,
        usedVideoSource: videoSource,
        usedDemoVideoSource: demoVideoSource,
        usedAudioSource: audioSource,
      },
    });
  } catch (error) {
    console.error("Error rendering or uploading video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process video",
      error: error.message,
      stack: error.stack,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}\n`);
});
