import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Ship, 
  ShieldCheck, 
  Milestone, 
  FileText, 
  Truck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Calculator, 
  AlertTriangle,
  Globe2,
  ChevronRight,
  Anchor,
  Compass
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentView, setIsAuthModalOpen, loginAs, language, setLanguage, t } = useApp();

  const handleLaunchDemo = async () => {
    await loginAs('vikram@palgharleather.com');
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-18 bg-white/90 backdrop-blur-md border-b border-stone-200 sticky top-0 z-40 px-6 sm:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="w-10 h-10 rounded-xl bg-teal-800 flex items-center justify-center text-white font-bold shadow-xs">
            <Ship className="w-5 h-5 text-teal-200" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-stone-900 tracking-tight text-lg">EXPORTPILOT</span>
              <span className="text-xs px-1.5 py-0.5 rounded font-bold bg-teal-100 text-teal-900">AI</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium">{t('brand.subtitle', 'India Trade Portal for MSMEs')}</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-stone-600">
          <a href="#features" className="hover:text-teal-800 transition">{t('landing.capabilities', 'Capabilities')}</a>
          <a href="#roadmap" className="hover:text-teal-800 transition">{t('landing.journey', '12-Step Journey')}</a>
          <a href="#compliance" className="hover:text-teal-800 transition">{t('landing.compliance', 'EU & US Rules')}</a>
          <a href="#estimator" className="hover:text-teal-800 transition">{t('landing.costSimulator', 'Cost Simulator')}</a>
        </nav>

        <div className="flex items-center space-x-3">
          {/* Language Selector */}
          <div className="flex items-center bg-stone-100 rounded-lg p-0.5 text-[11px] font-medium border border-stone-200">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded ${language === 'en' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 rounded ${language === 'hi' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              हिंदी
            </button>
            <button 
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 rounded ${language === 'mr' ? 'bg-white shadow-xs text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800'}`}
            >
              मराठी
            </button>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition"
          >
            {t('landing.signIn', 'Sign In')}
          </button>
          <button
            onClick={handleLaunchDemo}
            className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
          >
            <span>{t('landing.launchDemo', 'Instant Demo')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-6 sm:px-12 max-w-7xl mx-auto w-full grid-bg-pattern">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
            <span>Built for Indian MSMEs • JNPT & Mumbai Air Cargo Integrated</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-[1.15] mb-6">
            From India-ready to <span className="text-teal-800 underline decoration-teal-300 decoration-wavy underline-offset-8">Export-ready.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Demystifying cross-border trade for Indian manufacturers. Eliminate customs detentions, automate mandatory European and American compliance, audit export documentation with AI, and track ocean freight in real time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleLaunchDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm transition shadow-md flex items-center justify-center space-x-2"
            >
              <span>Explore Live Consignment (#EXP-0142)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                loginAs('vikram@palgharleather.com');
                setCurrentView('cost');
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-semibold text-sm transition shadow-2xs flex items-center justify-center space-x-2"
            >
              <Calculator className="w-4 h-4 text-stone-500" />
              <span>Simulate Freight & Insurance Costs</span>
            </button>
          </div>

          <p className="text-xs text-stone-400 mt-4">
            Zero setup required • Seeded with Palghar Leather Works to Hamburg, Germany
          </p>
        </div>

        {/* Live Preview Console Card */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="bg-stone-900 text-stone-200 px-5 py-3 border-b border-stone-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
              <span className="ml-2 font-mono text-stone-400">exportpilot.ai/live-consignment/#EXP-2025-0142</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-stone-400 font-mono">
              <span className="px-2 py-0.5 rounded bg-stone-800 text-emerald-400">DGFT IEC: Active</span>
              <span className="hidden sm:inline">Port: JNPT Nhava Sheva</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Readiness Gauge */}
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Readiness Score</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                    Almost Ready
                  </span>
                </div>
                <div className="text-center py-4">
                  <div className="text-5xl font-extrabold text-teal-900">78<span className="text-2xl font-normal text-stone-400">/100</span></div>
                  <p className="text-xs font-medium text-stone-600 mt-2">EU Autumn Batch: Premium Handbags</p>
                  <p className="text-[11px] text-stone-400">Target Port: Port of Hamburg (Germany)</p>
                </div>
              </div>

              <div className="space-y-2 border-t border-stone-200 pt-3 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Business Eligibility</span>
                  <span className="font-semibold text-emerald-600">100% Passed</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Documentation</span>
                  <span className="font-semibold text-emerald-600">95% Verified</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Chemical REACH Test</span>
                  <span className="font-semibold text-emerald-600">SGS Lab Pass</span>
                </div>
              </div>
            </div>

            {/* Middle Col: Maritime Vessel Status */}
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Maritime Transit</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 animate-pulse">
                    In Transit
                  </span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-teal-800 text-white flex items-center justify-center font-bold">
                    <Ship className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Hamburg Express</h4>
                    <p className="text-xs text-stone-500">CMA CGM Ocean Line • BL: MAEU928419</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />
                    <div>
                      <div className="font-semibold text-stone-800">Customs LEO Granted</div>
                      <div className="text-[10px] text-stone-500">JNPT Terminal 4 (12 Dec)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    <div>
                      <div className="font-semibold text-stone-800">En Route Arabian Sea</div>
                      <div className="text-[10px] text-stone-500">18.9°N, 71.4°E (14 Dec)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2.5 opacity-60">
                    <div className="w-2 h-2 rounded-full bg-stone-300 mt-1" />
                    <div>
                      <div className="font-semibold text-stone-800">Hamburg Port Inward</div>
                      <div className="text-[10px] text-stone-500">Estimated 28 Dec 2024</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-200 flex justify-between text-xs text-stone-600">
                <span>Consignment Value:</span>
                <span className="font-bold text-stone-900">$42,500 (FOB)</span>
              </div>
            </div>

            {/* Right Col: AI Copilot Advisory */}
            <div className="bg-stone-50 rounded-xl p-5 border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">AI Export Copilot</span>
                </div>
                <div className="bg-white rounded-lg p-3 border border-stone-200 text-xs text-stone-700 leading-relaxed mb-3">
                  <p className="font-semibold text-teal-900 mb-1">Audit Observation:</p>
                  "Commercial Invoice matches Packing List weight of 685.5 kg. SGS chemical report confirms Chromium VI &lt; 3 mg/kg. Ready for German customs pre-declaration."
                </div>
                <div className="text-[11px] text-stone-500 font-medium">
                  Available in <span className="text-stone-800 font-semibold">English</span>, <span className="text-stone-800 font-semibold">हिंदी</span>, and <span className="text-stone-800 font-semibold">मराठी</span>.
                </div>
              </div>

              <button
                onClick={handleLaunchDemo}
                className="w-full mt-4 py-2 rounded-lg bg-teal-800 hover:bg-teal-700 text-white font-semibold text-xs transition flex items-center justify-center space-x-1.5"
              >
                <span>Open Export Dashboard</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section id="features" className="py-20 px-6 sm:px-12 bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-700">End-To-End Architecture</span>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-2">
              Everything an Indian MSME Needs to Ship Globally
            </h2>
            <p className="text-sm text-stone-600 mt-3">
              We replaced disconnected spreadsheets, confusing DGFT circulars, and expensive consultants with a single, synchronized platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Deterministic Readiness Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                A mathematical 9-category weighted evaluation (0-100) scoring business eligibility, document completeness, destination laboratory tests, and customs clearance readiness.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Milestone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">12-Step Guided Roadmap</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Step-by-step guidance from port AD code registration and HS classification to ISPM-15 pallet stuffing, ICEGATE shipping bill filing, and port delivery.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Smart Document Vault & AI Audit</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Server-side Gemini AI extraction analyzes Commercial Invoices, Packing Lists, and test reports to catch missing mandatory fields before customs detention occurs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">What-If Cost & Timeline Estimator</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Interactive simulator comparing Sea vs Air freight, packaging grades, and Institute Cargo Clauses (A) marine insurance to estimate true landed export costs.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Customs & CHA Coordination</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Direct coordination framework with your designated Customs House Agent at JNPT, Mundra, or Sahar Air Cargo for Let Export Order (LEO) generation.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-stone-50/50 hover:border-teal-300 transition">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-white flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-stone-900 mb-2">Risk Radar & Blockers Alert</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Automatic detection of high-risk scenarios like unaccredited testing certificates, German VerpackG packaging gaps, or maritime rerouting delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-12 px-6 sm:px-12 border-t border-stone-800 mt-auto text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 flex items-center justify-center text-white font-bold">
              <Ship className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">EXPORTPILOT AI</span>
              <p className="text-[11px] text-stone-500">From India-ready to Export-ready</p>
            </div>
          </div>

          <div className="text-stone-500 text-center sm:text-right">
            <p>Empowering MSMEs across Palghar, Maharashtra & India.</p>
            <p className="text-[10px] text-stone-600 mt-1">
              Compliant with DGFT Foreign Trade Policy 2023 & CBIC ICEGATE Standards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
