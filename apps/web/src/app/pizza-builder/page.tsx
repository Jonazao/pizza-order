'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppHeader } from '@/components/AppHeader';
import { getCatalogItems, CatalogItem } from '@/lib/api/catalog';
import { useAuth } from '@/lib/auth/auth-context';
import { createCustomPizza, getCustomPizzas } from '@/lib/api/custom-pizza';
import Link from 'next/link';

export default function PizzaBuilderPage() {
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  // Data queries
  const catalogQuery = useQuery({
    queryKey: ['catalog'],
    queryFn: getCatalogItems,
  });
  const catalog = catalogQuery.data ?? [];

  const savedPizzasQuery = useQuery({
    queryKey: ['custom-pizzas'],
    queryFn: () => getCustomPizzas({ limit: 50 }),
    enabled: !!user,
  });
  const savedPizzas = savedPizzasQuery.data?.items ?? [];

  const savePizzaMutation = useMutation({
    mutationFn: createCustomPizza,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-pizzas'] });
    },
  });

  const [error, setError] = useState<string | null>(null);
  const catalogError = catalogQuery.isError && catalogQuery.error instanceof Error
    ? catalogQuery.error.message
    : null;

  // Wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedCrust, setSelectedCrust] = useState<CatalogItem | null>(null);
  const [selectedSauce, setSelectedSauce] = useState<CatalogItem | null>(null);
  const [selectedBase, setSelectedBase] = useState<CatalogItem | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<CatalogItem[]>([]);
  const [pizzaName, setPizzaName] = useState<string>('');

  // Submit states
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Filter catalog items by category
  const crusts = catalog.filter((item) => item.category === 'Crust');
  const sauces = catalog.filter((item) => item.category === 'Sauce');
  const bases = catalog.filter((item) => item.category === 'Base');
  const toppings = catalog.filter((item) => item.category === 'Toppings');

  // Dynamic cost calculation
  const totalCost = parseFloat(
    (
      (selectedCrust?.price || 0) +
      (selectedSauce?.price || 0) +
      (selectedBase?.price || 0) +
      selectedToppings.reduce((sum, topping) => sum + topping.price, 0)
    ).toFixed(2)
  );

  // Stepper handlers
  const handleNext = () => {
    if (currentStep === 1 && !selectedCrust) return;
    if (currentStep === 2 && !selectedSauce) return;
    if (currentStep === 3 && !selectedBase) return;
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleToppingToggle = (item: CatalogItem) => {
    if (selectedToppings.find((t) => t.id === item.id)) {
      setSelectedToppings((prev) => prev.filter((t) => t.id !== item.id));
    } else {
      setSelectedToppings((prev) => [...prev, item]);
    }
  };

  const handleSavePizza = async () => {
    if (!user) {
      setError('You must be logged in to save custom pizzas.');
      return;
    }
    if (!selectedCrust || !selectedSauce || !selectedBase || !pizzaName.trim()) {
      setError('Please complete all steps and specify a pizza name.');
      return;
    }

    setError(null);

    try {
      await savePizzaMutation.mutateAsync({
        name: pizzaName,
        crustId: selectedCrust.id,
        sauceId: selectedSauce.id,
        baseId: selectedBase.id,
        toppings: selectedToppings.map((t) => t.id),
      });

      setSubmitSuccess(true);

      // Reset wizard
      setSelectedCrust(null);
      setSelectedSauce(null);
      setSelectedBase(null);
      setSelectedToppings([]);
      setPizzaName('');
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to save your custom pizza.');
    }
  };

  // Helper validation for steps
  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!selectedCrust;
      case 2:
        return !!selectedSauce;
      case 3:
        return !!selectedBase;
      case 4:
        return true; // toppings are optional
      case 5:
        return !!pizzaName.trim();
      default:
        return false;
    }
  };

  const stepsList = [
    { num: 1, label: 'Crust' },
    { num: 2, label: 'Sauce' },
    { num: 3, label: 'Base' },
    { num: 4, label: 'Toppings' },
    { num: 5, label: 'Review & Name' },
  ];

  return (
    <div className="flex-1 flex flex-col justify-between min-h-screen bg-stone-50">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Builder Interface */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Stepper Progress */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between relative">
              {stepsList.map((step, idx) => (
                <div key={step.num} className="flex flex-col items-center flex-1 z-10">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border-2 transition duration-300 ${
                      currentStep === step.num
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : currentStep > step.num
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}
                  >
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span
                    className={`text-[10px] md:text-xs font-semibold mt-2.5 transition ${
                      currentStep === step.num
                        ? 'text-emerald-700 font-bold'
                        : 'text-slate-500 font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
              
              {/* Connector line */}
              <div className="absolute left-1/10 right-1/10 top-5 h-0.5 bg-slate-100 -z-10">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${((currentStep - 1) / (stepsList.length - 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Banner notification for success or guest warning */}
          {submitSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between">
              <span className="text-xs font-medium">✨ Custom pizza saved successfully! Check it out in your creations.</span>
              <button onClick={() => setSubmitSuccess(false)} className="text-xs font-bold hover:underline cursor-pointer">Dismiss</button>
            </div>
          )}

          {!user && !authLoading && (
            <div className="p-5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold">🍕 Persist Your Signature Recipes</p>
                <p className="text-[11px] text-orange-800 leading-relaxed font-light">
                  You can design your pizza as a guest, but you must register or log in to save the build to your profile for quick reorders.
                </p>
              </div>
              <Link
                href="/login"
                className="px-4 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl whitespace-nowrap transition cursor-pointer"
              >
                Sign In Now
              </Link>
            </div>
          )}

          {(catalogError || error) && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              ⚠️ {catalogError || error}
            </div>
          )}

          {/* Builder Step Contents */}
          <div className="flex-1 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[400px]">
            {catalogQuery.isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin"></div>
                <p className="text-xs font-medium text-slate-500">Loading builder options...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-6">
                
                {/* Step 1: Crust Selection */}
                {currentStep === 1 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Select Crust Type</h3>
                      <p className="text-xs text-slate-400 font-light">Choose the artisanal canvas for your pizza (Required)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {crusts.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedCrust(item)}
                          className={`group p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                            selectedCrust?.id === item.id
                              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                              : 'border-slate-200 hover:border-emerald-600/40 hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                                {item.title}
                              </h4>
                              <span className="font-mono font-semibold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                +${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-light leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Sauce Selection */}
                {currentStep === 2 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Select Sauce</h3>
                      <p className="text-xs text-slate-400 font-light">Choose the slow-cooked foundation flavor (Required)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sauces.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedSauce(item)}
                          className={`group p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                            selectedSauce?.id === item.id
                              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                              : 'border-slate-200 hover:border-emerald-600/40 hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                                {item.title}
                              </h4>
                              <span className="font-mono font-semibold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                +${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-light leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 3: Base Cheese Selection */}
                {currentStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Select Base & Cheeses</h3>
                      <p className="text-xs text-slate-400 font-light">Choose the melting blanket of flavor (Required)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bases.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedBase(item)}
                          className={`group p-5 rounded-2xl border text-left cursor-pointer transition flex flex-col justify-between ${
                            selectedBase?.id === item.id
                              ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                              : 'border-slate-200 hover:border-emerald-600/40 hover:bg-stone-50/50'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                                {item.title}
                              </h4>
                              <span className="font-mono font-semibold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                +${item.price.toFixed(2)}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-light leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 4: Toppings Selection */}
                {currentStep === 4 && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Select Toppings</h3>
                      <p className="text-xs text-slate-400 font-light">Top it off! Select as many toppings as you desire (Optional)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {toppings.map((item) => {
                        const isSelected = !!selectedToppings.find((t) => t.id === item.id);
                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToppingToggle(item)}
                            className={`group p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50/20 ring-1 ring-emerald-600'
                                : 'border-slate-200 hover:border-emerald-600/40 hover:bg-stone-50/50'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition">
                                  {item.title}
                                </h4>
                                <span className="font-mono font-semibold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                  +${item.price.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-light leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Save */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900">Review & Name Your Creation</h3>
                      <p className="text-xs text-slate-400 font-light">Set a recipe name to save this custom pizza (Required)</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Custom Pizza Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Grandma's Garden Party"
                          value={pizzaName}
                          onChange={(e) => setPizzaName(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-stone-50 transition"
                        />
                      </div>

                      {/* Selection Summary Table */}
                      <div className="rounded-2xl border border-slate-200 bg-stone-50/50 p-4 space-y-3.5">
                        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Recipe Blueprint</h4>
                        
                        <div className="divide-y divide-slate-100 text-xs space-y-2.5">
                          <div className="flex justify-between pt-2.5 first:pt-0">
                            <span className="text-slate-500 font-medium">Crust Type</span>
                            <span className="text-slate-900 font-semibold">{selectedCrust?.title}</span>
                          </div>
                          <div className="flex justify-between pt-2.5">
                            <span className="text-slate-500 font-medium">Classic Sauce</span>
                            <span className="text-slate-900 font-semibold">{selectedSauce?.title}</span>
                          </div>
                          <div className="flex justify-between pt-2.5">
                            <span className="text-slate-500 font-medium">Base Cheese</span>
                            <span className="text-slate-900 font-semibold">{selectedBase?.title}</span>
                          </div>
                          <div className="flex justify-between pt-2.5">
                            <span className="text-slate-500 font-medium">Toppings ({selectedToppings.length})</span>
                            <span className="text-slate-900 font-semibold text-right max-w-[200px] truncate">
                              {selectedToppings.length > 0
                                ? selectedToppings.map((t) => t.title).join(', ')
                                : 'No toppings selected'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stepper Actions footer */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-8">
                  {currentStep > 1 ? (
                    <button
                      onClick={handleBack}
                      className="px-5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                    >
                      Back
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {currentStep < 5 ? (
                    <button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      className={`px-6 py-2.5 text-xs font-bold rounded-xl text-white transition cursor-pointer ${
                        isStepValid()
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSavePizza}
                      disabled={!isStepValid() || savePizzaMutation.isPending || !user}
                      className={`px-6 py-2.5 text-xs font-bold rounded-xl text-white transition cursor-pointer ${
                        isStepValid() && !savePizzaMutation.isPending && user
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {savePizzaMutation.isPending ? 'Saving recipe...' : 'Save Pizza & Exit'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Summary & Saved Creations */}
        <div className="space-y-6">
          
          {/* Real-time Order Summary */}
          <div className="p-6 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
            
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Live Price Estimator</h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Ingredients</span>
                  <span className="font-mono">
                    $
                    {(
                      (selectedCrust?.price || 0) +
                      (selectedSauce?.price || 0) +
                      (selectedBase?.price || 0)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Toppings ({selectedToppings.length})</span>
                  <span className="font-mono">
                    $
                    {selectedToppings.reduce((sum, t) => sum + t.price, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 flex justify-between items-end">
              <span className="text-sm font-semibold text-slate-300">Estimated Total</span>
              <span className="text-3xl font-extrabold text-emerald-400 font-mono">${totalCost.toFixed(2)}</span>
            </div>
          </div>

          {/* User's Saved Creations */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col gap-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-slate-900">Your Signature Recipes</h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                {savedPizzas.length} Saved
              </span>
            </div>

            {savedPizzasQuery.isLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 animate-spin rounded-full"></div>
              </div>
            ) : !user ? (
              <div className="text-center py-6 space-y-2">
                <span className="text-2xl">🔒</span>
                <p className="text-xs font-medium text-slate-600">Creations are locked</p>
                <p className="text-[10px] text-slate-400 leading-normal max-w-[200px] mx-auto font-light">
                  Sign in to view and reorder your customized pizza configurations instantly.
                </p>
              </div>
            ) : savedPizzas.length === 0 ? (
              <div className="text-center py-8 space-y-2 text-slate-400">
                <span className="text-2xl">👩‍🍳</span>
                <p className="text-xs font-medium text-slate-500">No saved pizzas yet</p>
                <p className="text-[10px] leading-normal font-light">
                  Use the wizard on the left to combine your favorite ingredients and save them here!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                {savedPizzas.map((pizza) => (
                  <div
                    key={pizza.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-stone-50/50 hover:bg-stone-50 transition space-y-2.5 text-left"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-slate-900 text-xs tracking-tight">
                        {pizza.name}
                      </h4>
                      <span className="font-mono font-bold text-xs text-emerald-800 whitespace-nowrap">
                        ${pizza.totalPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-light leading-normal space-y-0.5">
                      <p>• <span className="font-medium">Crust:</span> {pizza.crust?.title}</p>
                      <p>• <span className="font-medium">Sauce:</span> {pizza.sauce?.title}</p>
                      <p>• <span className="font-medium">Base:</span> {pizza.base?.title}</p>
                      {pizza.toppings && pizza.toppings.length > 0 && (
                        <p className="truncate">
                          • <span className="font-medium">Toppings:</span>{' '}
                          {pizza.toppings.map((t) => t.title).join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Quick Order Button */}
                    <button
                      onClick={() => alert(`Order placed for ${pizza.name}! (Simulated)`)}
                      className="w-full mt-2 py-1.5 text-[10px] font-bold text-center text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition cursor-pointer"
                    >
                      Quick Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-center py-8 text-xs border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-6 space-y-2">
          <p>© 2026 Verde & Crust Artisanal Pizza Studio. All rights reserved.</p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <Link href="/catalog" className="hover:text-white transition">Catalog</Link>
            <Link href="/developer" className="hover:text-white transition">Developer Health</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
