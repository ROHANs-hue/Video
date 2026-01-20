
import React, { useState } from 'react';
import { Belt, AppState, Lesson, PracticeSubmission } from '../types.ts';
import { getDB, saveDB, addLesson } from '../lib/storage.ts';
import { BELTS } from '../constants.ts';

const TrainerPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'review' | 'students'>('lessons');
  const [db, setDb] = useState<AppState>(getDB());
  const [selectedBelt, setSelectedBelt] = useState<Belt>(Belt.WHITE);
  
  // Lesson Form
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');

  // Marking
  const [markingScore, setMarkingScore] = useState<number>(10);
  const [markingFeedback, setMarkingFeedback] = useState('');

  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle || !lessonVideo) return;
    const newL: Lesson = {
      id: Math.random().toString(36).substr(2, 9),
      belt: selectedBelt,
      title: lessonTitle,
      videoUrl: lessonVideo,
      description: lessonDesc
    };
    addLesson(newL);
    setDb(getDB());
    setLessonTitle(''); setLessonVideo(''); setLessonDesc('');
  };

  const markSubmission = (id: string) => {
    const updated = db.submissions.map(s => s.id === id ? { 
        ...s, 
        status: 'Approved' as const, 
        score: markingScore,
        feedback: markingFeedback 
    } : s);
    const newState = { ...db, submissions: updated };
    saveDB(newState);
    setDb(newState);
    setMarkingFeedback('');
    alert("Evaluation saved to Dojo Cloud!");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <div>
            <h2 className="text-4xl font-black text-slate-900 uppercase italic leading-none">Sensei Dashboard</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Dojo Cloud Status: Connected</p>
          </div>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {['lessons', 'review', 'students'].map(t => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === t ? 'bg-orange-500 text-white shadow-lg' : 'text-slate-500'}`}>{t}</button>
          ))}
        </div>
      </div>

      {activeTab === 'lessons' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
           <div className="bg-white p-10 rounded-[3rem] border-2 border-orange-100 shadow-xl h-fit">
              <h3 className="text-2xl font-black text-slate-900 uppercase mb-8">Training Modules</h3>
              <form onSubmit={handleAddLesson} className="space-y-5">
                <select value={selectedBelt} onChange={(e) => setSelectedBelt(e.target.value as Belt)} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-black uppercase text-xs">
                  {BELTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Technique Name" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" />
                <input value={lessonVideo} onChange={(e) => setLessonVideo(e.target.value)} placeholder="YouTube Embed URL" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold" />
                <textarea value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} placeholder="Sensei's advice..." className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-bold h-32" />
                <button type="submit" className="w-full bg-orange-500 text-white font-black py-5 rounded-2xl uppercase shadow-lg">Save to Syllabus</button>
              </form>
           </div>
           <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-black uppercase px-4">Managed Syllabus: {selectedBelt}</h3>
              {db.lessons.filter(l => l.belt === selectedBelt).map(l => (
                <div key={l.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[10px] font-black uppercase">Video</div>
                    <div>
                      <p className="font-black text-slate-800 text-xl">{l.title}</p>
                    </div>
                  </div>
                  <button onClick={() => { const n = { ...db, lessons: db.lessons.filter(x => x.id !== l.id) }; saveDB(n); setDb(n); }} className="text-red-400 font-black text-xs px-6">DELETE</button>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'review' && (
        <div className="space-y-8">
          <h3 className="text-3xl font-black uppercase text-slate-900">Student Evaluations</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {db.submissions.slice().reverse().map(sub => (
              <div key={sub.id} className="bg-white p-10 rounded-[3.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h4 className="text-3xl font-black text-slate-900">{sub.studentName}</h4>
                    <p className="text-orange-500 font-black text-xs uppercase tracking-widest">{sub.lessonTitle}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Recorded: {new Date(sub.timestamp).toLocaleString()}</p>
                  </div>
                  <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase ${sub.score ? 'bg-green-500 text-white' : 'bg-orange-100 text-orange-600'}`}>
                    {sub.score ? `Graded: ${sub.score}/10` : 'Awaiting Grading'}
                  </div>
                </div>
                <video src={sub.videoBlobUrl} controls className="w-full aspect-video rounded-[2rem] bg-black mb-10 shadow-lg"></video>
                
                <div className="bg-slate-50 p-8 rounded-[2.5rem] space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Mastery Level (1-10)</label>
                        <div className="flex gap-3 flex-wrap">
                            {[1,2,3,4,5,6,7,8,9,10].map(m => (
                                <button key={m} onClick={() => setMarkingScore(m)} className={`w-12 h-12 rounded-xl font-black transition-all ${markingScore === m ? 'bg-orange-500 text-white scale-110 shadow-lg' : 'bg-white text-slate-400 hover:bg-slate-200'}`}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest">Sensei Feedback</label>
                        <textarea value={markingFeedback} onChange={(e) => setMarkingFeedback(e.target.value)} placeholder="Advice..." className="w-full p-4 rounded-2xl bg-white border border-slate-200 font-bold text-sm h-24" />
                    </div>
                    <button onClick={() => markSubmission(sub.id)} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase text-sm hover:bg-orange-600 transition-all shadow-xl">
                        Submit Evaluation
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-[3rem] border border-orange-100 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                <th className="p-10">Karateka</th>
                <th className="p-10">Belt</th>
                <th className="p-10 text-center">Cloud Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {db.students.map(s => (
                <tr key={s.id} className="hover:bg-orange-50/50 transition-colors">
                  <td className="p-10 font-black text-slate-900 text-xl">{s.displayName} <span className="text-xs text-slate-300 ml-2">(@{s.username})</span></td>
                  <td className="p-10"><span className="bg-orange-100 text-orange-800 px-5 py-1.5 rounded-full text-[10px] font-black uppercase">{s.belt}</span></td>
                  <td className="p-10 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Active</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TrainerPortal;
