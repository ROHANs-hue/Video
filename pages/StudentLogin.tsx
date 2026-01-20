
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BELTS } from '../constants.ts';
import { Belt, Student } from '../types.ts';
import { loginStudent, registerStudent } from '../lib/storage.ts';

interface Props {
  onLogin: (user: Student) => void;
}

const StudentLogin: React.FC<Props> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [belt, setBelt] = useState<Belt>(Belt.WHITE);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      const result = registerStudent(displayName, username, password, belt);
      if (typeof result === 'string') {
        setError(result);
      } else {
        onLogin(result);
        navigate('/lessons');
      }
    } else {
      const result = loginStudent(username, password);
      if (typeof result === 'string') {
        setError(result);
      } else {
        onLogin(result);
        navigate('/lessons');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-10 bg-white rounded-3xl border border-orange-100 shadow-2xl">
      <h2 className="text-4xl font-black mb-2 text-center text-slate-900 uppercase italic">
        {isRegistering ? 'Enroll' : 'Sign In'}
      </h2>
      <p className="text-slate-400 text-center mb-8 text-sm uppercase font-bold tracking-widest">OSS! Enter Dojo</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegistering && (
          <div>
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Your Name</label>
            <input 
              required
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
              placeholder="e.g. Ken Masters"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Username</label>
          <input 
            required
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
            placeholder="WarriorID"
          />
        </div>

        <div>
          <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Password</label>
          <input 
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold"
            placeholder="••••••••"
          />
        </div>

        {isRegistering && (
          <div>
            <label className="block text-xs font-black text-slate-400 mb-2 uppercase">Current Belt</label>
            <select 
              value={belt}
              onChange={(e) => setBelt(e.target.value as Belt)}
              className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold appearance-none cursor-pointer"
            >
              {BELTS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center font-black">{error}</p>}

        <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 uppercase italic">
          {isRegistering ? 'Create Account' : 'Enter Dojo'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button 
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-orange-600 font-bold text-sm hover:underline"
        >
          {isRegistering ? 'Already have an account? Sign in' : 'First time? Create a warrior profile'}
        </button>
      </div>
    </div>
  );
};

export default StudentLogin;
