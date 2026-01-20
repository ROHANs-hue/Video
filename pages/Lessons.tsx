
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDB, addSubmission } from '../lib/storage.ts';
import { Student, Lesson, PracticeSubmission } from '../types.ts';

interface Props {
  user: Student;
}

const Lessons: React.FC<Props> = ({ user }) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [submissions, setSubmissions] = useState<PracticeSubmission[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const db = getDB();
    setLessons(db.lessons.filter(l => l.belt === user.belt));
    setSubmissions(db.submissions.filter(s => s.studentId === user.id));
  }, [user]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedUrl(URL.createObjectURL(blob));
        chunksRef.current = [];
      };
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      mediaRecorder.start();
    } catch (err) {
      alert("Please allow camera access to record your movement.");
    }
  };

  const stopCamera = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
    setIsRecording(false);
  };

  const submitVideo = () => {
    if (!recordedUrl || !activeLesson) return;
    const newSub: PracticeSubmission = {
      id: Math.random().toString(36).substr(2, 9),
      studentId: user.id,
      studentName: user.username,
      lessonId: activeLesson.id,
      lessonTitle: activeLesson.title,
      videoBlobUrl: recordedUrl,
      timestamp: Date.now(),
      status: 'Pending'
    };
    addSubmission(newSub);
    alert("Practice submitted! Sensei will give you marks soon.");
    setShowRecorder(false);
    setRecordedUrl(null);
    const db = getDB();
    setSubmissions(db.submissions.filter(s => s.studentId === user.id));
  };

  const currentSubmission = activeLesson ? submissions.find(s => s.lessonId === activeLesson.id) : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12 flex justify-between items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase italic">Practice <span className="text-orange-500">Room</span></h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">Earn up to 10 marks per lesson</p>
        </div>
        <button onClick={() => navigate('/')} className="bg-slate-100 text-slate-400 px-6 py-2 rounded-xl text-xs font-black uppercase">Back to Home</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-800 uppercase mb-4">Your Lessons</h3>
          {lessons.length > 0 ? lessons.map(l => {
              const sub = submissions.find(s => s.lessonId === l.id);
              return (
                <button 
                  key={l.id} 
                  onClick={() => { setActiveLesson(l); setShowRecorder(false); }}
                  className={`w-full p-6 rounded-[2rem] text-left border-4 transition-all relative group ${activeLesson?.id === l.id ? 'bg-orange-500 border-orange-500 text-white shadow-xl' : 'bg-white border-slate-50 hover:border-orange-100 text-slate-700'}`}
                >
                  <p className="text-[10px] font-black uppercase opacity-60 mb-1">Technique</p>
                  <p className="text-lg font-black uppercase leading-tight">{l.title}</p>
                  {sub && (
                      <div className="mt-4 flex flex-col gap-1">
                        <div className={`inline-block w-fit text-[10px] font-black px-2 py-0.5 rounded-full ${sub.score ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {sub.score ? `${sub.score}/10 Marks` : 'Awaiting Grading'}
                        </div>
                        <div className="text-[8px] font-bold uppercase text-slate-400 mt-1">
                          Last Record: {new Date(sub.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                  )}
                </button>
              );
          }) : (
            <div className="p-12 bg-slate-50 rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center text-slate-400 font-bold italic">
              No lessons added yet for your belt.
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          {activeLesson ? (
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-8 md:p-12">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-3xl font-black text-slate-900 uppercase">{activeLesson.title}</h4>
                  <p className="text-slate-500 text-lg">{activeLesson.description}</p>
                  {currentSubmission && (
                    <div className="mt-2 text-xs font-black text-orange-400 uppercase tracking-widest">
                      Recording: {new Date(currentSubmission.timestamp).toLocaleString()}
                    </div>
                  )}
                </div>
                {currentSubmission?.score && (
                  <div className="bg-orange-50 border-2 border-orange-500 p-4 rounded-3xl text-center min-w-[100px]">
                    <p className="text-[10px] font-black text-orange-600 uppercase">Sensei Marks</p>
                    <p className="text-4xl font-black text-orange-600">{currentSubmission.score}<span className="text-sm">/10</span></p>
                  </div>
                )}
              </div>
              
              <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden mb-8 border-4 border-slate-100 shadow-inner">
                <iframe className="w-full h-full" src={activeLesson.videoUrl} title="Lesson Video" frameBorder="0" allowFullScreen></iframe>
              </div>

              {currentSubmission?.feedback && (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 mb-8">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sensei's Feedback</p>
                      <p className="font-bold text-slate-700 italic">"{currentSubmission.feedback}"</p>
                  </div>
              )}

              {!showRecorder ? (
                <button 
                  onClick={() => setShowRecorder(true)}
                  className="w-full bg-slate-900 text-white py-6 rounded-[1.5rem] font-black uppercase text-xl hover:bg-orange-600 transition-all shadow-xl"
                >
                  {currentSubmission ? 'Record Practice Again! 📹' : 'Watch & Record Your Practice! 📹'}
                </button>
              ) : (
                <div className="space-y-6">
                  <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden relative border-4 border-slate-900 shadow-inner">
                    {!recordedUrl ? (
                      <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline></video>
                    ) : (
                      <video src={recordedUrl} className="w-full h-full object-cover" controls autoPlay></video>
                    )}
                    {isRecording && <div className="absolute top-8 right-8 flex items-center gap-3 bg-red-600 px-6 py-2.5 rounded-full text-white font-black text-sm animate-pulse">● RECORDING</div>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {!recordedUrl ? (
                      !isRecording ? (
                        <button onClick={startCamera} className="col-span-2 bg-red-600 text-white py-6 rounded-3xl font-black uppercase text-lg shadow-lg">Start Recording</button>
                      ) : (
                        <button onClick={stopCamera} className="col-span-2 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-lg shadow-lg">Finish Recording</button>
                      )
                    ) : (
                      <>
                        <button onClick={() => setRecordedUrl(null)} className="bg-slate-100 text-slate-500 py-6 rounded-3xl font-black uppercase text-lg">Retake Video</button>
                        <button onClick={submitVideo} className="bg-orange-500 text-white py-6 rounded-3xl font-black uppercase text-lg shadow-lg">Submit to Dojo</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-20 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-100 text-slate-300">
              <p className="text-2xl font-black uppercase italic tracking-widest text-center">Select a lesson to start</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lessons;
