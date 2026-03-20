import { GoogleGenerativeAI } from "@google/generative-ai";
import { PromptResult } from "./types";

const POSITIVE_KEYWORDS = [
  "empfehlenswert",
  "hervorragend",
  "ausgezeichnet",
  "top",
  "beste",
  "sehr gut",
  "professionell",
  "zuverlässig",
  "kompetent",
  "erstklassig",
  "spitze",
  "beliebt",
];

const NEGATIVE_KEYWORDS = [
  "schlecht",
  "mangelhaft",
  "unzuverlässig",
  "teuer",
  "nicht empfehlenswert",
  "kritik",
  "probleme",
  "beschwerden",
  "vorsicht",
  "negativ",
];

function analyzeSentiment(
  text: string,
  companyName: string
): "positiv" | "neutral" | "negativ" {
  const lower = text.toLowerCase();
  const nameIdx = lower.indexOf(companyName.toLowerCase());
  if (nameIdx === -1) return "neutral";

  // Check context around the company name (300 chars window)
  const start = Math.max(0, nameIdx - 150);
  const end = Math.min(lower.length, nameIdx + companyName.length + 150);
  const context = lower.substring(start, end);

  const posCount = POSITIVE_KEYWORDS.filter((k) => context.includes(k)).length;
  const negCount = NEGATIVE_KEYWORDS.filter((k) => context.includes(k)).length;

  if (posCount > negCount) return "positiv";
  if (negCount > posCount) return "negativ";
  return "neutral";
}

function findPosition(text: string, companyName: string): number | null {
  const lower = text.toLowerCase();
  const nameLower = companyName.toLowerCase();
  if (!lower.includes(nameLower)) return null;

  // Try to find numbered mentions or position in sentence
  const sentences = text.split(/[.!?\n]+/).filter((s) => s.trim().length > 10);
  let mentionOrder = 0;
  const businessWords = [
    "empfehl",
    "anbieter",
    "firma",
    "unternehmen",
    "betrieb",
    "praxis",
    "kanzlei",
    "büro",
    "agentur",
    "restaurant",
    "salon",
  ];

  for (const sentence of sentences) {
    const sLower = sentence.toLowerCase();
    const hasBusinessContext = businessWords.some((w) => sLower.includes(w));
    // Count proper nouns / company-like mentions
    const words = sentence.split(/\s+/);
    const hasCapitalizedWord = words.some(
      (w) => w.length > 2 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase()
    );

    if (hasBusinessContext || hasCapitalizedWord) {
      mentionOrder++;
      if (sLower.includes(nameLower)) {
        return Math.min(mentionOrder, 5);
      }
    }
  }

  return lower.includes(nameLower) ? 3 : null; // fallback
}

function extractCompetitors(
  text: string,
  companyName: string,
  industry: string,
  city: string
): string[] {
  const competitors: string[] = [];
  const lower = text.toLowerCase();
  const nameLower = companyName.toLowerCase();

  // Look for patterns like "Name GmbH", "Firma Name", numbered lists
  const patterns = [
    /\d+\.\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,3})/g,
    /(?:^|\n)\s*[-•]\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,3})/gm,
    /([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+){0,2})\s+(?:GmbH|AG|e\.K\.|UG|OHG|KG)/g,
  ];

  const skipWords = new Set([
    "die",
    "der",
    "das",
    "ein",
    "eine",
    "und",
    "oder",
    "mit",
    "von",
    "bei",
    "für",
    "nach",
    "aus",
    "wenn",
    "auch",
    "noch",
    "hier",
    "dort",
    "sehr",
    "alle",
    "viele",
    "einige",
    industry.toLowerCase(),
    city.toLowerCase(),
  ]);

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = match[1].trim();
      if (
        name.length > 2 &&
        !skipWords.has(name.toLowerCase()) &&
        name.toLowerCase() !== nameLower &&
        !name.toLowerCase().includes(nameLower) &&
        !competitors.includes(name)
      ) {
        competitors.push(name);
      }
    }
  }

  return competitors.slice(0, 8);
}

export async function queryGemini(
  companyName: string,
  website: string | undefined,
  industry: string,
  city: string
): Promise<PromptResult[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("NO_API_KEY");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompts = [
    `Welcher ${industry} in ${city} ist empfehlenswert?`,
    `Was ist der beste ${industry} in ${city}?`,
    `Ich suche einen guten ${industry} in ${city}, wen empfiehlst du?`,
    `Vergleiche ${industry}-Anbieter in ${city}`,
    `Welcher ${industry} in ${city} hat die besten Bewertungen?`,
  ];

  const results: PromptResult[] = [];

  // Sequential to respect rate limits
  for (const prompt of prompts) {
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const lower = responseText.toLowerCase();
      const mentioned =
        lower.includes(companyName.toLowerCase()) ||
        (website ? lower.includes(website.toLowerCase().replace(/^https?:\/\//, "")) : false);

      results.push({
        prompt,
        response: responseText,
        mentioned,
        position: mentioned ? findPosition(responseText, companyName) : null,
        sentiment: analyzeSentiment(responseText, companyName),
        competitors: extractCompetitors(responseText, companyName, industry, city),
      });

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Gemini error for prompt "${prompt}":`, error);
      results.push({
        prompt,
        response: "Fehler bei der Abfrage",
        mentioned: false,
        position: null,
        sentiment: "neutral",
        competitors: [],
      });
    }
  }

  return results;
}
