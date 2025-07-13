'use client';
import React, { useState } from 'react';

export function MemeCard({ meme, onMint }) {
  const [showMint, setShowMint] = useState(false);
  const [amount, setAmount] = useState(1);
  const maxLeft = 100 - Number(meme.minted);

  return (
    <div className="meme-card flex flex-col items-center bg-[#23232a] rounded-xl shadow-md p-3 transition-transform active:scale-95" key={meme.id}>
      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#18181b] rounded-lg mb-2 border border-[#333] overflow-hidden flex items-center justify-center">
        <img
          src={meme.uri}
          alt={meme.name}
          className="meme-img w-full h-full object-cover object-center rounded-lg"
          style={{ display: 'block' }}
        />
      </div>
      <div className="meme-info w-full flex flex-col items-center">
        <div className="meme-name text-base font-bold text-white text-center truncate w-full" title={meme.name}>{meme.name}</div>
        <div className="meme-supply text-xs text-[#a3e635] mt-1">{maxLeft} left</div>
        <button
          className="mt-2 px-4 py-2 rounded-lg bg-[#a3e635] text-[#18181b] font-bold text-sm active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
          onClick={() => setShowMint((v) => !v)}
        >
          Mint
        </button>
        {showMint && (
          <form
            className="flex flex-col items-center gap-2 mt-2 w-full"
            onSubmit={e => {
              e.preventDefault();
              onMint(meme.id, amount, setShowMint);
            }}
          >
            <input
              type="number"
              min={1}
              max={maxLeft}
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded bg-[#18181b] text-white text-sm text-center border border-[#333]"
            />
            <button
              type="submit"
              className="px-3 py-1 rounded bg-[#a3e635] text-[#18181b] font-bold text-xs mt-1"
            >
              Confirm Mint
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MemeList({ memes, loading, error, onMint }) {
  return (
    <section className="w-full max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-center text-[#a3e635] mb-4">All Memes</h2>
      {loading && <div className="text-center text-white">Loading memes...</div>}
      {error && <div className="error text-center text-red-400">{error}</div>}
      {!loading && !error && memes.length === 0 && (
        <div className="text-center text-white">No memes yet. Be the first to add one!</div>
      )}
      <div className="meme-list grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-8">
        {memes.map((meme) => (
          <MemeCard key={meme.id} meme={meme} onMint={onMint} />
        ))}
      </div>
    </section>
  );
} 