
import React from 'react';
import { Persona } from '../types';

interface PersonaCardProps {
  persona: Persona;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona }) => {
  return (
    <div className="snap-start h-screen w-full relative flex flex-col bg-[#050505] overflow-hidden group">
      {/* 1. Top Section: The Portrait (Visual Zone) */}
      <div className="relative h-[65%] w-full flex items-center justify-center bg-black overflow-hidden">
        {/* Subtle background glow based on the image */}
        {persona.imageUrl && (
          <div 
            className="absolute inset-0 w-full h-full scale-125 blur-[100px] opacity-20 pointer-events-none"
            style={{ 
              backgroundImage: `url(${persona.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}

        {/* The Actual Photo - Using object-contain and padding to ensure NO cropping/overlap on the face */}
        {persona.imageUrl ? (
          <div className="relative h-full w-full p-4 flex items-center justify-center">
            <img 
              src={persona.imageUrl} 
              alt={persona.title} 
              className="max-h-full max-w-full object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-48 h-48 bg-zinc-900 rounded-full flex items-center justify-center animate-pulse">
            <i className="fa-solid fa-user-circle text-6xl text-zinc-800"></i>
          </div>
        )}

        {/* Film Grain Overlay for realism */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      {/* 2. Bottom Section: The Dossier (Information Zone) */}
      <div className="h-[35%] w-full bg-gradient-to-b from-[#0a0a0a] to-black border-t border-white/5 relative z-10 p-6 md:px-16 md:py-10 flex flex-col justify-between">
        
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">
                Identity Verified
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                // Sector: {persona.jobField}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-none">
              {persona.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
             <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-300 backdrop-blur-md">
               {persona.personality}
             </span>
          </div>
        </div>

        {/* Body content */}
        <div className="flex flex-col md:flex-row gap-8 mt-4 md:mt-0">
          <p className="flex-1 text-sm md:text-base text-zinc-400 leading-relaxed max-w-xl">
            {persona.bio}
          </p>

          <div className="flex flex-wrap gap-2 items-center md:justify-end md:max-w-xs">
            {persona.skills.map((skill, idx) => (
              <span 
                key={idx} 
                className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer subtle detail */}
        <div className="hidden md:flex items-center justify-between text-[10px] text-zinc-600 font-mono pt-4 border-t border-white/5">
          <span>PORTFOLIO ID: {persona.id.slice(-8).toUpperCase()}</span>
          <span>© 2024 PERSONASHIFT ANALYTICS</span>
        </div>
      </div>

      {/* Side "Slide Indicator" */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
         <div className="w-1 h-12 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-full h-1/2 bg-blue-500"></div>
         </div>
      </div>
    </div>
  );
};

export default PersonaCard;
