import { FreeCheckResult, PromptResult } from "./types";

// Realistic competitor names per industry
const INDUSTRY_COMPETITORS: Record<string, string[]> = {
  "Maler & Lackierer": ["Malerbetrieb Hofmann", "Farbe & Design Krause", "Maler Bergmann GmbH", "Krüger Malerarbeiten", "Malermeister Hartmann"],
  "Elektriker": ["Elektro Bauer GmbH", "Strom & Licht Schäfer", "Elektrotechnik Werner", "E-Service König", "Elektro Zimmermann"],
  "Klempner / Sanitär": ["Sanitär Hoffmann", "Rohrtechnik Schröder", "Haustechnik Braun", "SHK Meisterbetrieb Wolf", "Sanitär & Heizung Fuchs"],
  "Zahnarzt": ["Zahnarztpraxis Dr. Hoffmann", "Dental Zentrum am Markt", "Praxis Dr. Bergmann", "Zahnmedizin Dr. Klein", "Zahnarzt Dr. Roth"],
  "Anwalt": ["Kanzlei Hoffmann & Partner", "Rechtsanwälte Bergmann", "Anwaltsbüro Dr. Krause", "Kanzlei Schäfer", "RA Dr. Lehmann"],
  "Steuerberater": ["Steuerkanzlei Hoffmann", "Steuerberatung Braun & Partner", "ETL Steuerberatung", "Kanzlei Schröder", "Steuerberater Richter"],
  "Restaurant": ["Gasthaus Zum Goldenen Hirsch", "Ristorante Da Luigi", "Landgasthof Mühlbach", "Restaurant Seeblick", "Wirtshaus am Dom"],
  "Immobilienmakler": ["Immobilien Hoffmann", "Engel & Völkers", "RE/MAX Immobilien", "Von Poll Immobilien", "Immo-Service Braun"],
  "Friseur": ["Hair Design Studio", "Salon Haargenau", "Friseur Kopfsache", "Salon Elegance", "Haarstudio Trend"],
  "IT-Dienstleister / Agentur": ["Digital Solutions GmbH", "WebTech Agentur", "IT-Service Braun", "NetWorks IT", "CodeCraft Digital"],
  "Dachdecker": ["Dachdeckerei Hoffmann", "Dach & Fassade Braun", "Meisterbetrieb Schäfer Dach", "Dachtechnik Werner", "Dachdecker Krause"],
  "Schreiner / Tischler": ["Tischlerei Hoffmann", "Schreinerei Braun", "Holzwerkstatt Weber", "Möbelmanufaktur Schäfer", "Tischlermeister Krause"],
  "Physiotherapeut": ["Physiotherapie Am Park", "Praxis Bewegungswelt", "PhysioVital Zentrum", "Therapiezentrum Hoffmann", "Physio Aktiv"],
  "Tierarzt": ["Tierarztpraxis Dr. Hoffmann", "Kleintierpraxis Am Stadtpark", "Tierklinik Braun", "Veterinärpraxis Dr. Schäfer", "Tierarzt Dr. Krause"],
  "Optiker": ["Optik Hoffmann", "Brillenstudio Am Markt", "Fielmann", "Apollo Optik", "Augenoptik Braun"],
  "Apotheke": ["Stadtapotheke Am Markt", "Löwen-Apotheke", "Adler-Apotheke", "Rathaus-Apotheke", "Sonnen-Apotheke"],
  "Fahrschule": ["Fahrschule Hoffmann", "Fahrschule Am Start", "Fahrschule Easy Drive", "Fahrschule Braun", "Fahrschule Grünes Licht"],
  "Fotograf": ["Fotostudio Hoffmann", "Lichtblick Fotografie", "Bildschön Studio", "Foto Krause", "Momentaufnahme Fotografie"],
  "Architekt": ["Architekturbüro Hoffmann", "Planwerk Architekten", "Braun & Partner Architekten", "Architekten Schäfer", "Baukunst Architektur"],
  "Reinigungsfirma": ["Clean Team GmbH", "Gebäudereinigung Hoffmann", "Sauber & Rein Service", "Reinigungsservice Braun", "Blitz Blank GmbH"],
  "Umzugsunternehmen": ["Umzüge Hoffmann", "Zapf Umzüge", "Umzugsprofis Express", "Braun Transporte", "Easy Move Umzüge"],
  "Schlüsseldienst": ["Schlüsseldienst Hoffmann 24h", "Aufsperrdienst Express", "Schlüssel-Fuchs", "24h Schlüsselnotdienst Braun", "Sicher & Schnell Schlüsseldienst"],
  "Autowerkstatt / KFZ": ["Auto Hoffmann GmbH", "KFZ-Meisterbetrieb Braun", "Autoservice am Bahnhof", "Werkstatt Schäfer", "KFZ-Technik Werner"],
  "Bäckerei / Konditorei": ["Bäckerei Hoffmann", "Landbäckerei Braun", "Backstube Am Markt", "Konditorei Süßes Eck", "Bäckermeister Krause"],
  "Hotel / Pension": ["Hotel Am Stadtpark", "Pension Sonnenhof", "Landhotel Zur Post", "Hotel Braun", "Gasthof Goldener Stern"],
};

