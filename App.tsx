
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, Persona } from './types';
import { SAMPLE_PROFESSIONS } from './constants';
import { GeminiService } from './services/geminiService';
import PRDViewer from './components/PRDViewer';
import PersonaCard from './components/PersonaCard';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.PRD);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Refinement State
  const [userProfessions, setUserProfessions] = useState('');
  const [userContext, setUserContext] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gemini = useRef(new GeminiService());
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1080 }, height: { ideal: 1080 } }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setBaseImage(dataUrl);
        stopCamera();
        setAppState(AppState.REFINEMENT);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgData = event.target?.result as string;
        setBaseImage(imgData);
        setAppState(AppState.REFINEMENT);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSampleProfession = (prof: string) => {
    if (userProfessions.includes(prof)) return;
    const current = userProfessions.trim();
    setUserProfessions(current ? `${current}, ${prof}` : prof);
  };

  const startGeneration = async () => {
    if (!baseImage) return;
    setIsRefining(true);
    setLoadingMsg("Refining your input with AI...");
    
    try {
      // 1. Refine input (Autocorrect/Translation)
      const refined = await gemini.current.refineUserInput(userProfessions, userContext);
      setUserProfessions(refined.refinedProfessions.join(', '));
      setUserContext(refined.refinedContext);
      
      // 2. Start Persona Generation
      setAppState(AppState.GENERATING);
      setPersonas([]);
      setIsRefining(false);

      for (let i = 0; i < refined.refinedProfessions.length; i++) {
        const field = refined.refinedProfessions[i];
        setLoadingMsg(`Crafting your "${field}" identity... (${i+1}/10)`);
        setProgress(Math.round(((i) / refined.refinedProfessions.length) * 100));

        const details = await gemini.current.generatePersonaDetails(field, refined.refinedContext);
        const imageUrl = await gemini.current.generatePersonaImage(baseImage, field, refined.refinedContext);

        const newPersona: Persona = {
          id: `${Date.now()}-${i}`,
          jobField: field,
          imageUrl,
          ...details
        };
        
        setPersonas(prev => [...prev, newPersona]);
        if (i === 0) setAppState(AppState.VIEWER);
      }
      setProgress(100);
    } catch (error) {
      console.error(error);
      alert("AI Processing failed. Please try again.");
      setAppState(AppState.REFINEMENT);
      setIsRefining(false);
    }
  };

  return (
    <div className="h-full w-full bg-black text-white font-sans selection:bg-white selection:text-black relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600 blur-[150px] rounded-full"></div>
      </div>

      {appState === AppState.PRD && (
        <div className="h-full overflow-y-auto">
          <PRDViewer onStart={() => setAppState(AppState.UPLOAD)} />
        </div>
      )}

      {appState === AppState.UPLOAD && !isCameraActive && (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center z-10 relative animate-fade-in">
          <div className="mb-8 w-24 h-24 bg-white rounded-3xl rotate-12 flex items-center justify-center text-black text-4xl shadow-2xl shadow-white/20">
            <i className="fa-solid fa-user-ninja"></i>
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
            SHIFT YOUR <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">IDENTITY.</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mb-12">
            Upload or take a portrait to begin your professional transformation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            <button onClick={() => fileInputRef.current?.click()} className="group px-10 py-5 bg-zinc-900 text-white font-bold rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all active:scale-95 shadow-xl">
              <span className="flex items-center gap-3"><i className="fa-solid fa-file-arrow-up text-xl"></i>Upload Photo</span>
            </button>
            <button onClick={startCamera} className="group px-10 py-5 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl">
              <span className="flex items-center gap-3"><i className="fa-solid fa-camera text-xl"></i>Take Photo</span>
            </button>
          </div>
        </div>
      )}

      {appState === AppState.REFINEMENT && (
        <div className="flex flex-col items-center justify-center h-full p-6 z-10 relative animate-fade-in max-w-2xl mx-auto overflow-y-auto">
          <div className="w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 p-8 rounded-3xl shadow-2xl my-10">
            <h2 className="text-3xl font-black mb-2 tracking-tight">Refine Your Vision</h2>
            <p className="text-zinc-400 mb-8">Choose professions or write your own. We'll handle the spelling.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Quick Selection</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {SAMPLE_PROFESSIONS.map((prof) => (
                    <button 
                      key={prof} 
                      onClick={() => addSampleProfession(prof)}
                      className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg border border-zinc-700 transition-colors"
                    >
                      + {prof}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Selected Professions</label>
                <input 
                  value={userProfessions}
                  onChange={(e) => setUserProfessions(e.target.value)}
                  placeholder="e.g. pilot, hacker, surgeon (seperated by commas)"
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 focus:border-blue-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Visual Context</label>
                <textarea 
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  placeholder="e.g. cinematic, neon lights, 80s retro, professional studio..."
                  rows={3}
                  className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-4 focus:border-purple-500 outline-none transition-all placeholder:text-zinc-700 resize-none"
                />
              </div>

              <button 
                onClick={startGeneration}
                disabled={isRefining}
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-2xl shadow-purple-500/20 disabled:opacity-50"
              >
                {isRefining ? 'AI IS CLEANING INPUT...' : 'BEGIN TRANSFORMATION'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCameraActive && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-fade-in">
          <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover sm:max-w-2xl sm:h-auto sm:aspect-square sm:rounded-3xl border border-zinc-800" />
          <div className="absolute bottom-10 flex items-center justify-center gap-8 w-full">
            <button onClick={stopCamera} className="w-16 h-16 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center hover:bg-zinc-800"><i className="fa-solid fa-xmark text-xl"></i></button>
            <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center group"><div className="w-16 h-16 bg-white border-4 border-black rounded-full group-active:scale-90 transition-transform"></div></button>
            <div className="w-16 h-16 opacity-0 pointer-events-none"></div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {appState === AppState.GENERATING && (
        <div className="flex flex-col items-center justify-center h-full p-6 z-10 relative animate-fade-in">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-end mb-4"><h2 className="text-2xl font-bold">Dreaming up your future...</h2><span className="text-zinc-500 font-mono">{progress}%</span></div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
            <div className="mt-8 relative h-32 flex flex-col items-center justify-center overflow-hidden">
                <p className="text-zinc-400 animate-pulse text-center italic px-4">{loadingMsg}</p>
                <div className="mt-4 flex gap-2">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>)}</div>
            </div>
          </div>
        </div>
      )}

      {appState === AppState.VIEWER && (
        <div className="h-full w-full snap-y-mandatory overflow-y-auto hide-scrollbar bg-black animate-fade-in relative z-10" style={{ overscrollBehavior: 'none' }}>
          {personas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
          <div className="fixed top-8 left-8 z-[60]">
            <button onClick={() => { setAppState(AppState.UPLOAD); setPersonas([]); }} className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all shadow-xl"><i className="fa-solid fa-rotate-left"></i></button>
          </div>
          <div className="fixed top-8 right-8 z-[60] flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
            {progress < 100 ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div> : <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">{progress < 100 ? `Generating... (${personas.length}/10)` : 'All Ready'}</span>
          </div>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center pointer-events-none opacity-50">
            <span className="text-xs font-bold uppercase tracking-[0.3em] mb-2">Scroll to explore</span>
            <div className="w-[2px] h-12 bg-gradient-to-b from-white to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
