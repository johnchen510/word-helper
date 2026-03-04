export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { word } = req.body;
  if (!word) return res.status(400).json({ error: "No word provided" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `You are a friendly helper for young children (ages 4-8) learning to read and pronounce words. 
When given a word, respond ONLY with a JSON object (no markdown, no extra text) with these exact fields:
- "word": the word (capitalized nicely)
- "phonetic": the phonetic spelling using simple hyphens and capital letters for stressed syllables, e.g. "EL-uh-fant"
- "howToSay": a fun, encouraging explanation like "Say EL (like the letter L), then uh (a soft sound), then FANT (rhymes with 'ant')! Put it together: EL-uh-fant!"
- "funFact": one short, delightful, age-appropriate fun fact about the word or thing it describes (1-2 sentences max)
- "syllableCount": just the number of syllables as an integer

Keep language very simple and encouraging. Use emoji sparingly in howToSay and funFact.`,
        messages: [{ role: "user", content: `Help me pronounce this word: "${word}"` }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    res.status(200).json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
