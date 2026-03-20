"use client";

import { useState } from "react";
import { FreeCheckResult } from "@/lib/types";

const INDUSTRIES = [
  "Maler & Lackierer",
  "Elektriker",
  "Klempner / Sanitär",
  "Zahnarzt",
  "Anwalt",
  "Steuerberater",
  "Restaurant",
  "Immobilienmakler",
  "Friseur",
  "IT-Dienstleister / Agentur",
];

/* ─── Check Modal ─── */
function CheckModal({
  initialName,
  onClose,
}: {
  initialName: string;
  onClose: () => void;
}) {
  const [companyName, setCompanyName] = useState(initialName);
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!companyName.trim() || !industry || !city.trim()) {
      setError("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/free-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          website: website.trim() || undefined,
          industry,
          city: city.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Check");
      }

      const result: FreeCheckResult = await res.json();
      sessionStorage.setItem("geoseek_result", JSON.stringify(result));
      window.location.href = "/results";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ein Fehler ist aufgetreten. Bitte versuche es erneut."
      );
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="mb-6">
            <div className="animate-spin w-16 h-16 border-4 border-accent border-t-transparent rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-primary-dark mb-2">
              Wir fragen die KI...
            </h3>
            <p className="text-muted text-sm">
              GeoSeek analysiert gerade, wie sichtbar &quot;{companyName}&quot; in
              KI-Systemen ist. Das dauert nur wenige Sekunden.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 text-sm text-muted">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span>Google Gemini wird abgefragt</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-primary-dark">
            Kostenloser KI-Sichtbarkeits-Check
          </h3>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Firmenname *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="z.B. Müller Malerbetrieb"
              className="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Branche *
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "20px",
              }}
            >
              <option value="">Branche wählen...</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Stadt *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="z.B. München"
              className="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Website (optional) */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-1.5">
              Website <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="z.B. www.mein-betrieb.de"
              className="w-full px-4 py-3 rounded-lg border border-border text-foreground bg-white placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="w-full py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition text-base"
          >
            Jetzt kostenlos prüfen →
          </button>

          <p className="text-xs text-muted text-center">
            Keine Anmeldung nötig · Keine Kosten · Ergebnis in 60 Sekunden
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Navigation ─── */
function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="text-xl font-bold text-primary-dark">
          Geo<span className="text-accent">Seek</span>
        </a>
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
          <a href="#problem" className="hover:text-primary transition">Problem</a>
          <a href="#loesung" className="hover:text-primary transition">Lösung</a>
          <a href="#so-funktionierts" className="hover:text-primary transition">So funktioniert&apos;s</a>
          <a href="#branchen" className="hover:text-primary transition">Branchen</a>
          <a href="#pricing" className="hover:text-primary transition">Preise</a>
          <a href="#faq" className="hover:text-primary transition">FAQ</a>
        </div>
        <a
          href="#hero"
          className="hidden md:inline-flex px-5 py-2.5 bg-accent hover:bg-accent-dark text-white text-sm font-semibold rounded-lg transition"
        >
          Jetzt prüfen
        </a>
        {/* Mobile burger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menü">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-border px-4 py-4 space-y-3 text-sm font-medium text-muted">
          <a href="#problem" className="block hover:text-primary" onClick={() => setOpen(false)}>Problem</a>
          <a href="#loesung" className="block hover:text-primary" onClick={() => setOpen(false)}>Lösung</a>
          <a href="#so-funktionierts" className="block hover:text-primary" onClick={() => setOpen(false)}>So funktioniert&apos;s</a>
          <a href="#branchen" className="block hover:text-primary" onClick={() => setOpen(false)}>Branchen</a>
          <a href="#pricing" className="block hover:text-primary" onClick={() => setOpen(false)}>Preise</a>
          <a href="#faq" className="block hover:text-primary" onClick={() => setOpen(false)}>FAQ</a>
          <a href="#hero" className="block px-4 py-2 bg-accent text-white text-center rounded-lg font-semibold" onClick={() => setOpen(false)}>Jetzt prüfen</a>
        </div>
      )}
    </nav>
  );
}

/* ─── Mock Dashboard Preview ─── */
function DashboardPreview() {
  const score = 73;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const platforms = [
    { name: "ChatGPT", status: "found", icon: "✅", color: "#10b981" },
    { name: "Gemini", status: "partial", icon: "⚠️", color: "#f59e0b" },
    { name: "Perplexity", status: "missing", icon: "❌", color: "#ef4444" },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-sm mx-auto shadow-2xl">
      <div className="text-center mb-4">
        <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-1">KI-Sichtbarkeits-Score</div>
        <div className="text-sm text-white/50">Muster Bäckerei GmbH</div>
      </div>

      {/* Score Circle */}
      <div className="flex justify-center mb-5">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke="#10b981"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-xs text-white/60">/100</span>
          </div>
        </div>
      </div>

      {/* Platform Badges */}
      <div className="space-y-2">
        {platforms.map((p) => (
          <div key={p.name} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
            <span className="text-sm font-medium text-white">{p.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/60">
                {p.status === "found" ? "Erwähnt" : p.status === "partial" ? "Teilweise" : "Nicht gefunden"}
              </span>
              <span>{p.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs text-white/40">Live-Vorschau · Beispieldaten</span>
      </div>
    </div>
  );
}

/* ─── Hero ─── */
function Hero({ onStartCheck }: { onStartCheck: (name: string) => void }) {
  const [firma, setFirma] = useState("");
  return (
    <section id="hero" className="pt-28 pb-20 md:pt-36 md:pb-28 text-white" style={{
      background: "linear-gradient(135deg, #0f2440 0%, #1a365d 40%, #2a4a7f 70%, #10b981 100%)"
    }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text + CTA */}
          <div className="text-center md:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              Empfiehlt ChatGPT dein Unternehmen — oder deinen <span className="text-accent">Konkurrenten</span>?
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mb-10">
              Finde in 60 Sekunden heraus, wie sichtbar dein Unternehmen in ChatGPT, Gemini und Perplexity ist. Das erste deutsche KI-Sichtbarkeits-Tool. DSGVO-konform. Daten in der EU.
            </p>
            {/* Free Check Form */}
            <div className="max-w-lg flex flex-col sm:flex-row gap-3 mx-auto md:mx-0">
              <input
                type="text"
                placeholder="Firmenname eingeben…"
                value={firma}
                onChange={(e) => setFirma(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-lg text-foreground bg-white placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
                onKeyDown={(e) => e.key === "Enter" && firma.trim() && onStartCheck(firma.trim())}
              />
              <button
                className="px-6 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition whitespace-nowrap text-base"
                onClick={() => onStartCheck(firma.trim())}
              >
                Jetzt kostenlos prüfen →
              </button>
            </div>
            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-white/70">
              <span>🇩🇪 Made in Germany</span>
              <span className="hidden sm:inline">•</span>
              <span>🇪🇺 Daten in der EU</span>
              <span className="hidden sm:inline">•</span>
              <span>🔒 DSGVO-konform</span>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="hidden md:block">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Problem ─── */
function Problem() {
  const stats = [
    { value: "265 Mio.", label: "organische Klicks gehen in DE pro Monat durch KI-Antworten verloren" },
    { value: "59 %", label: "weniger Klicks auf Platz 1 bei Google mit KI-Übersicht" },
    { value: "64 %", label: "der Deutschen vertrauen KI-Suchtools" },
    { value: "38 %", label: "nutzen generative KI täglich" },
  ];
  return (
    <section id="problem" className="py-20 md:py-28 bg-surface">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6">
          Die neue Realität: <span className="text-primary">KI entscheidet, wer gefunden wird.</span>
        </h2>
        <p className="text-muted text-center max-w-3xl mx-auto mb-14 text-lg">
          Immer mehr Menschen fragen ChatGPT, Gemini oder Perplexity statt Google. Die KI antwortet direkt — mit konkreten Empfehlungen. Wenn dein Unternehmen dort nicht vorkommt, verlierst du Kunden. Ohne es zu merken.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.value} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-border">
              <div className="text-3xl md:text-4xl font-extrabold text-primary mb-2">{s.value}</div>
              <div className="text-sm text-muted leading-snug">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Lösung / Features ─── */
function Features() {
  const features = [
    {
      icon: "🔍",
      title: "KI-Sichtbarkeits-Check",
      text: "Erfahre sofort, ob und wie ChatGPT, Gemini, Perplexity und Google dein Unternehmen empfehlen. Inklusive Sichtbarkeits-Score von 0 bis 100.",
    },
    {
      icon: "📊",
      title: "Konkurrenz-Vergleich",
      text: "Sieh auf einen Blick, wer stattdessen empfohlen wird. Vergleiche deinen Score direkt mit deinen Wettbewerbern.",
    },
    {
      icon: "✅",
      title: "Handlungsempfehlungen",
      text: "Bekomme konkrete, verständliche Tipps auf Deutsch, was du ändern kannst, um in KI-Antworten sichtbar zu werden.",
    },
  ];
  return (
    <section id="loesung" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          GeoSeek zeigt dir, <span className="text-primary">was die KI über dich sagt.</span>
        </h2>
        <p className="text-muted text-center max-w-2xl mx-auto mb-14 text-lg">
          Dein Werkzeug für KI-Sichtbarkeit — verständlich, umsetzbar, auf Deutsch.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-surface rounded-2xl p-8 border border-border hover:shadow-lg transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-muted leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── So funktioniert's ─── */
function HowItWorks() {
  const steps = [
    {
      num: "1",
      title: "Firma eingeben",
      text: "Name, Website, Branche und Stadt — fertig in 30 Sekunden.",
    },
    {
      num: "2",
      title: "KI-Check starten",
      text: "GeoSeek fragt ChatGPT, Gemini, Perplexity und Google ab. Mit branchenspezifischen Fragen, die echte Kunden stellen würden.",
    },
    {
      num: "3",
      title: "Ergebnis verstehen & handeln",
      text: "Dein Score, deine Konkurrenz, deine Empfehlungen — klar, auf Deutsch, sofort umsetzbar.",
    },
  ];
  return (
    <section id="so-funktionierts" className="py-20 md:py-28 bg-surface">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-14">
          So funktioniert&apos;s — <span className="text-primary">in 3 Schritten</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {s.num}
              </div>
              <h3 className="text-xl font-bold mb-3">{s.title}</h3>
              <p className="text-muted leading-relaxed">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Branchen ─── */
function Branchen() {
  const branchen = [
    { icon: "🔧", name: "Handwerker", sub: "Maler, Elektriker, Klempner, Dachdecker" },
    { icon: "🦷", name: "Zahnärzte & Ärzte", sub: "" },
    { icon: "⚖️", name: "Anwälte & Notare", sub: "" },
    { icon: "📊", name: "Steuerberater", sub: "" },
    { icon: "🍽️", name: "Restaurants & Gastronomie", sub: "" },
    { icon: "🏠", name: "Immobilienmakler", sub: "" },
    { icon: "💇", name: "Friseure & Kosmetik", sub: "" },
    { icon: "💻", name: "IT-Dienstleister & Agenturen", sub: "" },
  ];
  return (
    <section id="branchen" className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          Für jede Branche <span className="text-primary">die richtigen Fragen.</span>
        </h2>
        <p className="text-muted text-center max-w-3xl mx-auto mb-14 text-lg">
          GeoSeek kommt mit fertigen Branchen-Templates für Deutschland. Die KI wird mit genau den Fragen getestet, die echte Kunden in deiner Branche stellen.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {branchen.map((b) => (
            <div key={b.name} className="bg-surface rounded-xl p-5 border border-border text-center hover:border-primary/40 transition">
              <div className="text-3xl mb-2">{b.icon}</div>
              <div className="font-semibold text-sm">{b.name}</div>
              {b.sub && <div className="text-xs text-muted mt-1">{b.sub}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Vertrauen / Made in Germany ─── */
function Trust() {
  const pillars = [
    {
      icon: "🇩🇪",
      title: "Made in Germany",
      text: "GeoSeek ist ein Produkt der B3 Media GmbH mit Sitz in Deutschland. Entwickelt und betrieben in Deutschland.",
    },
    {
      icon: "🇪🇺",
      title: "Daten bleiben in der EU",
      text: "Alle Kundendaten werden ausschließlich auf Servern in der EU gespeichert. Kein Transfer in Drittländer.",
    },
    {
      icon: "🔒",
      title: "DSGVO-konform",
      text: "Datenschutz ist kein Nachgedanke, sondern Grundprinzip. Transparente Datenverarbeitung, jederzeit löschbar, keine Weitergabe an Dritte.",
    },
  ];
  return (
    <section className="py-20 md:py-28 bg-primary-dark text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-14">
          Deutsches Tool. Deutsche Daten. <span className="text-accent">Deutsches Recht.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p) => (
            <div key={p.title} className="text-center">
              <div className="text-5xl mb-4">{p.icon}</div>
              <h3 className="text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-white/70 leading-relaxed">{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */
function Pricing() {
  const plans = [
    {
      name: "Kostenlos",
      price: "0 €",
      period: "",
      features: ["1 einmaliger KI-Sichtbarkeits-Check", "Sofort-Report", "Keine Kreditkarte nötig"],
      cta: "Jetzt testen",
      highlight: false,
    },
    {
      name: "Starter",
      price: "19 €",
      period: "/Monat",
      features: [
        "1 Domain / Unternehmen",
        "10 Checks pro Monat",
        "Wöchentliches Monitoring",
        "Handlungsempfehlungen auf Deutsch",
        "E-Mail-Benachrichtigungen",
      ],
      cta: "Starter wählen",
      highlight: false,
    },
    {
      name: "Pro",
      price: "49 €",
      period: "/Monat",
      features: [
        "3 Domains / Unternehmen",
        "50 Checks pro Monat",
        "Tägliches Monitoring",
        "Konkurrenz-Dashboard",
        "Alerts bei Veränderungen",
        "Ausführliche Reports",
      ],
      cta: "Pro wählen",
      highlight: true,
    },
    {
      name: "Agency",
      price: "149 €",
      period: "/Monat",
      features: [
        "10 Domains / Unternehmen",
        "200 Checks pro Monat",
        "Tägliches Monitoring",
        "White-Label Reports",
        "Multi-Kunden-Verwaltung",
        "API-Zugang",
        "Priority Support",
      ],
      cta: "Agency wählen",
      highlight: false,
    },
  ];
  return (
    <section id="pricing" className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
          Transparent. Fair. <span className="text-primary">Ohne Überraschungen.</span>
        </h2>
        <p className="text-muted text-center mb-14">Alle Preise zzgl. USt. · Monatlich kündbar · 14 Tage Geld-zurück-Garantie</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 border flex flex-col ${
                p.highlight
                  ? "border-accent bg-white shadow-xl ring-2 ring-accent/20 scale-[1.02]"
                  : "border-border bg-white"
              }`}
            >
              {p.highlight && (
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Beliebteste Wahl</div>
              )}
              <h3 className="text-lg font-bold mb-1">{p.name}</h3>
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-primary">{p.price}</span>
                {p.period && <span className="text-muted text-sm">{p.period}</span>}
              </div>
              <ul className="space-y-2 mb-8 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-accent mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-lg font-semibold text-sm transition ${
                  p.highlight
                    ? "bg-accent hover:bg-accent-dark text-white"
                    : "bg-primary hover:bg-primary-light text-white"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */
function FAQ() {
  const faqs = [
    {
      q: "Was genau prüft GeoSeek?",
      a: "GeoSeek fragt ChatGPT, Gemini, Perplexity und Google mit branchenspezifischen Fragen ab — genau so, wie es echte Kunden tun würden. Dann analysieren wir, ob und wie dein Unternehmen empfohlen wird.",
    },
    {
      q: "Brauche ich SEO-Kenntnisse?",
      a: "Nein. GeoSeek ist bewusst so gebaut, dass es ohne Vorkenntnisse verständlich ist. Die Empfehlungen sind auf Deutsch und sofort umsetzbar.",
    },
    {
      q: "Wo werden meine Daten gespeichert?",
      a: "Ausschließlich auf Servern in der Europäischen Union (Deutschland). Wir geben keine Daten an Dritte weiter.",
    },
    {
      q: "Ist GeoSeek DSGVO-konform?",
      a: "Ja. Datenschutz ist ein Kernprinzip von GeoSeek. Transparente Verarbeitung, jederzeit löschbar, keine Tracker von Drittanbietern.",
    },
    {
      q: "Was kostet der kostenlose Check wirklich?",
      a: "Nichts. Keine Kreditkarte, kein Abo, keine versteckten Kosten. Einfach Firma eingeben und Ergebnis sehen.",
    },
    {
      q: "Kann ich GeoSeek für meine Kunden nutzen?",
      a: "Ja. Mit dem Agency-Plan kannst du mehrere Unternehmen verwalten und Reports im eigenen Branding erstellen.",
    },
  ];
  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-14">
          Häufige <span className="text-primary">Fragen</span>
        </h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold hover:bg-surface transition"
        onClick={() => setOpen(!open)}
      >
        <span>{q}</span>
        <svg
          className={`w-5 h-5 text-muted shrink-0 ml-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-6 pb-4 text-muted leading-relaxed">{a}</div>
      )}
    </div>
  );
}

/* ─── CTA Bottom ─── */
function CtaBottom({ onStartCheck }: { onStartCheck: (name: string) => void }) {
  const [firma, setFirma] = useState("");
  return (
    <section className="py-20 md:py-28 text-white" style={{
      background: "linear-gradient(135deg, #0f2440 0%, #1a365d 40%, #2a4a7f 70%, #10b981 100%)"
    }}>
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
          Finde jetzt heraus, was die KI über dein Unternehmen sagt.
        </h2>
        <p className="text-white/70 text-lg mb-10">Kostenlos. In 60 Sekunden. Ohne Anmeldung.</p>
        <div className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Firmenname eingeben…"
            value={firma}
            onChange={(e) => setFirma(e.target.value)}
            className="flex-1 px-5 py-3.5 rounded-lg text-foreground bg-white placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-accent"
            onKeyDown={(e) => e.key === "Enter" && firma.trim() && onStartCheck(firma.trim())}
          />
          <button
            className="px-6 py-3.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition whitespace-nowrap text-base"
            onClick={() => onStartCheck(firma.trim())}
          >
            Jetzt kostenlos prüfen →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="py-10 bg-primary-dark text-white/60 text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-white">Geo<span className="text-accent">Seek</span></span>{" "}
          ist ein Produkt der B3 Media GmbH
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-white transition">Impressum</a>
          <a href="#" className="hover:text-white transition">Datenschutz</a>
          <a href="#" className="hover:text-white transition">AGB</a>
        </div>
        <div className="flex items-center gap-3">
          <span>🇩🇪 Made in Germany</span>
          <span>🇪🇺 EU Data Protection</span>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function Home() {
  const [showModal, setShowModal] = useState(false);
  const [initialName, setInitialName] = useState("");

  const handleStartCheck = (name: string) => {
    setInitialName(name);
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero onStartCheck={handleStartCheck} />
        <Problem />
        <Features />
        <HowItWorks />
        <Branchen />
        <Trust />
        <Pricing />
        <FAQ />
        <CtaBottom onStartCheck={handleStartCheck} />
      </main>
      <Footer />
      {showModal && (
        <CheckModal
          initialName={initialName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
