'use client';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getMemeContract } from '../../lib/contracts/contract';

export default function MintMeme() {
  const [tokenId, setTokenId] = useState('');
  const [amount, setAmount] = useState(1);
  const [mintPrice, setMintPrice] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    async function fetchPrice() {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = getMemeContract(provider);
        const price = await contract.getMintPriceInETH();
        setMintPrice(ethers.formatEther(price));
      } catch {
        setMintPrice('');
      }
    }
    fetchPrice();
  }, []);

  const handleMint = async (e) => {
    e.preventDefault();
    setStatus('');
    if (!tokenId) return setStatus('Enter meme ID');
    if (amount < 1 || amount > 100) return setStatus('Amount 1-100');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMemeContract(signer);
      const price = await contract.getMintPriceInETH();
      const tx = await contract.mint(tokenId, amount, { value: price * BigInt(amount) });
      setStatus('Minting...');
      await tx.wait();
      setStatus('Success! NFT minted.');
    } catch (err) {
      setStatus('Mint failed. ' + (err?.reason || err?.message || ''));
    }
  };

  return (
    <form className="mint-meme flex flex-col gap-3 p-4 rounded-xl bg-[#23232a] shadow-md w-full max-w-md mx-auto mt-4 mb-6" onSubmit={handleMint}>
      <h2 className="text-lg font-bold text-center text-[#a3e635] mb-2">Mint Meme NFT</h2>
      <input
        type="number"
        min="0"
        max="20"
        placeholder="Meme ID"
        value={tokenId}
        onChange={e => setTokenId(e.target.value)}
        className="mint-input px-4 py-3 rounded-lg text-base bg-[#18181b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
        autoComplete="off"
      />
      <input
        type="number"
        min="1"
        max="100"
        placeholder="Amount"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        className="mint-input px-4 py-3 rounded-lg text-base bg-[#18181b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a3e635]"
        autoComplete="off"
      />
      <button type="submit" className="mint-btn mt-2 py-3 rounded-lg bg-[#a3e635] text-[#18181b] font-bold text-base active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#a3e635]">
        Mint {amount} for {mintPrice ? (Number(mintPrice) * amount).toFixed(5) : '?'} ETH
      </button>
      {status && <div className="mint-status text-center text-sm mt-2 text-[#a3e635] animate-fade-in">{status}</div>}
    </form>
  );
} 