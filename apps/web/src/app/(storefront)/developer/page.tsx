import { SystemStatusCard } from '@/components/SystemStatusCard';
import Link from 'next/link';

export const metadata = {
  title: 'Developer & Platform Health | Verde & Crust',
  description: 'Live system status, API telemetry, database connectivity, and OpenAPI Swagger documentation for Verde & Crust.',
};

export default function DeveloperPage() {
  return (
    <>
      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Developer Portal Hero Banner */}
        <section className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white overflow-hidden p-8 md:p-12 shadow-2xl shadow-slate-900/10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Telemetry & Platform Health
            </div>

            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Developer & <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Platform Health Portal
              </span>
            </h2>

            <p className="text-slate-300 text-sm md:text-base font-normal leading-relaxed max-w-2xl">
              Monitor live API endpoint status, PostgreSQL database connectivity, system response health, and access the OpenAPI Swagger documentation playground.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="http://localhost:3000/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
              >
                <span>Interactive Swagger UI</span>
                <span className="text-xs">↗</span>
              </a>
              <Link
                href="/"
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold backdrop-blur-md transition cursor-pointer"
              >
                ← Back to Order Studio
              </Link>
            </div>
          </div>
        </section>

        {/* Live Telemetry & Health Cards Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200/80 pb-4">
            <div>
              <h3 className="text-xl font-bold text-slate-900">System Telemetry & Metrics</h3>
              <p className="text-slate-600 text-xs md:text-sm">Real-time status of backend services and databases</p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-200/70 text-slate-700">
              Public Route
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full">
            {/* Real-time System Status Component */}
            <SystemStatusCard />

            {/* Swagger & API Docs Reference Card */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col items-start gap-4 text-left justify-between hover:shadow-md transition">
              <div className="space-y-2.5 w-full">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    OpenAPI 3.0 Specification
                  </span>
                  <span className="text-xs font-mono text-slate-500">v1.0.0</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">NestJS API Playground</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Test and inspect endpoints for User Authentication, Pizza Customizer, Order Processing, and Profile management directly via Swagger UI.
                </p>
              </div>

              <a
                href="http://localhost:3000/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 text-center text-sm font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition duration-200 shadow-sm cursor-pointer"
              >
                Open Swagger UI Docs ↗
              </a>
            </div>
          </div>
        </section>

        {/* API Endpoints & Architecture Quick Specs */}
        <section className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                ⚙️
              </span>
              <h4 className="font-bold text-slate-900 text-base">Backend Architecture</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Framework</span>
                <span className="font-bold text-slate-900">NestJS (Node.js)</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Database</span>
                <span className="font-bold text-slate-900">PostgreSQL 16</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>ORM</span>
                <span className="font-bold text-slate-900">Sequelize + TS</span>
              </li>
              <li className="flex justify-between">
                <span>Authentication</span>
                <span className="font-bold text-slate-900">JWT + HttpOnly / Bearer</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                🌐
              </span>
              <h4 className="font-bold text-slate-900 text-base">Frontend Integration</h4>
            </div>
            <ul className="space-y-2 text-xs text-slate-600 font-medium">
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Framework</span>
                <span className="font-bold text-slate-900">Next.js App Router</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Styling</span>
                <span className="font-bold text-slate-900">Tailwind CSS</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>API Base URL</span>
                <span className="font-mono font-bold text-slate-900">http://localhost:3000</span>
              </li>
              <li className="flex justify-between">
                <span>Access Control</span>
                <span className="font-bold text-emerald-700">Public Route</span>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 mt-12 py-6 px-6">
        <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 font-bold">Verde & Crust</span>
            <span>• Artisanal Healthy Pizza Ordering System</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-slate-900">
              Home
            </Link>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              API Docs ↗
            </a>
            <span>© 2026 Pizza Order Builder</span>
          </div>
        </div>
      </footer>
    </>
  );
}
