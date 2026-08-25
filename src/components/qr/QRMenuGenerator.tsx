import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Sparkles,
  Printer,
  Download,
  Copy,
  Check,
  Smartphone,
  Layers,
  Palette,
  ExternalLink,
  UtensilsCrossed,
  Share2,
  RefreshCw,
  Loader2,
  MessageSquare,
  Wine,
  Flame,
  Clock,
} from 'lucide-react';
import { generateQRPrompt, type GeminiQRPromptResponse } from '@/lib/geminiApi';
import confetti from 'canvas-confetti';

interface QRMenuGeneratorProps {
  shopName?: string;
  menuItems?: Array<{ name: string; category: string }>;
}

const TABLE_OPTIONS = [
  { id: 'all', label: 'All Tables / General Menu', area: 'Whole Restaurant' },
  { id: 'table-1', label: 'Table 1', area: 'Main Dining Floor' },
  { id: 'table-2', label: 'Table 2', area: 'Main Dining Floor' },
  { id: 'table-3', label: 'Table 3 (Window)', area: 'Main Dining Floor' },
  { id: 'table-4', label: 'Table 4 (Booth)', area: 'Main Dining Floor' },
  { id: 'table-5', label: 'Table 5', area: 'Main Dining Floor' },
  { id: 'table-8', label: 'Table 8 (Center)', area: 'Main Dining Floor' },
  { id: 'bar-1', label: 'Bar Seat 1', area: 'Craft Bar & Lounge' },
  { id: 'bar-2', label: 'Bar Seat 2', area: 'Craft Bar & Lounge' },
  { id: 'bar-4', label: 'Bar Seat 4', area: 'Craft Bar & Lounge' },
  { id: 'patio-1', label: 'Patio 1 (Garden)', area: 'Outdoor Patio' },
  { id: 'patio-2', label: 'Patio 2 (Covered)', area: 'Outdoor Patio' },
  { id: 'takeout', label: 'Takeout / Pickup Counter', area: 'Order Pickup Counter' },
];

