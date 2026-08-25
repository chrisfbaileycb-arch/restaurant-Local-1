import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  Percent,
  Sparkles,
  Download,
  Printer,
  Calendar,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Layers,
  ChevronRight,
  FileSpreadsheet,
  Loader2,
  NotebookPen,
  Plus,
  Trash2,
  CheckCircle2,
  PrinterCheck,
  BarChart3,
  Sun,
  Moon,
  CloudSun,
  AlertTriangle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useOps } from '@/lib/opsStore';
import {
  generateDailySalesSummary,
  generateShiftHandoverSummary,
  type GeminiDailySummaryResponse,
} from '@/lib/geminiApi';
import confetti from 'canvas-confetti';

const HOURLY_DATA = [
  { hour: '10 AM', sales: 65, orders: 3, labor: 45 },
  { hour: '11 AM', sales: 140, orders: 6, labor: 45 },
  { hour: '12 PM', sales: 380, orders: 15, labor: 60 },
  { hour: '1 PM', sales: 340, orders: 13, labor: 60 },
  { hour: '2 PM', sales: 120, orders: 5, labor: 45 },
  { hour: '3 PM', sales: 85, orders: 4, labor: 30 },
  { hour: '4 PM', sales: 110, orders: 5, labor: 30 },
  { hour: '5 PM', sales: 240, orders: 9, labor: 60 },
  { hour: '6 PM', sales: 410, orders: 16, labor: 75 },
  { hour: '7 PM', sales: 360, orders: 14, labor: 75 },
  { hour: '8 PM', sales: 190, orders: 7, labor: 60 },
  { hour: '9 PM', sales: 80, orders: 3, labor: 45 },
];

const SEVEN_DAY_DATA = [
  { day: 'Mon', revenue: 1180, orders: 48, labor: 280, aov: 24.5 },
  { day: 'Tue', revenue: 1320, orders: 52, labor: 295, aov: 25.3 },
  { day: 'Wed', revenue: 1450, orders: 56, labor: 310, aov: 25.8 },
  { day: 'Thu', revenue: 1680, orders: 62, labor: 330, aov: 27.0 },
  { day: 'Fri', revenue: 2390, orders: 88, labor: 450, aov: 27.1 },
  { day: 'Sat', revenue: 2850, orders: 104, labor: 510, aov: 27.4 },
  { day: 'Sun (Today)', revenue: 1585, orders: 58, labor: 312, aov: 27.3 },
];

const THIRTY_DAY_DATA = [
  { week: 'Week 1', sales: 9420, dineIn: 6800, online: 2620, aov: 23.8 },
  { week: 'Week 2', sales: 10250, dineIn: 7300, online: 2950, aov: 24.9 },
  { week: 'Week 3', sales: 11400, dineIn: 7900, online: 3500, aov: 26.2 },
  { week: 'Week 4 (Current)', sales: 12475, dineIn: 8650, online: 3825, aov: 27.3 },
];

const CATEGORY_SALES = [
  { name: 'Mains & Bowls', value: 890, color: '#ea580c' },
  { name: 'Craft Drinks & Beer', value: 380, color: '#0ea5e9' },
  { name: 'Appetizers & Sides', value: 210, color: '#10b981' },
  { name: 'Desserts & Sweets', value: 105, color: '#8b5cf6' },
];

const PAYMENT_METHODS = [
  { method: 'Contactless Tap / Card', amount: '$1,220.50', pct: '77%' },
  { method: 'Mobile QR Dine-In', amount: '$245.00', pct: '15%' },
  { method: 'Cash / Drawer', amount: '$120.00', pct: '8%' },
];

