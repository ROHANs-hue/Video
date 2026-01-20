
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ACADEMY_NAME } from '../constants.ts';
import { getDB } from '../lib/storage.ts';
import { Student } from '../types.ts';

interface Props {
  user: Student | null;
}

const Home: React.FC<Props> = ({ user }) => {
  const scoreboardData = useMemo(() => {
    const db = getDB();
    const scoresMap = new Map();

    // Initialize scores for all registered students
    db.students.forEach(student => {
      scoresMap.set(student.id, {
        id: student.id,
        displayName: student.displayName,
        belt: student.belt,
        totalPoints: 0
      });
    });

    // Correctly sum marks from submissions
    db.submissions.forEach(sub => {
      if (sub.score !== undefined && sub.score !== null) {
        const entry = scoresMap.get(sub.studentId);
        if (entry) {
          entry.totalPoints += Number(sub.score);
        }
      }
    });

    // Sort scores and get top 10
    return Array.from(scoresMap.values())
      .filter(s => s.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10);
  }, []);

  const nunchuckMaster = scoreboardData[0];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-1 rounded-full mb-8 border border-green-100">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Academy Cloud Live</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 uppercase tracking-tighter leading-none">
          {user ? `Oss, ` : 'Train '} 
          <span className="text-orange-500 underline decoration-8 underline-offset-8">
            {user ? user.displayName : 'Karate'}
          </span> 
          <br/>{user ? 'Master Your Form' : 'At Your Own Pace'}
        </h1>
        <p className="text-slate-500 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
          The official digital training portal. Record your moves, get sensei feedback, and climb the ranks!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to={user ? "/lessons" : "/login"} 
            className="w-full sm:w-auto px-12 py-6 bg-orange-500 hover:bg-orange-600 text-white font-black text-2xl rounded-[2rem] transition-all shadow-xl transform hover:-translate-y-1 active:scale-95 uppercase"
          >
            {user ? "Enter Dojo" : "Join Academy"}
          </Link>
          <div className="text-slate-400 font-black text-xs uppercase tracking-widest">
            {user ? `${user.belt} Belt Dashboard` : 'Syllabus for all 10 Belts'}
          </div>
        </div>
      </section>

      {/* Award Section */}
      <section className="bg-slate-900 py-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
          <div className="text-[20rem] font-black text-white italic -rotate-12 leading-none">OSS</div>
        </div>
        
        <div className="max-w-5xl mx-auto px-8 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="text-8xl animate-bounce filter drop-shadow-[0_0_15px_rgba(251,146,60,0.6)]">🪃</div>
          <div className="text-center md:text-left text-white">
            <h2 className="text-4xl font-black text-orange-500 uppercase italic mb-2">Dojo Legend Award</h2>
            <p className="text-lg font-bold mb-6 text-slate-300">Highest performance marks in the Dojo.</p>
            {nunchuckMaster ? (
                <div className="bg-orange-500/20 border-2 border-orange-500/40 p-6 rounded-3xl inline-block backdrop-blur-sm">
                    <p className="text-orange-400 font-black text-[10px] uppercase tracking-widest mb-1">Current Prize Holder:</p>
                    <p className="text-3xl font-black">{nunchuckMaster.displayName} — {nunchuckMaster.totalPoints} Marks</p>
                </div>
            ) : (
                <p className="text-slate-500 font-black italic uppercase tracking-wider">The Dojo throne awaits its first champion...</p>
            )}
          </div>
        </div>
      </section>

      {/* Ranking Scoreboard */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic">Elite Rankings</h2>
          <div className="h-0.5 flex-grow bg-slate-100 rounded-full"></div>
        </div>

        <div className="space-y-6">
          {scoreboardData.length > 0 ? scoreboardData.map((s, idx) => (
            <div key={s.id} className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between transition-all border-4 ${idx === 0 ? 'bg-orange-50 border-orange-500 shadow-2xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-orange-100'}`}>
              <div className="flex items-center gap-8 mb-6 md:mb-0">
                <span className={`text-5xl font-black ${idx === 0 ? 'text-orange-600' : 'text-slate-200'}`}>#{idx + 1}</span>
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-black text-slate-900 leading-none mb-2">{s.displayName}</h3>
                  <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{s.belt} Belt</span>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                <div className="text-right">
                  <p className="text-4xl font-black text-orange-600">{s.totalPoints}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Total Marks Earned</p>
                </div>
                {idx === 0 && <div className="text-6xl animate-pulse">🪃</div>}
              </div>
            </div>
          )) : (
            <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300 font-black text-xl uppercase italic tracking-widest">
              No warrior has ascended the rankings yet. Go record a move!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
