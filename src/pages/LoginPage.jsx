import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { IonPage, IonContent } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const SOLECTWA = ['Tymbark', 'Podłopień', 'Zawadka', 'Piekiełko', 'Zamieście'];

function LoginPage() {
  const { login, register, loginAsGuest } = useAuth();
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

  const handleGuestLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      loginAsGuest();
      setLoading(false);
    }, 800);
  };

  return (
    <IonPage>
      <IonContent scrollY={true} className="ion-no-padding" style={{ '--background': 'transparent' }}>
        <div
          className="min-h-full w-full flex flex-col justify-center bg-cover bg-center bg-[#14532d] px-6 py-12 relative overflow-hidden"
          style={{ backgroundImage: `url('${import.meta.env.BASE_URL}login_bg.svg')` }}
        >
      {/* Dark background overlay to improve contrast */}
      <div className="absolute inset-0 bg-black/45 pointer-events-none z-0" />

      {/* Background glowing orbs */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-mint-light/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-yellow-300/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-[24px] bg-white/10 backdrop-blur-xl flex items-center justify-center mx-auto mb-4 shadow-2xl border border-white/20 animate-pulse-soft">
            <img
              src={`${import.meta.env.BASE_URL}logo_tuDzialam.png`}
              alt="Logo Tu Działam"
              className="w-14 h-14 rounded-xl object-contain"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e2fbf0] to-[#86efac] tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(20,83,45,0.4)]">
            Tu Działam
          </h1>
          <p className="text-xs text-emerald-100/90 mt-2 font-bold tracking-wide drop-shadow-[0_1px_3px_rgba(20,83,45,0.5)]">
            Poznaj i współtwórz swoją okolicę
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-emerald-950/55 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] border border-white/15 transition-all duration-300 text-white">
          {/* Tab Selector */}
          <div className="flex bg-emerald-900/40 rounded-2xl p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                isLogin ? 'bg-[#16a34a] text-white shadow-md shadow-[#16a34a]/20' : 'text-emerald-100/60 hover:text-white'
              }`}
            >
              Zaloguj się
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-300 ${
                !isLogin ? 'bg-[#16a34a] text-white shadow-md shadow-[#16a34a]/20' : 'text-emerald-100/60 hover:text-white'
              }`}
            >
              Załóż konto
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl p-3 text-xs font-semibold mb-4 animate-shake text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider block ml-1">Imię</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50" />
                  <input
                    type="text"
                    placeholder="Np. Anna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-emerald-900/20 border border-white/10 rounded-2xl text-xs font-medium text-white placeholder-white/25 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider block ml-1">E-mail</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50" />
                <input
                  type="email"
                  placeholder="np. ania@tymbark.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-emerald-900/20 border border-white/10 rounded-2xl text-xs font-medium text-white placeholder-white/25 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider block ml-1">Hasło</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-emerald-900/20 border border-white/10 rounded-2xl text-xs font-medium text-white placeholder-white/25 outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Sołectwo dropdown (Register only) */}
            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider block ml-1">Moje sołectwo</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/50 pointer-events-none" />
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full pl-10 pr-8 py-3 bg-emerald-900/20 border border-white/10 rounded-2xl text-xs font-bold text-white appearance-none outline-none focus:ring-2 focus:ring-emerald-400/20 focus:border-emerald-400 transition-all"
                  >
                    {SOLECTWA.map((sol) => (
                      <option key={sol} value={sol} className="bg-emerald-950 text-white font-semibold">
                        Sołectwo {sol}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-200/50 pointer-events-none text-[10px] font-bold">▼</div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-[#86efac] to-[#22c55e] text-[#14532d] font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/15 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 transition-all mt-6"
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

            {/* Guest Login Button */}
            {isLogin && (
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-white/5 hover:bg-white/10 text-emerald-100 border border-white/10 hover:border-white/20 font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <span>Uruchom jako Gość</span>
              </button>
            )}
          </form>

          {/* Instructions */}
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <p className="text-[10px] text-emerald-100/60 font-medium tracking-wide">
              Zaloguj się na swoje konto lub wejdź jako gość, aby przetestować aplikację.
            </p>
          </div>
        </div>
      </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default LoginPage;