export const QRMenuGenerator: React.FC<QRMenuGeneratorProps> = ({
  shopName = 'Love Local Eats Kitchen',
  menuItems = [],
}) => {
  const [selectedLocation, setSelectedLocation] = useState('table-4');
  const [themeColor, setThemeColor] = useState('#ea580c'); // orange-600
  const [standeeStyle, setStandeeStyle] = useState<'classic' | 'modern' | 'minimal' | 'rustic'>('modern');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [vibeTheme, setVibeTheme] = useState('Artisanal comfort food & craft beers');

  const [aiCopy, setAiCopy] = useState<GeminiQRPromptResponse>({
    headline: 'Welcome to Table 4! 🍽️',
    tagline: 'Scan to explore chef specials, cocktail pairings & contactless reorders',
    flavorCopy: 'Welcome to your table! Scan our digital menu to browse fresh seasonal favorites, view chef recommendations, and reorder drinks in 30 seconds.',
    callToAction: 'Scan with Phone Camera · No App Required',
    pairingNote: 'Chef Pairing: Double Smash Burger with Local Craft IPA 🍺',
    geminiPowered: false,
  });

  const selectedOption = TABLE_OPTIONS.find((t) => t.id === selectedLocation) || TABLE_OPTIONS[0];

  // Construct real URL for live customer ordering preview
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://lovelocaleats.com';
  const targetUrl =
    selectedOption.id === 'all'
      ? `${baseUrl}/pos?mode=dine-in`
      : `${baseUrl}/pos?table=${encodeURIComponent(selectedOption.label)}&area=${encodeURIComponent(selectedOption.area)}&source=qr`;

  // Generate QR Code image when destination or theme color changes
  useEffect(() => {
    QRCode.toDataURL(targetUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: themeColor,
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR code generation error:', err));
  }, [targetUrl, themeColor]);

  // Request Gemini AI Prompt Copy for the selected table
  const handleGenerateAICopy = async () => {
    setGeneratingAI(true);
    try {
      const highlights = menuItems.slice(0, 4).map((m) => m.name);
      const res = await generateQRPrompt(
        selectedOption.label,
        selectedOption.area,
        vibeTheme,
        highlights.length ? highlights : ['Smash Burgers', 'Truffle Fries', 'Craft Beer', 'Fresh Salmon']
      );
      setAiCopy(res);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Error generating AI copy:', err);
    } finally {
      setGeneratingAI(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-${shopName.replace(/\s+/g, '-')}-${selectedOption.id}.png`;
    a.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-orange-200/80 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-rose-500/10 p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100/80 px-3 py-1 text-xs font-extrabold text-orange-800">
              <Sparkles className="h-3.5 w-3.5 text-orange-600 animate-pulse" />
              Gemini AI Powered QR Hub
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Smart QR Menu &amp; Table Links
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-600 max-w-2xl">
              Generate dynamic contactless ordering QR codes for individual dining tables, bar seats, patio areas, and takeout counters. Gemini AI crafts enticing tabletop copy and food pairings automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleGenerateAICopy}
              disabled={generatingAI}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50"
            >
              {generatingAI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {generatingAI ? 'Gemini Crafting Copy…' : 'AI Tabletop Copy'}
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              Print Table Stand
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Configuration Controls */}
        <div className="space-y-6 lg:col-span-6">
          {/* Table / Location Selector */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Target Table / Dining Location
            </label>
            <p className="mt-0.5 text-xs text-slate-600">
              Guests who scan this QR code are automatically routed with this table pinned to their digital tab.
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TABLE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedLocation(opt.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selectedLocation === opt.id
                      ? 'border-orange-500 bg-orange-50/80 font-bold text-orange-950 ring-2 ring-orange-500/20'
                      : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-extrabold">{opt.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{opt.area}</p>
                </button>
              ))}
            </div>

            {/* Direct Link Preview */}
            <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-slate-100 p-2.5">
              <div className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                {targetUrl}
              </div>
              <button
                onClick={copyLink}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Test
              </a>
            </div>
          </div>

          {/* Style & Branding Customizer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Design, Color &amp; Standee Style
            </label>

            {/* Theme Color Presets */}
            <div>
              <span className="text-xs font-semibold text-slate-600">Brand Color Accent:</span>
              <div className="mt-2 flex flex-wrap gap-2.5">
                {[
                  { name: 'Warm Amber', color: '#ea580c' },
                  { name: 'Rose Bistro', color: '#e11d48' },
                  { name: 'Craft Violet', color: '#7c3aed' },
                  { name: 'Emerald Fresh', color: '#059669' },
                  { name: 'Classic Slate', color: '#0f172a' },
                ].map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setThemeColor(c.color)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      themeColor === c.color ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Standee Template Styles */}
            <div>
              <span className="text-xs font-semibold text-slate-600">Table Stand Template:</span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  { id: 'modern', label: 'Modern Tent' },
                  { id: 'classic', label: 'Classic Wood' },
                  { id: 'minimal', label: 'Minimal Sticker' },
                  { id: 'rustic', label: 'Artisan Board' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStandeeStyle(s.id as any)}
                    className={`rounded-xl border p-2.5 text-center text-xs font-bold transition ${
                      standeeStyle === s.id
                        ? 'border-orange-500 bg-orange-50 font-black text-orange-950 ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Vibe Customizer Prompt */}
            <div>
              <span className="text-xs font-semibold text-slate-600">Restaurant Concept / Vibe for AI Copy:</span>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={vibeTheme}
                  onChange={(e) => setVibeTheme(e.target.value)}
                  placeholder="e.g. Craft brewery & organic smash burgers"
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  onClick={handleGenerateAICopy}
                  disabled={generatingAI}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions / Download Bar */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={downloadPNG}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Download QR Code PNG
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-500"
            >
              <Printer className="h-4 w-4" /> Print Standee Card
            </button>
          </div>
        </div>

        {/* Right Column: Live Table Tent / Card Preview (Ready to Print) */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Tabletop Standee Preview (4" x 6")
            </span>
            {aiCopy.geminiPowered && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                <Sparkles className="h-3 w-3 text-emerald-600" /> Gemini Copy Active
              </span>
            )}
          </div>

          {/* Printable Stand Card Container */}
          <div
            id="printable-qr-standee"
            className="relative mx-auto max-w-sm rounded-3xl border-2 border-slate-200 bg-white p-7 shadow-xl transition-all duration-300 print:border-none print:shadow-none"
            style={{
              boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
            }}
          >
            {/* Top Table Badge */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl font-black text-white shadow-sm"
                  style={{ backgroundColor: themeColor }}
                >
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">{shopName}</h3>
                  <p className="text-[11px] font-semibold text-slate-500">{selectedOption.area}</p>
                </div>
              </div>
              <div
                className="rounded-full px-3 py-1 text-xs font-black text-white"
                style={{ backgroundColor: themeColor }}
              >
                {selectedOption.label}
              </div>
            </div>

            {/* AI Generated Headline & Tagline */}
            <div className="my-5 text-center">
              <h4 className="text-lg font-black tracking-tight text-slate-900">
                {aiCopy.headline}
              </h4>
              <p className="mt-1 text-xs font-medium text-slate-600 leading-relaxed">
                {aiCopy.flavorCopy}
              </p>
            </div>

            {/* QR Code Container */}
            <div className="relative mx-auto my-4 flex w-56 flex-col items-center justify-center rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 shadow-inner">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${selectedOption.label}`}
                  className="h-48 w-48 rounded-xl object-contain shadow-sm"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              )}

              <div
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white shadow-sm"
                style={{ backgroundColor: themeColor }}
              >
                <Smartphone className="h-3.5 w-3.5" />
                {aiCopy.callToAction || 'Scan with Camera to Order'}
              </div>
            </div>

            {/* Chef's Pairing & Note */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-amber-900">
                <Wine className="h-3.5 w-3.5 text-amber-700" />
                Chef's Pairing Highlight
              </div>
              <p className="mt-1 text-xs font-bold text-amber-950">
                {aiCopy.pairingNote}
              </p>
            </div>

            {/* Bottom Footer Details */}
            <div className="mt-4 flex items-center justify-between text-[10px] font-medium text-slate-400 border-t border-slate-100 pt-3">
              <span>Instant Contactless Pay</span>
              <span>•</span>
              <span>Fast 30s Drink Reorders</span>
              <span>•</span>
              <span>No App Download</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRMenuGenerator;
