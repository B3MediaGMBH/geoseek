"use client";

import { useEffect, useState } from "react";
import { FreeCheckResult } from "@/lib/types";

function ScoreCircle({ score }: { score: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 60 ? "#10b981" : score >= 30 ? "#f59e0b" : "#ef4444";
  const label =
    score >= 60 ? "Gut sichtbar" : score >= 30 ? "Teilweise sichtbar" : "Kaum sichtbar";

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
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </div>
    </div>
  );
}

function PlatformBreakdown({ result }: { result: FreeCheckResult }) {
  const platforms = [
    {
      name: "Google Gemini",
      score: result.overall_score,
      active: true,
      icon: "🤖",
    },
    {
      name: "ChatGPT",
      score: null,
      active: false,
      icon: "💬",
    },
    {
      name: "Perplexity",
      score: null,
      active: false,
      icon: "🔍",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">Plattform-Übersicht</h3>
      <div className="space-y-3">
        {platforms.map((p) => (
          <div
            key={p.name}
            className={`flex items-center justify-between p-4 rounded-xl ${
              p.active ? "bg-surface" : "bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{p.icon}</span>
              <div>
                <div className="font-semibold text-sm">{p.name}</div>
                {!p.active && (
                  <div className="text-xs text-muted">Kommt bald</div>
                )}
              </div>
            </div>
            <div className="text-right">
              {p.active && p.score !== null ? (
                <span className="text-2xl font-bold text-primary">
                  {p.score}
                  <span className="text-sm text-muted font-normal">/100</span>
                </span>
              ) : (
                <span className="text-sm text-muted">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorList({
  competitors,
}: {
  competitors: { name: string; count: number }[];
}) {
  if (competitors.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6">
        <h3 className="text-lg font-bold mb-4">🏢 Konkurrenten</h3>
        <p className="text-muted text-sm">
          Keine Konkurrenten in den KI-Antworten gefunden.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">🏢 Stattdessen empfohlen</h3>
      <p className="text-sm text-muted mb-4">
        Diese Unternehmen wurden von der KI anstelle deines empfohlen:
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">📋 Detaillierte Ergebnisse</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-accent hover:text-accent-dark font-medium"
        >
          {expanded ? "Einklappen" : "Alle anzeigen"}
        </button>
      </div>
      <div className="space-y-3">
        {(expanded ? result.prompts : result.prompts.slice(0, 2)).map(
          (p, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border ${
                p.mentioned
                  ? "border-green-200 bg-green-50/50"
                  : "border-red-200 bg-red-50/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
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
              {p.mentioned && p.position && (
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span>Position: {p.position}. Nennung</span>
                  <span>
                    Sentiment:{" "}
                    {p.sentiment === "positiv"
                      ? "👍 Positiv"
                      : p.sentiment === "negativ"
                      ? "👎 Negativ"
                      : "😐 Neutral"}
                  </span>
                </div>
              )}
            </div>
          )
        )}
      </div>
      <div className="mt-4 text-center">
        <div className="text-sm text-muted">
          Erwähnt in{" "}
          <span className="font-bold text-primary">
            {result.prompts.filter((p) => p.mentioned).length}
          </span>{" "}
          von{" "}
          <span className="font-bold text-primary">{result.prompts.length}</span>{" "}
          KI-Anfragen ({result.mention_rate.toFixed(0)}%)
        </div>
      </div>
    </div>
  );
}

function Recommendations({ recommendations }: { recommendations: string[] }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <h3 className="text-lg font-bold mb-4">💡 Handlungsempfehlungen</h3>
      <div className="space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
            <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed">{r}</p>
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
            Starte zuerst einen kostenlosen KI-Sichtbarkeits-Check auf der
            Startseite.
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
            KI-Sichtbarkeits-Report
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
          <ScoreCircle score={result.overall_score} />
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <PlatformBreakdown result={result} />
          <CompetitorList competitors={result.competitors} />
        </div>

        <div className="space-y-6 mb-8">
          <PromptDetails result={result} />
          <Recommendations recommendations={result.recommendations} />
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-8 text-center text-white"
          style={{
            background:
              "linear-gradient(135deg, #0f2440 0%, #1a365d 40%, #2a4a7f 70%, #10b981 100%)",
          }}
        >
          <h2 className="text-2xl font-bold mb-3">
            Sichtbarkeit dauerhaft verbessern?
          </h2>
          <p className="text-white/70 mb-6 max-w-lg mx-auto">
            Mit dem GeoSeek Monitoring behältst du deine KI-Sichtbarkeit im
            Blick. Wöchentliche Reports, Alerts bei Veränderungen und konkrete
            Handlungsempfehlungen.
          </p>
          <button className="px-8 py-4 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition text-lg">
            Monitoring aktivieren — ab 19€/Monat
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-muted mt-8">
          Analyse basierend auf Google Gemini · Ergebnisse können variieren ·
          Keine Garantie auf Vollständigkeit
        </p>
      </main>
    </div>
  );
}
