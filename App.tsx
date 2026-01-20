
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ACADEMY_NAME, TRAINER_PIN } from './constants.ts';
import { Student } from './types.ts';
import { getSessionUser, setSessionUser as saveSession } from './lib/storage.ts';

// Pages
import Home from './pages/Home.tsx';
import StudentLogin from './pages/StudentLogin.tsx';
import TrainerPortal from './pages/TrainerPortal.tsx';
import Lessons from './pages/Lessons.tsx';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const user = getSessionUser();
      if (user) setCurrentUser(user);
    } catch (e) {
      console.error("Session restoration failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSetUser = (user: Student | null) => {
    setCurrentUser(user);
    saveSession(user);
  };

  if (loading) return null;

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="bg-white border-b border-slate-100 p-5 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">GS</div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
                {ACADEMY_NAME}
              </h1>
            </Link>
            
            <nav className="flex items-center gap-8 text-sm font-black">
              <Link to="/trainer-login" className="text-slate-400 hover:text-orange-500 transition-colors uppercase text-xs">Sensei Portal</Link>
              {currentUser ? (
                <div className="flex items-center gap-5">
                  <Link to="/lessons" className="text-orange-600 hover:underline uppercase text-xs">Practice Room</Link>
                  <div className="flex items-center gap-4 bg-orange-50 px-4 py-2 rounded-2xl border border-orange-100">
                    <span className="text-orange-700">Student: {currentUser.displayName}</span>
                    <button onClick={() => handleSetUser(null)} className="text-orange-400 hover:text-orange-600 text-[10px] ml-2">LOGOUT</button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl transition-all shadow-lg text-xs uppercase tracking-widest">Student Login</Link>
              )}
            </nav>
          </div>
        </header>

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home user={currentUser} />} />
            <Route path="/login" element={<StudentLogin onLogin={handleSetUser} />} />
            <Route path="/lessons" element={currentUser ? <Lessons user={currentUser} /> : <Home user={currentUser} />} />
            <Route path="/trainer-login" element={<TrainerLogin />} />
            <Route path="/trainer-portal" element={<TrainerPortal />} />
          </Routes>
        </main>

        <footer className="bg-slate-50 p-10 border-t border-slate-100 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} {ACADEMY_NAME}. Train Hard, Be Kind.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

const TrainerLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === TRAINER_PIN) navigate('/trainer-portal');
    else setError('Incorrect PIN.');
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-12 bg-white rounded-[3rem] border border-slate-100 shadow-2xl">
      <h2 className="text-3xl font-black mb-8 text-center text-slate-900 uppercase">Sensei Access</h2>
      <form onSubmit={handleLogin} className="space-y-8 text-center">
        <input 
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full bg-slate-50 border-2 border-slate-100 p-6 rounded-3xl text-center text-4xl font-black tracking-[0.5em] focus:border-orange-500 outline-none"
          placeholder="****"
          maxLength={4}
        />
        {error && <p className="text-red-500 font-bold">{error}</p>}
        <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl hover:bg-orange-600 transition-all uppercase italic tracking-widest">Enter Portal</button>
      </form>
    </div>
  );
};

export default App;
