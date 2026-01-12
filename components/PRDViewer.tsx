
import React from 'react';
import { PRD_CONTENT } from '../constants';

interface PRDViewerProps {
  onStart: () => void;
}

const PRDViewer: React.FC<PRDViewerProps> = ({ onStart }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 animate-fade-in bg-zinc-900/50 rounded-2xl border border-zinc-800 my-10 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            {PRD_CONTENT.title}
          </h1>
          <p className="text-zinc-500 mt-2">Version {PRD_CONTENT.version}</p>
        </div>
        <button 
          onClick={onStart}
          className="px-6 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
        >
          Launch App <i className="fa-solid fa-arrow-right ml-2"></i>
        </button>
      </div>

      <div className="space-y-8">
        {PRD_CONTENT.sections.map((section, idx) => (
          <div key={idx} className="border-l-2 border-zinc-800 pl-6">
            <h2 className="text-xl font-semibold text-zinc-200 mb-3">{section.title}</h2>
            {section.content && <p className="text-zinc-400 leading-relaxed">{section.content}</p>}
            {section.items && (
              <ul className="list-disc list-inside text-zinc-400 space-y-2">
                {section.items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PRDViewer;