function getCompetitorsForIndustry(industry: string): string[] {
  return INDUSTRY_COMPETITORS[industry] || [
    "Fachbetrieb Hoffmann",
    "Meisterbetrieb Braun",
    "Service Schäfer GmbH",
    "Betrieb Werner & Co.",
    "Qualitätsservice Krause",
  ];
}

export function generateMockData(
  companyName: string,
  industry: string,
  city: string
): FreeCheckResult {
  const prompts = [
    `Welcher ${industry} in ${city} ist empfehlenswert?`,
    `Was ist der beste ${industry} in ${city}?`,
    `Ich suche einen guten ${industry} in ${city}, wen empfiehlst du?`,
    `Vergleiche ${industry}-Anbieter in ${city}`,
    `Welcher ${industry} in ${city} hat die besten Bewertungen?`,
  ];

  const mockCompetitors = getCompetitorsForIndustry(industry);

  // Simulate: company mentioned in 2 out of 5 prompts
  const mockPromptResults: PromptResult[] = prompts.map((prompt, i) => {
    const mentioned = i === 1 || i === 3; // mentioned in prompt 2 and 4
    const competitorsInResponse = mockCompetitors.slice(0, 3);
    
    const responseText = mentioned
      ? `In ${city} gibt es mehrere gute ${industry}-Anbieter. Besonders empfehlenswert ist ${companyName}, die durch gute Bewertungen auffallen. Weitere Optionen sind ${competitorsInResponse.join(", ")}.`
      : `Für ${industry} in ${city} kann ich folgende Anbieter empfehlen: ${competitorsInResponse.join(", ")}. Diese haben durchweg gute Bewertungen und langjährige Erfahrung.`;

    return {
      prompt,
      response: responseText,
      mentioned,
      position: mentioned ? (i === 1 ? 1 : 3) : null,
      sentiment: mentioned ? "positiv" : "neutral",
      competitors: competitorsInResponse,
    };
  });

  const mentionCount = mockPromptResults.filter((p) => p.mentioned).length;
  const mentionRate = (mentionCount / prompts.length) * 100;

  // Aggregate competitors
  const competitorMap = new Map<string, number>();
  mockPromptResults.forEach((pr) => {
    pr.competitors.forEach((c) => {
      if (c.toLowerCase() !== companyName.toLowerCase()) {
        competitorMap.set(c, (competitorMap.get(c) || 0) + 1);
      }
    });
  });
  const competitors = Array.from(competitorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate score
  const avgPosition =
    mockPromptResults
      .filter((p) => p.position !== null)
      .reduce((sum, p) => sum + (p.position || 0), 0) /
      (mentionCount || 1);
  const positionScore = Math.max(0, 100 - (avgPosition - 1) * 30);
  const sentimentScore = mockPromptResults.filter(
    (p) => p.sentiment === "positiv"
  ).length / prompts.length * 100;

  const overall_score = Math.round(
    mentionRate * 0.5 + positionScore * 0.3 + sentimentScore * 0.2
  );

  return {
    companyName,
    industry,
    city,
    overall_score,
    mention_rate: mentionRate,
    prompts: mockPromptResults,
    competitors,
    recommendations: [], // Not used anymore - results page has its own tips
    platform: "Gemini",
  };
}
