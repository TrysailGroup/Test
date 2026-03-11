const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Vercel serverless function: handles POST /api/ask
 * This function runs on Vercel and keeps your API key on the server.
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY is not configured on the server." });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: question
        }
      ]
    });

    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I could not generate an answer.";

    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Something went wrong talking to the AI on the server." });
  }
};

