import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SOLECTWA = ['Tymbark', 'Podłopień', 'Zawadka', 'Piekiełko', 'Zamieście'];

function LoginPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [village, setVillage] = useState('Tymbark');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Proszę wypełnić wszystkie wymagane pola.');
      return;
    }

    if (!isLogin && !name) {
      setError('Proszę podać swoje imię.');
      return;
    }

    setLoading(true);

    // Artificial delay to make it feel like a real API call and show the premium loader
    setTimeout(() => {
      let result;
      if (isLogin) {
        result = login(email, password);
      } else {
        result = register(name, email, password, village);
      }

      setLoading(false);
      if (!result.success) {
        setError(result.error);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-br from-forest via-forest-mid to-forest-light px-6 py-12 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-mint-light/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white text-2xl font-black tracking-tight">T</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Tymbark Hub</h1>
          <p className="text-xs text-white/60 mt-1.5 font-medium">Poznaj i współtwórz swoją okolicę</p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 transition-all duration-300">
          {/* Tab Selector */}
          <div className="flex bg-soft-bg rounded-2xl p-1 mb-6 border border-card-border">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                isLogin ? 'bg-white text-forest shadow-sm' : 'text-graphite-light hover:text-graphite'
              }`}
            >
              Zaloguj się
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                !isLogin ? 'bg-white text-forest shadow-sm' : 'text-graphite-light hover:text-graphite'
              }`}
            >
              Załóż konto
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-500 rounded-2xl p-3 text-xs font-semibold mb-4 animate-shake text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-graphite-light uppercase tracking-wider block ml-1">Imię</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-light" />
                  <input
                    type="text"
                    placeholder="Np. Anna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-soft-bg border border-card-border rounded-2xl text-xs font-medium text-graphite placeholder-graphite-light/60 outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-graphite-light uppercase tracking-wider block ml-1">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-light" />
                <input
                  type="email"
                  placeholder="np. ania@tymbark.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-soft-bg border border-card-border rounded-2xl text-xs font-medium text-graphite placeholder-graphite-light/60 outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-graphite-light uppercase tracking-wider block ml-1">Hasło</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-light" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-soft-bg border border-card-border rounded-2xl text-xs font-medium text-graphite placeholder-graphite-light/60 outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-graphite-light hover:text-graphite focus:outline-none"
                  aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sołectwo dropdown (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-graphite-light uppercase tracking-wider block ml-1">Moje sołectwo</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-graphite-light pointer-events-none" />
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full pl-10 pr-8 py-3 bg-soft-bg border border-card-border rounded-2xl text-xs font-bold text-graphite appearance-none outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all"
                  >
                    {SOLECTWA.map((sol) => (
                      <option key={sol} value={sol}>
                        Sołectwo {sol}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-graphite-light pointer-events-none text-[10px] font-bold">▼</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 gradient-primary text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-forest/15 hover:opacity-95 transition-opacity active:scale-[0.98] disabled:opacity-50 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Trwa uwierzytelnianie...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? 'Zaloguj się' : 'Zarejestruj się'}</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Quick instructions (Login page help) */}
          <div className="mt-6 pt-5 border-t border-card-border text-center">
            <p className="text-[10px] text-graphite-light">
              {isLogin ? (
                <>
                  Szybkie testowanie: <span className="font-bold text-forest select-all">ania@tymbark.pl</span> hasło: <span className="font-bold text-forest select-all">haslo123</span>
                </>
              ) : (
                'Zakładając konto zyskujesz dostęp do lokalnego portfela punktów i mapy.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
