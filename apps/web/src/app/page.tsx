import { HeaderAuth } from '@/components/HeaderAuth';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-stone-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl w-full mx-auto flex justify-between items-center px-6 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20 font-bold">
              🌿
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">
                Verde & Crust
              </h1>
              <span className="text-xs text-emerald-700 font-medium tracking-wide">
                Artisanal Pizza Studio
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#builder" className="hover:text-emerald-700 transition">
              Custom Builder
            </Link>
            <Link href="#specialties" className="hover:text-emerald-700 transition">
              Signature Menu
            </Link>
            <Link href="#nutrition" className="hover:text-emerald-700 transition">
              Healthy Crusts
            </Link>
            <Link href="/developer" className="hover:text-emerald-700 transition font-medium">
              Developer & Health
            </Link>
          </nav>
          
          <HeaderAuth />
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 flex flex-col gap-16">
        <section className="relative rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden p-8 md:p-14 shadow-2xl shadow-emerald-900/10">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              100% Organic & Farm-Fresh Ingredients
            </div>

            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Craft Your Perfect <br />
              <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
                Healthy Artisanal Pizza
              </span>
            </h2>

            <p className="text-emerald-100/90 text-base md:text-xl font-normal leading-relaxed max-w-2xl">
              Build your custom pizza with fermented sourdough, gluten-free cauliflower crusts, organic vine-ripened tomato sauces, and fresh locally-sourced toppings.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="#builder"
                className="px-7 py-3.5 rounded-full bg-orange-600 hover:bg-orange-500 text-white text-base font-bold shadow-lg shadow-orange-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                Start Pizza Builder 🍕
              </Link>
              <Link
                href="#specialties"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-base font-semibold backdrop-blur-md transition cursor-pointer"
              >
                Explore Menu
              </Link>
            </div>
          </div>
        </section>

        {/* Healthy Features Highlights */}
        <section id="nutrition" className="space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
              Why Verde & Crust?
            </span>
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Fresh Ingredients, Tailored Nutrition
            </h3>
            <p className="text-slate-600 text-sm md:text-base">
              Every order is crafted with real ingredients and customizable dietary specs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl font-bold">
                🌾
              </div>
              <h4 className="text-lg font-bold text-slate-900">Artisanal Crusts</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                48-hour slow fermented sourdough, organic whole wheat, or crispy keto cauliflower bases.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold">
                🍅
              </div>
              <h4 className="text-lg font-bold text-slate-900">Vine-Ripened Sauces</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                San Marzano tomato marinara, fresh basil pesto, or house cashew garlic cream.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center text-2xl font-bold">
                🥑
              </div>
              <h4 className="text-lg font-bold text-slate-900">Macro & Calorie Sync</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Real-time nutrition breakdown per slice as you add toppings and customize your order.
              </p>
            </div>
          </div>
        </section>

        {/* Signature Artisanal Pizzas Showcase */}
        <section id="specialties" className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900">Signature Healthy Creations</h3>
              <p className="text-slate-600 text-sm">Chef-inspired pizza combinations ready to order</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition">
              <div className="h-44 bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center text-6xl group-hover:scale-105 transition duration-300">
                🍕
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-base">Garden Harvest Sourdough</h4>
                  <span className="text-sm font-extrabold text-emerald-700">$18.99</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Organic sourdough, pesto sauce, wild arugula, cherry tomatoes, and vegan mozzarella.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Vegan
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Organic
                  </span>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition">
              <div className="h-44 bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center text-6xl group-hover:scale-105 transition duration-300">
                🧄
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-base">Truffle Mushroom Cauliflower</h4>
                  <span className="text-sm font-extrabold text-emerald-700">$21.50</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Gluten-free cauliflower crust, garlic cashew cream, roasted cremini mushrooms, and truffle oil.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                    Gluten-Free
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    Low-Carb
                  </span>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition">
              <div className="h-44 bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center text-6xl group-hover:scale-105 transition duration-300">
                🌿
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-base">Artisanal Margherita Supreme</h4>
                  <span className="text-sm font-extrabold text-emerald-700">$17.50</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Whole wheat crust, San Marzano tomatoes, fresh buffalo mozzarella, and sweet basil leaves.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Classic
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Fresh Basil
                  </span>
                </div>
              </div>
            </div>
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
            <Link href="/developer" className="hover:text-slate-900">
              Platform Health
            </Link>
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noopener noreferrer" className="hover:text-slate-900">
              API Docs ↗
            </a>
            <span>© 2026 Pizza Order Builder</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

