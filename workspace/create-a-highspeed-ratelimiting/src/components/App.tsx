import React, { useState } from 'react';

export const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">🦾 Scavengers App</h1>
      <p className="text-5xl font-mono mb-6">{count}</p>
      <div className="flex gap-4">
        <button onClick={() => setCount(c => c - 1)} className="px-4 py-2 bg-slate-800 rounded-lg">-</button>
        <button onClick={() => setCount(c => c + 1)} className="px-4 py-2 bg-cyan-500 rounded-lg">+</button>
      </div>
    </div>
  );
};