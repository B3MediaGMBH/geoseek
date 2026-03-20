import { NextRequest, NextResponse } from "next/server";
import { FreeCheckRequest, FreeCheckResult } from "@/lib/types";
import { queryGemini } from "@/lib/gemini";
import { generateMockData } from "@/lib/mock-data";

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

export async function POST(request: NextRequest) {
  try {
    const body: FreeCheckRequest = await request.json();

    // Validation
    if (!body.companyName || !body.industry || !body.city) {
      return NextResponse.json(
        { error: "Firmenname, Branche und Stadt sind Pflichtfelder." },
        { status: 400 }
      );
    }

    if (body.companyName.length > 100 || body.city.length > 100) {
      return NextResponse.json(
        { error: "Eingaben sind zu lang." },
        { status: 400 }
      );
    }

    // Try Gemini, fall back to mock data
    let useMock = false;
    let promptResults;

    try {
      promptResults = await queryGemini(
        body.companyName,
        body.website,
        body.industry,
        body.city
      );
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NO_API_KEY") {
        useMock = true;
      } else {
        console.error("Gemini API error:", error);
        useMock = true;
      }
    }

    if (useMock) {
      const mockResult = generateMockData(
        body.companyName,
        body.industry,
        body.city
      );
      return NextResponse.json(mockResult);
    }

    // Calculate results from real Gemini data
    const mentionCount = promptResults!.filter((p) => p.mentioned).length;
    const totalPrompts = promptResults!.length;
    const mentionRate = (mentionCount / totalPrompts) * 100;

    // Aggregate competitors
    const competitorMap = new Map<string, number>();
    promptResults!.forEach((pr) => {
      pr.competitors.forEach((c) => {
        if (c.toLowerCase() !== body.companyName.toLowerCase()) {
          competitorMap.set(c, (competitorMap.get(c) || 0) + 1);
        }
      });
    });
    const competitors = Array.from(competitorMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate overall score
    const mentionedResults = promptResults!.filter((p) => p.position !== null);
    const avgPosition =
      mentionedResults.length > 0
        ? mentionedResults.reduce((sum, p) => sum + (p.position || 0), 0) /
          mentionedResults.length
        : 5;
    const positionScore = Math.max(0, 100 - (avgPosition - 1) * 30);
    const sentimentScore =
      (promptResults!.filter((p) => p.sentiment === "positiv").length /
        totalPrompts) *
      100;

    const overall_score = Math.round(
      mentionRate * 0.5 + positionScore * 0.3 + sentimentScore * 0.2
    );

    const result: FreeCheckResult = {
      companyName: body.companyName,
      industry: body.industry,
      city: body.city,
      overall_score,
      mention_rate: mentionRate,
      prompts: promptResults!,
      competitors,
      recommendations: getRecommendations(overall_score),
      platform: "Gemini",
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Free check error:", error);
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
