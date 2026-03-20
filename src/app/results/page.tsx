"use client";

import { useEffect, useState } from "react";
import { FreeCheckResult } from "@/lib/types";

function getScoreExplanation(score: number): { emoji: string; title: string; description: string } {
  if (score <= 20) {
    return {
      emoji: "❌",
      title: "Nicht sichtbar",
      description: "Die KI kennt dein Unternehmen nicht. Kunden die ChatGPT oder Google fragen, finden dich nicht.",
    };
  }
  if (score <= 40) {
    return {
      emoji: "⚠️",
      title: "Kaum sichtbar",
      description: "Die KI erwähnt dich selten. Deine Konkurrenten werden häufiger empfohlen.",
    };
  }
  if (score <= 60) {
    return {
      emoji: "🟡",
      title: "Teilweise sichtbar",
      description: "Die KI kennt dich, empfiehlt aber oft andere. Da geht noch was!",
    };
  }
  if (score <= 80) {
    return {
      emoji: "✅",
      title: "Gut sichtbar",
      description: "Die KI empfiehlt dich regelmäßig. Weiter so!",
    };
  }
  return {
    emoji: "🏆",
    title: "Top sichtbar",
    description: "Du bist die erste Empfehlung der KI. Perfekt!",
  };
}

function ScoreCircle({ score, industry, city }: { score: number; industry: string; city: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score > 80 ? "#10b981" : score > 60 ? "#10b981" : score > 40 ? "#f59e0b" : score > 20 ? "#f97316" : "#ef4444";

  const explanation = getScoreExplanation(score);
  const recommended = score > 40;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="w-48 h-48 -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-extrabold" style={{ color }}>
            {score}
          </span>
          <span className="text-sm text-muted">/100</span>
        </div>
      </div>

      {/* Score Label */}
      <div
        className="mt-3 px-5 py-2 rounded-full text-base font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {explanation.emoji} {explanation.title}
      </div>

      {/* Explanation */}
      <p className="mt-4 text-center text-base text-foreground max-w-md leading-relaxed">
        {explanation.description}
      </p>

      {/* Simple explanation sentence */}
      <p className="mt-3 text-center text-sm text-muted max-w-lg leading-relaxed">
        Was bedeutet das? Wenn jemand ChatGPT fragt &quot;Welcher {industry} in {city} ist gut?&quot;, wirst du{" "}
        <span className={`font-semibold ${recommended ? "text-green-600" : "text-red-600"}`}>
          {recommended ? "empfohlen" : "nicht empfohlen"}
        </span>.
      </p>
    </div>
  );
}

