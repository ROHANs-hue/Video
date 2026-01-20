
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Fixed: Corrected import extensions for consistency and resolution
import { Student, Question } from '../types.ts';
import { getDB, addResult } from '../lib/storage.ts';
import { QUIZ_QUESTION_COUNT, QUIZ_TIME_LIMIT_SECONDS } from '../constants.ts';

interface Props {
  user: Student;
}

const Quiz: React.FC<Props> = ({ user }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME_LIMIT_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDB();
    // Fixed: db.questions now correctly exists on AppState
    let pool = db.questions.filter(q => q.belt === user.belt);
    if (pool.length === 0) {
      setQuestions([]);
      return;
    }
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, QUIZ_QUESTION_COUNT));
  }, [user]);

  useEffect(() => {
    if (isFinished || timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isFinished]);

  const handleSelect = (idx: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentIndex] = idx;
    setSelectedAnswers(newAnswers);
    // Auto-advance after a brief moment for easier UX
    setTimeout(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            finishQuiz();
        }
    }, 400);
  };

  const finishQuiz = () => {
    if (isFinished) return;
    setIsFinished(true);
    const timeSpent = QUIZ_TIME_LIMIT_SECONDS - timeLeft;
    const finalAnswers = questions.map((q, idx) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[idx],
      isCorrect: selectedAnswers[idx] === q.correctAnswerIndex
    }));
    const score = finalAnswers.filter(a => a.isCorrect).length;
    addResult({
      id: Math.random().toString(36).substr(2, 9),
      studentName: user.username,
      belt: user.belt,
      score,
      totalQuestions: questions.length,
      timeSpent,
      timestamp: Date.now(),
      answers: finalAnswers
    });
  };

  if (questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-12 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100">
        <h2 className="text-3xl font-black mb-4">Quiz Not Ready</h2>
        <p className="text-slate-500 text-lg mb-8">Ask your Sensei to add questions for the <span className="text-orange-500">{user.belt}</span> belt.</p>
        <button onClick={() => navigate('/')} className="bg-orange-500 text-white px-10 py-4 rounded-2xl font-black uppercase shadow-lg">Go Back</button>
      </div>
    );
  }

  if (isFinished) {
    const score = selectedAnswers.reduce((acc, curr, idx) => acc + (curr === questions[idx].correctAnswerIndex ? 1 : 0), 0);
    const timeSpent = QUIZ_TIME_LIMIT_SECONDS - timeLeft;
    const isMaster = score >= 9 && timeSpent < 180;

    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-white">
        <div className={`w-full max-w-2xl text-center p-12 rounded-[3.5rem] transition-all duration-1000 ${isMaster ? 'bg-orange-gradient text-white shadow-[0_40px_100px_-15px_rgba(249,115,22,0.4)]' : 'bg-white border-4 border-slate-100 text-slate-900'}`}>
          {isMaster ? (
            <div className="animate-in zoom-in duration-700">
               <div className="text-9xl mb-8 filter drop-shadow-2xl">🪃</div>
               <h2 className="text-6xl font-black mb-4 uppercase italic leading-none tracking-tighter">You Won!</h2>
               <div className="inline-block bg-white/20 px-6 py-2 rounded-full font-black text-sm uppercase mb-10 tracking-[0.3em]">NUNCHUCK AWARD EARNED</div>
               <p className="text-2xl font-bold mb-12 opacity-90 italic">Excellent speed and accuracy, Student!</p>
            </div>
          ) : (
            <div>
               <div className="text-8xl mb-6">🥋</div>
               <h2 className="text-5xl font-black mb-8 uppercase italic">Great Effort!</h2>
            </div>
          )}

          <div className={`grid grid-cols-2 gap-6 mb-12 ${isMaster ? 'text-white' : 'text-slate-900'}`}>
             <div className={`${isMaster ? 'bg-white/10' : 'bg-slate-50'} p-8 rounded-[2rem] border ${isMaster ? 'border-white/20' : 'border-slate-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Final Score</p>
                <p className="text-5xl font-black">{score}/10</p>
             </div>
             <div className={`${isMaster ? 'bg-white/10' : 'bg-slate-50'} p-8 rounded-[2rem] border ${isMaster ? 'border-white/20' : 'border-slate-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-70">Speed</p>
                <p className="text-5xl font-black">{Math.floor(timeSpent/60)}:{(timeSpent%60).toString().padStart(2, '0')}</p>
             </div>
          </div>

          <button onClick={() => navigate('/')} className={`w-full py-6 rounded-[1.5rem] font-black uppercase text-xl transition-all active:scale-95 ${isMaster ? 'bg-white text-orange-600' : 'bg-slate-900 text-white'}`}>
            Return to Dojo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase italic tracking-widest">{user.belt} Belt</span>
          <h2 className="text-slate-400 font-black text-xs uppercase mt-3 tracking-widest">Question {currentIndex + 1} of 10</h2>
        </div>
        <div className="text-4xl font-black text-orange-500 font-mono">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
           <div className="h-full bg-orange-500 transition-all duration-500" style={{width: `${((currentIndex + 1)/10)*100}%`}} />
        </div>

        <h3 className="text-3xl font-bold text-slate-800 mb-12 leading-tight">{questions[currentIndex].text}</h3>
        
        <div className="space-y-4">
          {questions[currentIndex].options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full p-6 rounded-3xl text-left font-bold text-lg transition-all border-4 flex items-center gap-6 ${
                selectedAnswers[currentIndex] === i 
                  ? 'bg-orange-500 border-orange-500 text-white' 
                  : 'bg-slate-50 border-slate-50 hover:border-orange-200 text-slate-700'
              }`}
            >
              <span className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm ${selectedAnswers[currentIndex] === i ? 'bg-white/20 text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                {String.fromCharCode(65+i)}
              </span>
              {opt}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center mt-12 text-slate-400 font-bold italic">Tip: Click your answer to move to the next question!</p>
    </div>
  );
};

export default Quiz;
