/**
 * Vercel serverless function: handles POST /api/export
 * It takes the current chat messages and returns a Word-compatible
 * document (RTF) as a downloadable file.
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: "No messages to export. Ask something first." });
    }

    // Basic RTF header with a standard font.
    let rtf =
      "{\\rtf1\\ansi\\deff0" +
      "{\\fonttbl{\\f0 Calibri;}}" +
      "\\fs22\n";

    const escapeRtf = (text) =>
      String(text)
        .replace(/\\/g, "\\\\")
        .replace(/{/g, "\\{")
        .replace(/}/g, "\\}");

    for (const m of messages) {
      if (!m || typeof m.content !== "string" || !m.role) continue;
      const roleLabel = m.role === "user" ? "You" : "AI";
      rtf += "\\b " + escapeRtf(roleLabel) + ":\\b0\\line\n";

      const lines = m.content.split(/\r?\n/);
      for (const line of lines) {
        rtf += escapeRtf(line) + "\\line\n";
      }
      rtf += "\\line\n";
    }

    rtf += "}";

    const buffer = Buffer.from(rtf, "utf8");

    res.setHeader(
      "Content-Type",
      "application/msword; charset=utf-8"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ai-chat.doc"'
    );

    return res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    const message = err && typeof err.message === "string" ? err.message : "";
    return res.status(500).json({
      error: "Failed to export conversation.",
      details: message ? message.slice(0, 300) : undefined
    });
  }
};

