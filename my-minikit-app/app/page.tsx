'use client';
import React, { useEffect, useState } from 'react';
import MemeList from './components/MemeList';
import AddMeme from './components/AddMeme';
import { ethers } from 'ethers';
import { getMemeContract } from '../lib/contracts/contract';

const MAX_MEMES = 20;

type Meme = {
  id: number;
  name: string;
  uri: string;
  minted: string;
};

function BatchAddMemesButton({ onBatchAdd }: { onBatchAdd?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleBatchAdd = async () => {
    setLoading(true);
    setStatus('');
    try {
      if (!window.ethereum) {
        setStatus('Please install MetaMask or another wallet.');
        setLoading(false);
        return;
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMemeContract(signer);
      for (let i = 0; i < 50; i++) {
        const name = `Meme #${i + 1}`;
        const uri = `https://api.dicebear.com/7.x/thumbs/svg?seed=meme${i + 1}`;
        try {
          const tx = await contract.ownerAddMeme(name, uri);
          setStatus(`Added: ${name} (TX: ${tx.hash})`);
          await tx.wait();
        } catch (err: unknown) {
          let msg = `Failed to add meme ${i + 1}:`;
          if (err && typeof err === 'object') {
            if ('reason' in err && typeof (err as { reason: unknown }).reason === 'string') {
              msg += ' ' + (err as { reason: string }).reason;
            } else if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
              msg += ' ' + (err as { message: string }).message;
            } else {
              msg += ' ' + String(err);
            }
          } else if (typeof err === 'string') {
            msg += ' ' + err;
          }
          setStatus(msg);
          break;
        }
      }
      setStatus('Done!');
      if (onBatchAdd) onBatchAdd();
    } catch (err: unknown) {
      let msg = 'Batch add failed.';
      if (err && typeof err === 'object') {
        if ('reason' in err && typeof (err as { reason: unknown }).reason === 'string') {
          msg += ' ' + (err as { reason: string }).reason;
        } else if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
          msg += ' ' + (err as { message: string }).message;
        } else {
          msg += ' ' + String(err);
        }
      } else if (typeof err === 'string') {
        msg += ' ' + err;
      }
      setStatus(msg);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center my-4">
      <button
        onClick={handleBatchAdd}
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold mt-4 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Adding Memes...' : 'Batch Add 50 Memes (Owner Only)'}
      </button>
      {status && <div className="text-center text-sm mt-2 text-[#a3e635]">{status}</div>}
    </div>
  );
}

export default function App() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  // Fetch memes
  const fetchMemes = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = getMemeContract(provider);
      const memeArr: Meme[] = [];
      for (let i = 0; i < MAX_MEMES; i++) {
        try {
          const meme = await contract.memes(i);
          if (!meme.uri) break;
          const minted = await contract.mintedSupply(i);
          memeArr.push({
            id: i,
            name: meme.name,
            uri: meme.uri,
            minted: minted.toString(),
          });
        } catch {
          break;
        }
      }
      setMemes(memeArr);
    } catch {
      setError('Failed to load memes.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemes();
  }, []);

  // Mint handler for MemeList
  const handleMint = async (tokenId: number, amount: number, closeMint: (v: boolean) => void) => {
    setToast('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = getMemeContract(signer);
      const price = await contract.getMintPriceInETH();
      const tx = await contract.mint(tokenId, amount, { value: price * BigInt(amount) });
      setToast('Minting...');
      await tx.wait();
      setToast('Success! NFT minted.');
      closeMint(false);
      fetchMemes();
    } catch (err: unknown) {
      let msg = 'Mint failed.';
      if (err && typeof err === 'object') {
        if ('reason' in err && typeof (err as { reason: unknown }).reason === 'string') {
          msg += ' ' + (err as { reason: string }).reason;
        } else if ('message' in err && typeof (err as { message: unknown }).message === 'string') {
          msg += ' ' + (err as { message: string }).message;
        } else {
          msg += ' ' + String(err);
        }
      } else if (typeof err === 'string') {
        msg += ' ' + err;
      }
      setToast(msg);
    }
    setTimeout(() => setToast(''), 4000);
  };

  return (
    <div className="app-container min-h-screen flex flex-col bg-[#18181b] text-[#fafafa]">
      <header className="header">
        <h1 className="text-2xl font-extrabold text-center">🧙 Meme NFT Mini App</h1>
        <span className="farcaster-id">by MrRogueKnight</span>
      </header>
      <main className="flex-1 w-full max-w-2xl mx-auto px-2">
        <BatchAddMemesButton onBatchAdd={fetchMemes} />
        <section className="mb-6">
          <AddMeme onAdd={fetchMemes} />
        </section>
        <MemeList memes={memes} loading={loading} error={error ?? undefined} onMint={handleMint} />
      </main>
      <footer className="footer">
        <span>Powered by Base &amp; Farcaster</span>
      </footer>
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#23232a] text-[#a3e635] px-6 py-2 rounded-xl shadow-lg z-50 animate-fade-in">
          {toast}
        </div>
      )}
      <style jsx>{`
        .header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1rem 0 0.5rem 0;
          background: #23232a;
          border-bottom: 2px solid #333;
        }
        .header h1 {
          font-size: 2rem;
          margin: 0;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .farcaster-id {
          font-size: 1rem;
          color: #a3e635;
          margin-top: 0.25rem;
          font-weight: 700;
        }
        .footer {
          text-align: center;
          padding: 0.75rem 0;
          font-size: 0.95rem;
          color: #a1a1aa;
          background: #23232a;
          border-top: 2px solid #333;
          margin-top: 2rem;
        }
        @media (max-width: 600px) {
          .header h1 {
            font-size: 1.3rem;
          }
        }
      `}</style>
    </div>
  );
} 