function PlatformBreakdown({ result }: { result: FreeCheckResult }) {
  const mentioned = result.mention_rate > 0;

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">Wo wirst du gefunden?</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 rounded-xl bg-surface">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold text-sm">Google KI-Suche</div>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-sm font-semibold ${mentioned ? "text-green-600" : "text-red-600"}`}>
              {mentioned ? "✅ Du wirst erwähnt" : "❌ Du wirst nicht erwähnt"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitorList({
  competitors,
  industry,
  city,
}: {
  competitors: { name: string; count: number }[];
  industry: string;
  city: string;
}) {
  if (competitors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold mb-4">🏢 Diese Firmen werden STATT DIR empfohlen:</h3>
        <p className="text-muted text-sm">
          Gute Nachricht — keine anderen Firmen werden statt dir empfohlen!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-2">🏢 Diese Firmen werden STATT DIR empfohlen:</h3>
      <p className="text-sm text-muted mb-4">
        Wenn jemand die KI nach einem {industry} in {city} fragt, werden diese Firmen genannt — nicht du.
      </p>
      <div className="space-y-2">
        {competitors.map((c, i) => (
          <div
            key={c.name}
            className="flex items-center justify-between p-3 rounded-lg bg-surface"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <span className="font-medium text-sm">{c.name}</span>
            </div>
            <span className="text-xs text-muted">
              {c.count}x erwähnt
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PromptDetails({ result }: { result: FreeCheckResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between"
      >
        <h3 className="text-lg font-bold">🔎 Details anzeigen (für Profis)</h3>
        <svg
          className={`w-5 h-5 text-muted shrink-0 ml-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <>
          <div className="mt-4 space-y-3">
            {result.prompts.map((p, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  p.mentioned
                    ? "border-green-200 bg-green-50/50"
                    : "border-red-200 bg-red-50/50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-medium text-primary">
                    &quot;{p.prompt}&quot;
                  </p>
                  <span
                    className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                      p.mentioned
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.mentioned ? "✅ Erwähnt" : "❌ Nicht erwähnt"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-muted">
              Erwähnt in{" "}
              <span className="font-bold text-primary">
                {result.prompts.filter((p) => p.mentioned).length}
              </span>{" "}
              von{" "}
              <span className="font-bold text-primary">{result.prompts.length}</span>{" "}
              Fragen ({result.mention_rate.toFixed(0)}%)
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Recommendations() {
  const tips = [
    {
      icon: "🌐",
      title: "Aktualisiere deine Website",
      text: "Die KI liest deine Website. Wenn dort aktuelle Infos stehen, wirst du eher empfohlen.",
    },
    {
      icon: "⭐",
      title: "Sammle Google-Bewertungen",
      text: "Mehr 5-Sterne-Bewertungen = bessere KI-Empfehlung.",
    },
    {
      icon: "📝",
      title: "Lass dich in Branchenverzeichnisse eintragen",
      text: "Die KI nutzt diese als Quelle. Zum Beispiel: Das Örtliche, Gelbe Seiten, Yelp.",
    },
    {
      icon: "📱",
      title: "Pflege dein Google Business Profil",
      text: "Öffnungszeiten, Fotos, Beschreibung aktuell halten.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">💪 Das kannst du jetzt tun:</h3>
      <div className="space-y-3">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
            <span className="text-2xl shrink-0 mt-0.5">{tip.icon}</span>
            <div>
              <p className="text-sm font-semibold text-foreground">{tip.title}</p>
              <p className="text-sm text-muted leading-relaxed">{tip.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const [result, setResult] = useState<FreeCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("geoseek_result");
      if (stored) {
        setResult(JSON.parse(stored));
      }
    } catch {
      // No data
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted">Lade Ergebnisse...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold mb-3">Keine Ergebnisse</h1>
          <p className="text-muted mb-6">
            Starte zuerst einen kostenlosen Check auf der Startseite.
          </p>
          <a
            href="/"
            className="inline-flex px-6 py-3 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition"
          >
            ← Zurück zum Check
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-primary-dark">
            Geo<span className="text-accent">Seek</span>
          </a>
          <a
            href="/"
            className="text-sm text-muted hover:text-primary transition"
          >
            ← Neuer Check
          </a>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Company Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-dark mb-2">
            Dein KI-Sichtbarkeits-Ergebnis
          </h1>
          <p className="text-muted">
            <span className="font-semibold text-foreground">
              {result.companyName}
            </span>{" "}
            · {result.industry} · {result.city}
          </p>
        </div>

        {/* Score */}
        <div className="flex justify-center mb-10">
          <ScoreCircle score={result.overall_score} industry={result.industry} city={result.city} />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PlatformBreakdown result={result} />
          <CompetitorList competitors={result.competitors} industry={result.industry} city={result.city} />
        </div>

        <div className="space-y-6 mb-8">
          <Recommendations />
          <PromptDetails result={result} />
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #0f2440 0%, #1a365d 40%, #2a4a7f 70%, #10b981 100%)",
          }}
        >
          <h2 className="text-xl md:text-2xl font-bold mb-3">
            Willst du wissen, ob sich deine Sichtbarkeit verbessert?
          </h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto text-base leading-relaxed">
            Wir prüfen das regelmäßig für dich. Du bekommst jede Woche einen Bericht, ob sich etwas verändert hat — und was du noch tun kannst.
          </p>
          <button className="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition text-lg">
            Regelmäßig prüfen lassen — ab 19€/Monat
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted mt-8">
          Analyse basierend auf Google KI-Suche · Ergebnisse können variieren ·
          Keine Garantie auf Vollständigkeit
        </p>
      </main>
    </div>
  );
}
