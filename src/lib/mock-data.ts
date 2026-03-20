import { FreeCheckResult, PromptResult } from "./types";

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

  const mockCompetitors = [
    `${industry} Schmidt`,
    `${industry} Müller`,
    `${industry} Weber`,
    `${industry} Fischer`,
    `Top ${industry} ${city}`,
  ];

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

  // Calculate score: mention_rate (50%) + position bonus (30%) + sentiment bonus (20%)
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
    recommendations: getRecommendations(overall_score),
    platform: "Gemini",
  };
}

function getRecommendations(score: number): string[] {
  if (score >= 60) {
    return [
      "Dein Unternehmen wird bereits von KI empfohlen — gute Ausgangslage!",
      "Optimiere deine Website-Strukturdaten (Schema.org) für noch bessere KI-Erkennung.",
      "Sammle aktiv Google-Bewertungen — KI-Modelle gewichten diese stark.",
      "Erstelle einen FAQ-Bereich auf deiner Website mit häufigen Kundenfragen.",
    ];
  }
  if (score >= 30) {
    return [
      "Dein Unternehmen taucht nur teilweise in KI-Antworten auf — hier gibt es Potenzial.",
      "Erstelle hochwertigen Content zu deiner Branche und deinem Standort.",
      "Pflege dein Google Business Profil vollständig — inkl. Öffnungszeiten, Fotos, Beschreibung.",
      "Baue lokale Backlinks auf (Branchenverzeichnisse, lokale Presse).",
      "Fordere zufriedene Kunden aktiv zu Bewertungen auf.",
    ];
  }
  return [
    "Dein Unternehmen wird von KI-Systemen aktuell nicht empfohlen — dringender Handlungsbedarf!",
    "Erstelle oder optimiere dein Google Business Profil mit vollständigen Informationen.",
    "Baue eine professionelle Website mit lokalen Keywords und Strukturdaten auf.",
    "Starte eine Bewertungs-Kampagne — Unternehmen ohne Bewertungen werden von KI ignoriert.",
    "Trage dich in relevante Branchenverzeichnisse ein (z.B. Das Örtliche, Gelbe Seiten).",
    "Erstelle regelmäßig Inhalte (Blog, FAQ) die zeigen, dass dein Unternehmen aktiv ist.",
  ];
}
