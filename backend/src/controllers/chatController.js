// Uses Node.js 18+ native fetch (no node-fetch needed)

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const SYSTEM_PROMPT = `You are AuraFit AI — a friendly, expert fitness and wellness coach. 
You help users with workout advice, nutrition tips, mental wellness, exercise form, and healthy habits.
Keep responses concise, motivating, and actionable. Use emojis sparingly for a modern feel.
If asked about something unrelated to fitness/health, gently redirect to your specialty.`;

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars).' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[Chat] OPENROUTER_API_KEY not set in .env');
      return res.status(500).json({ reply: 'Chatbot is not configured. Contact the admin.' });
    }

    // Build conversation — include last 10 messages for context
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AuraFit AI',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[Chat] OpenRouter error:', response.status, err);
      return res.status(502).json({
        reply: "I'm having trouble connecting right now. Please try again in a moment! 💪",
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(502).json({
        reply: "I didn't get a response from the AI. Please try again!",
      });
    }

    res.json({ reply });
  } catch (err) {
    console.error('[Chat] Unexpected error:', err.message);
    res.status(500).json({
      reply: "Something went wrong on my end. Please try again! 🙏",
    });
  }
};
