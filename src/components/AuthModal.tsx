import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../services/apiClient';
import { Ship, CheckCircle2, Shield, ArrowRight, X, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAs, showToast, setCurrentView } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('Palghar');
  const [state, setState] = useState('Maharashtra');
  const [gstNumber, setGstNumber] = useState('');
  const [iecNumber, setIecNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleRoleQuickLogin = async (roleEmail: string) => {
    setIsLoading(true);
    try {
      await loginAs(roleEmail);
      setIsAuthModalOpen(false);
      setCurrentView('dashboard');
    } catch (e: any) {
      showToast(e.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isRegister) {
        const res = await apiClient.register({
          name,
          email,
          businessName,
          city,
          state,
          gstNumber,
          iecNumber,
          role: 'msme'
        });
        showToast(`Account created for ${res.business.name}`);
        await loginAs(email);
      } else {
        await loginAs(email || 'vikram@palgharleather.com');
      }
      setIsAuthModalOpen(false);
      setCurrentView('dashboard');
    } catch (err: any) {
      showToast(err.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-stone-50 border-b border-stone-100 p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-teal-800 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Ship className="w-6 h-6 text-teal-200" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">EXPORTPILOT AI</h3>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">From India-ready to Export-ready</p>
        </div>

        <div className="p-6">
          {/* Quick Demo Account Logins */}
          <div className="mb-6 bg-teal-50/70 border border-teal-200/80 rounded-xl p-3.5">
            <div className="flex items-center space-x-1.5 mb-2 text-teal-950 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" />
              <span>Instant Demo Accounts (Click to Access)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('vikram@palgharleather.com')}
                className="text-left p-2 rounded-lg bg-white border border-teal-100 hover:border-teal-400 hover:shadow-xs transition text-[11px]"
              >
                <div className="font-bold text-stone-900">Vikram Singhania</div>
                <div className="text-[10px] text-teal-800 font-medium">MSME Exporter (Palghar)</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('ananya@globaltradeadvisors.in')}
                className="text-left p-2 rounded-lg bg-white border border-teal-100 hover:border-teal-400 hover:shadow-xs transition text-[11px]"
              >
                <div className="font-bold text-stone-900">Ananya Sharma</div>
                <div className="text-[10px] text-teal-800 font-medium">Export Consultant</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('arjun@dgftfreight.com')}
                className="text-left p-2 rounded-lg bg-white border border-teal-100 hover:border-teal-400 hover:shadow-xs transition text-[11px]"
              >
                <div className="font-bold text-stone-900">Arjun Mehta</div>
                <div className="text-[10px] text-teal-800 font-medium">Logistics & CHA (JNPT)</div>
              </button>
              <button
                type="button"
                onClick={() => handleRoleQuickLogin('admin@exportpilot.ai')}
                className="text-left p-2 rounded-lg bg-white border border-teal-100 hover:border-teal-400 hover:shadow-xs transition text-[11px]"
              >
                <div className="font-bold text-stone-900">DGFT Rules Master</div>
                <div className="text-[10px] text-teal-800 font-medium">System Admin</div>
              </button>
            </div>
          </div>

          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-[11px] text-stone-400 uppercase tracking-wider font-semibold">Or enter details</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Singhania"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Business / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Palghar Leather Works"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Business Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
              <input
                type="password"
                required
                defaultValue="exportpilot2025"
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <span>{isLoading ? 'Authenticating...' : isRegister ? 'Create Exporter Account' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-stone-100 text-center">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-teal-800 hover:underline font-semibold"
            >
              {isRegister ? 'Already registered? Sign in here' : "First time exporter? Register your MSME"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
