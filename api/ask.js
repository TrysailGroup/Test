const OpenAI = require("openai");
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
    const apiKeyRaw = process.env.OPENAI_API_KEY || "";
    const apiKey = apiKeyRaw.trim();
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { question, messages } = body;
    const inputMessages = Array.isArray(messages)
      ? messages
      : typeof question === "string"
        ? [{ role: "user", content: question }]
        : null;
    if (!inputMessages) {
      return res.status(400).json({
        error: "Request must include `messages` (array) or `question` (string)."
      });
    }
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OPENAI_API_KEY is not configured on the server." });
    }
    if (/\s/.test(apiKey)) {
      return res.status(500).json({
        error:
          "OPENAI_API_KEY looks invalid (it contains whitespace). Re-enter it in Vercel env vars with no spaces/new lines."
      });
    }
    const openai = new OpenAI({ apiKey });
    const safeMessages = inputMessages
      .filter(
        (m) =>
          m &&
          (m.role === "user" || m.role === "assistant" || m.role === "system") &&
          typeof m.content === "string"
      )
      .slice(-40)
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 8000)
      }));
    if (safeMessages.length === 0) {
      return res.status(400).json({ error: "No valid messages provided." });
    }
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: safeMessages
    });
    const answer =
      completion.choices?.[0]?.message?.content?.trim() ||
      "I could not generate an answer.";
    res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    const message = err && typeof err.message === "string" ? err.message : "";
    res.status(500).json({
      error: "Something went wrong talking to the AI on the server.",
      details: message ? message.slice(0, 300) : undefined
    });
  }
};
