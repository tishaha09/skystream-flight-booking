import React, { useState, useEffect } from "react";

export const Loading = ({
  message = "Preparing your journey...",
  fullScreen = false,
}) => {
  const [activePhrase, setActivePhrase] = useState(message);

  const travelPhrases = [
    "Preparing your journey...",
    "Scanning commercial flight corridors...",
    "Checking real-time seat availability...",
    "Optimizing direct flight routes...",
    "Connecting with SkyStream airspace...",
  ];

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % travelPhrases.length;
      setActivePhrase(travelPhrases[index]);
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      {/* Animated Flight Path Spinner */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-sky-100"></div>
        <div className="absolute inset-0 rounded-full border-2 border-sky-600 border-t-transparent animate-spin"></div>
        <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
          <svg className="w-4 h-4 transform -rotate-45" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-bold text-slate-800 tracking-wide">
          {message}
        </h4>
        <p className="text-xs text-slate-500 font-medium transition-all duration-300">
          {activePhrase}
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default Loading;
