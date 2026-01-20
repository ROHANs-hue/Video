
import React from 'react';
// Fixed: Corrected import extension for consistency
import { getDB } from '../lib/storage.ts';

const LeaderboardPage: React.FC = () => {
  const db = getDB();
  // Fixed: db.results now correctly exists on AppState
  const sortedResults = [...db.results].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.timeSpent - b.timeSpent;
  }).slice(0, 50);

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-20">
        <div className="text-7xl mb-6">🏆</div>
        <h2 className="text-7xl font-black text-slate-900 uppercase italic leading-none">Wall of <span className="text-orange-600">Honor</span></h2>
        <p className="text-slate-400 mt-5 uppercase font-black tracking-[0.4em] text-[10px]">Golden Shoto Elite Rankings</p>
      </div>

      <div className="bg-white border border-orange-100 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(249,115,22,0.1)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-orange-50">
              <th className="px-12 py-8 w-32">Rank</th>
              <th className="px-12 py-8">Karateka</th>
              <th className="px-12 py-8">Belt</th>
              <th className="px-12 py-8 text-center">Mastery</th>
              <th className="px-12 py-8 text-center">Execution</th>
              <th className="px-12 py-8 text-right">Armory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedResults.length > 0 ? (
              sortedResults.map((result, idx) => {
                const student = db.students.find(s => s.username === result.studentName);
                const hasNunchucks = student?.achievements.includes('Nunchucks');
                const isTop3 = idx < 3;
                
                return (
                  <tr key={result.id} className={`group transition-all duration-300 hover:bg-orange-50/50 ${isTop3 ? 'bg-orange-50/20' : ''}`}>
                    <td className="px-12 py-10">
                      <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-2xl transition-transform group-hover:scale-110 ${
                        idx === 0 ? 'bg-orange-600 text-white shadow-xl rotate-3' : 
                        idx === 1 ? 'bg-slate-200 text-slate-700 shadow-lg -rotate-3' :
                        idx === 2 ? 'bg-orange-100 text-orange-800 shadow-md rotate-1' : 'text-slate-300 bg-slate-50'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-12 py-10">
                      <div className="font-black text-slate-900 text-2xl leading-none mb-1 group-hover:text-orange-600 transition-colors">{student?.displayName || result.studentName}</div>
                      <div className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-60">@{result.studentName}</div>
                    </td>
                    <td className="px-12 py-10">
                      <span className="bg-white text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-slate-100 shadow-sm">
                        {result.belt}
                      </span>
                    </td>
                    <td className="px-12 py-10 text-center">
                      <div className={`text-4xl font-black leading-none ${isTop3 ? 'text-orange-600' : 'text-slate-800'}`}>
                        {result.score * 10}<span className="text-sm opacity-50 ml-0.5">%</span>
                      </div>
                    </td>
                    <td className="px-12 py-10 text-center text-slate-400 font-mono font-black text-lg">
                      {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                    </td>
                    <td className="px-12 py-10 text-right">
                      <div className="flex justify-end">
                        {hasNunchucks ? (
                          <div className="relative group/nunchuck">
                            <span className="text-4xl filter drop-shadow-lg cursor-help transition-transform hover:scale-125 block">🪃</span>
                            <div className="absolute bottom-full right-0 mb-2 hidden group-hover/nunchuck:block bg-slate-900 text-white text-[8px] font-black uppercase py-1 px-2 rounded-md whitespace-nowrap">Nunchucks Master</div>
                          </div>
                        ) : (
                          <span className="text-slate-100 font-black text-4xl">∅</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-12 py-40 text-center text-slate-200 font-black uppercase italic tracking-[0.5em] text-2xl">
                  Dojo is Empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardPage;
