'use client';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { getMemeContract } from '../../lib/contracts/contract';

export default function AddMeme({ onAdd }) {
  const [name, setName] = useState('');
  const [uri, setUri] = useState('');
  const [status, setStatus] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!name || !uri) return setStatus('Enter name and image URL');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMemeContract(signer);
      // Try ownerAddMeme first (if owner), else fallback to addMeme with payment
      try {
        const tx = await contract.ownerAddMeme(name, uri);
        setStatus('Adding meme...');
        await tx.wait();
        setStatus('Meme added (owner).');
      } catch {
        // Not owner, use addMeme with payment
        const price = await contract.getMintPriceInETH();
        const tx = await contract.addMeme(name, uri, { value: price });
        setStatus('Adding meme...');
        await tx.wait();
        setStatus('Meme added!');
      }
      setName('');
      setUri('');
      if (onAdd) onAdd();
    } catch (err) {
      setStatus('Add failed. ' + (err?.reason || err?.message || ''));
    }
  };

  return (
    <form className="add-meme flex flex-col gap-3 p-4 rounded-xl bg-[#23232a] shadow-md w-full max-w-md mx-auto mt-4 mb-6" onSubmit={handleAdd}>
      <h2 className="text-lg font-bold text-center text-[#a3e635] mb-2">Add Meme</h2>
      <input
        type="text"
        placeholder="Meme Name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="add-input px-4 py-3 rounded-lg text-base bg-[#18181b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
        autoComplete="off"
      />
      <input
        type="url"
        placeholder="Image URL (https://...)"
        value={uri}
        onChange={e => setUri(e.target.value)}
        className="add-input px-4 py-3 rounded-lg text-base bg-[#18181b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
        autoComplete="off"
      />
      <button type="submit" className="add-btn mt-2 py-3 rounded-lg bg-[#a3e635] text-[#18181b] font-bold text-base active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#a3e635]">
        Add Meme
      </button>
      {status && <div className="add-status text-center text-sm mt-2 text-[#a3e635] animate-fade-in">{status}</div>}
    </form>
  );
} 