export const DailySalesSummary: React.FC = () => {
  const ops = useOps();
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport] = useState<GeminiDailySummaryResponse | null>(null);
  const [trendHorizon, setTrendHorizon] = useState<'hourly' | '7day' | '30day'>('hourly');

  // Shift notes state
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteAuthor, setNoteAuthor] = useState('Sarah M. (Floor Lead)');
  const [noteShiftType, setNoteShiftType] = useState<'morning' | 'night' | 'all-day'>('night');
  const [noteContent, setNoteContent] = useState('');
  const [noteWeather, setNoteWeather] = useState('Clear · 68°F');
  const [noteVariance, setNoteVariance] = useState('0.00');
  const [handoverAiLoading, setHandoverAiLoading] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const grossSales = 1585.5;
  const netSales = 1472.0;
  const tax = 112.4;
  const tips = 245.8;
  const discounts = 45.0;
  const totalOrders = 58;
  const laborCost = 312.0;
  const laborPct = ((laborCost / netSales) * 100).toFixed(1);
  const avgTicket = (netSales / totalOrders).toFixed(2);

  const handleGenerateAISummary = async () => {
    setAiLoading(true);
    try {
      const res = await generateDailySalesSummary(
        { grossSales, netSales, tax, tips, discounts, totalOrders },
        { categories: CATEGORY_SALES, hourly: HOURLY_DATA },
        { laborCost, laborPct }
      );
      setAiReport(res);
      confetti({
        particleCount: 40,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('AI Sales Summary Error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAddShiftNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    let aiSummary = undefined;
    setHandoverAiLoading(true);
    try {
      const handoverRes = await generateShiftHandoverSummary(
        [{ author: noteAuthor, shiftType: noteShiftType, note: noteContent }],
        { grossSales, netSales, totalOrders },
        { laborCost, laborPct },
        ops.eightySixed
      );
      aiSummary = handoverRes.summary;
    } catch {
      aiSummary = 'Shift recorded successfully.';
    } finally {
      setHandoverAiLoading(false);
    }

    ops.addShiftNote({
      author: noteAuthor,
      shiftType: noteShiftType,
      note: noteContent,
      weather: noteWeather,
      cashVariance: parseFloat(noteVariance) || 0,
      tags: [
        noteShiftType === 'morning' ? 'Lunch Rush' : 'Dinner Service',
        parseFloat(noteVariance) === 0 ? 'Drawer Balanced' : `Var: $${noteVariance}`,
      ],
      aiHandoverSummary: aiSummary,
    });

    setNoteContent('');
    setShowNoteModal(false);
    confetti({ particleCount: 30, spread: 60 });
  };

  const handlePrintZReport = () => {
    setPrintStatus('Spooling 80mm Z-Report to Thermal Printer (Star TSP143)...');
    setTimeout(() => {
      setPrintStatus('Printed Successfully!');
      setTimeout(() => setPrintStatus(null), 3000);
    }, 1200);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['Hour', 'Sales ($)', 'Orders', 'Labor ($)'],
      ...HOURLY_DATA.map((h) => [h.hour, h.sales, h.orders, h.labor]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily-Z-Report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              End-of-Day Financials &amp; Z-Report
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
              Daily Sales &amp; Shift Velocity
            </h2>
            <p className="mt-1 text-xs font-medium text-slate-600">
              Live consolidated register sales, category margins, tax reconciliation, and Gemini AI executive shift debriefing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Auto Print Toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
              <Printer className={`h-4 w-4 ${ops.autoPrintChits ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Auto-Print Chits:</span>
              <button
                onClick={() => ops.toggleAutoPrintChits()}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  ops.autoPrintChits ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={ops.autoPrintChits}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    ops.autoPrintChits ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={() => setShowNoteModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-50"
            >
              <NotebookPen className="h-4 w-4 text-orange-600" /> Add Shift Note
            </button>

            <button
              onClick={handleGenerateAISummary}
              disabled={aiLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:from-orange-500 hover:to-amber-500 disabled:opacity-50"
            >
              {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {aiLoading ? 'Gemini Analyzing Shift…' : 'Generate Gemini Shift Briefing'}
            </button>

            <button
              onClick={handlePrintZReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Printer className="h-4 w-4" /> Print Z-Report
            </button>

            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              <Download className="h-4 w-4" /> CSV Export
            </button>
          </div>
        </div>

        {printStatus && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in duration-200">
            <PrinterCheck className="h-4 w-4 text-emerald-600" />
            <span>{printStatus}</span>
          </div>
        )}

        {/* Core KPI Banner */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gross Receipts</span>
            <p className="mt-1 text-xl font-black text-slate-900">${grossSales.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Net Sales</span>
            <p className="mt-1 text-xl font-black text-emerald-950">${netSales.toFixed(2)}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <p className="mt-1 text-xl font-black text-slate-900">{totalOrders} tickets</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Avg Ticket</span>
            <p className="mt-1 text-xl font-black text-slate-900">${avgTicket}</p>
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">Labor Ratio</span>
            <p className="mt-1 text-xl font-black text-indigo-950">{laborPct}%</p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-3.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Tips Recorded</span>
            <p className="mt-1 text-xl font-black text-amber-950">${tips.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Gemini AI Executive Shift Briefing */}
      {aiReport && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-500/10 via-amber-50/60 to-white p-6 shadow-md">
          <div className="flex items-center justify-between border-b border-orange-200 pb-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-950">
              <Sparkles className="h-4 w-4 text-orange-600" />
              Gemini AI Executive Shift Briefing &amp; Manager Gameplan
            </div>
            <button onClick={() => setAiReport(null)} className="text-xs text-slate-400 hover:text-slate-700">
              Dismiss
            </button>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed space-y-2 whitespace-pre-line">
                {aiReport.summary}
              </div>
            </div>

            <div className="space-y-4 lg:col-span-5">
              {/* Key Highlights */}
              <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wide text-emerald-900">
                  Shift Highlights
                </span>
                <div className="mt-2 space-y-1.5">
                  {aiReport.highlights.map((hl, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>{hl}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tomorrow Actionable Recommendations */}
              <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm">
                <span className="text-xs font-black uppercase tracking-wide text-amber-900">
                  Tactical Tomorrow Tips
                </span>
                <div className="mt-2 space-y-1.5">
                  {aiReport.tomorrowTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-800 font-medium">
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics: Multi-Horizon Sales Trend Graph */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <h3 className="text-base font-black text-slate-900">Sales Trend &amp; Revenue Analytics</h3>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Interactive time-series analysis comparing hourly velocity, weekly trajectory, and category performance.
            </p>
          </div>

          {/* Trend Horizon Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
            <button
              onClick={() => setTrendHorizon('hourly')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                trendHorizon === 'hourly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today (Hourly)
            </button>
            <button
              onClick={() => setTrendHorizon('7day')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                trendHorizon === '7day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7-Day Trend
            </button>
            <button
              onClick={() => setTrendHorizon('30day')}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                trendHorizon === '30day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30-Day Growth
            </button>
          </div>
        </div>

        {/* Dynamic Chart Display based on selected Horizon */}
        <div className="mt-6">
          {trendHorizon === 'hourly' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Peak lunch crush (12-1 PM) &amp; Dinner rush (6-7 PM)</span>
                <span className="font-bold text-orange-600">Peak Hour: $410 @ 6 PM (16 Tickets)</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: number) => [`$${val}`, 'Sales']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="sales" name="Sales ($)" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {trendHorizon === '7day' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Weekly Revenue vs. Labor Cost (+14.2% week-over-week growth)</span>
                <span className="font-bold text-emerald-600">Top Day: Saturday ($2,850 Revenue)</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={SEVEN_DAY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: number) => [`$${val}`, 'Amount']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#ea580c" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="labor" name="Labor Cost ($)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {trendHorizon === '30day' && (
            <div>
              <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Month-to-Date Growth: Dine-In vs. Online QR Ordering</span>
                <span className="font-bold text-indigo-600">AOV Growth: $23.80 → $27.30 (+14.7%)</span>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={THIRTY_DAY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="week" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(val: number) => [`$${val}`, 'Sales']}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sales" name="Total Gross ($)" stroke="#ea580c" strokeWidth={3} />
                    <Line type="monotone" dataKey="dineIn" name="Dine-In POS ($)" stroke="#0ea5e9" strokeWidth={2} />
                    <Line type="monotone" dataKey="online" name="QR & Online ($)" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown & Payment Mix */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <h3 className="text-sm font-black text-slate-900">Category Sales Mix</h3>
          <div className="mt-4 space-y-2.5">
            {CATEGORY_SALES.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-bold text-slate-700">{cat.name}</span>
                </div>
                <span className="font-mono font-black text-slate-900">${cat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-6">
          <h3 className="text-sm font-black text-slate-900">Settlement by Payment Channel</h3>
          <div className="mt-4 space-y-2">
            {PAYMENT_METHODS.map((pm) => (
              <div key={pm.method} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                <span className="font-bold text-slate-700">{pm.method}</span>
                <div className="text-right">
                  <span className="font-mono font-black text-slate-900">{pm.amount}</span>
                  <span className="ml-1.5 text-[10px] text-slate-400">({pm.pct})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manager Shift Notes & Handover Logbook Section */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-600">
              <NotebookPen className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Manager Shift Logbook &amp; Handover Notes</h3>
              <p className="text-xs font-medium text-slate-500">
                Inter-shift communication, cash drawer variances, floor events, and Gemini AI handover briefings.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowNoteModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" /> Log Shift Note
          </button>
        </div>

        {/* Shift Notes List */}
        <div className="mt-4 space-y-3">
          {ops.shiftNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              No shift notes recorded today. Click "Log Shift Note" to add floor observations or cash variances.
            </div>
          ) : (
            ops.shiftNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        note.shiftType === 'morning'
                          ? 'bg-amber-100 text-amber-800'
                          : note.shiftType === 'night'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {note.shiftType === 'morning' ? (
                        <Sun className="h-3 w-3" />
                      ) : (
                        <Moon className="h-3 w-3" />
                      )}
                      {note.shiftType} shift
                    </span>
                    <span className="text-xs font-bold text-slate-900">{note.author}</span>
                    <span className="text-xs text-slate-400">· {note.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {note.weather && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <CloudSun className="h-3.5 w-3.5 text-slate-400" /> {note.weather}
                      </span>
                    )}
                    {note.cashVariance !== undefined && (
                      <span
                        className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                          note.cashVariance === 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Drawer Var: ${note.cashVariance.toFixed(2)}
                      </span>
                    )}
                    <button
                      onClick={() => ops.deleteShiftNote(note.id)}
                      className="rounded-lg p-1 text-slate-400 hover:text-red-600"
                      title="Delete Note"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-800 leading-relaxed">{note.note}</p>

                {note.tags && note.tags.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {note.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {note.aiHandoverSummary && (
                  <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50/60 p-3 text-xs text-orange-950">
                    <div className="flex items-center gap-1.5 font-bold text-orange-900">
                      <Sparkles className="h-3.5 w-3.5 text-orange-600" />
                      Gemini Handover Briefing:
                    </div>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed">{note.aiHandoverSummary}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Shift Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <NotebookPen className="h-5 w-5 text-orange-600" />
                <h3 className="text-base font-black text-slate-900">Log Shift Observation &amp; Handover</h3>
              </div>
              <button
                onClick={() => setShowNoteModal(false)}
                className="text-xs text-slate-400 hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddShiftNote} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Shift Type</label>
                  <select
                    value={noteShiftType}
                    onChange={(e: any) => setNoteShiftType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value="morning">Morning / Lunch</option>
                    <option value="night">Evening / Dinner</option>
                    <option value="all-day">All-Day Coverage</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Author Name</label>
                  <input
                    type="text"
                    value={noteAuthor}
                    onChange={(e) => setNoteAuthor(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500"
                    placeholder="e.g. Sarah M."
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-600">Shift Operational Notes</label>
                <textarea
                  rows={4}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record rush dynamics, 86'd items, guest feedback, maintenance or inventory notes for the incoming manager..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Weather / Foot Traffic</label>
                  <input
                    type="text"
                    value={noteWeather}
                    onChange={(e) => setNoteWeather(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500"
                    placeholder="e.g. Sunny · 72°F (Patio Full)"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-600">Cash Drawer Variance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={noteVariance}
                    onChange={(e) => setNoteVariance(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={handoverAiLoading || !noteContent.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-xs font-black text-white shadow-md hover:bg-orange-500 disabled:opacity-50"
                >
                  {handoverAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {handoverAiLoading ? 'Synthesizing Briefing…' : 'Save & Generate Briefing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySalesSummary;
