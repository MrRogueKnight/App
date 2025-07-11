# Meme NFT Farcaster Mini App

A super-fast, meme-friendly NFT minting mini app for Farcaster, built with React, Vite, and ethers.js.

## Features
- Mint meme NFTs (ERC-1155) on Base for $0.25 in ETH
- Add new memes (owner free, others pay $0.25)
- Max 100 supply per meme
- 5% royalties to owner
- Ultra-fast, mobile-first, iframe-safe

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure contract:**
   - Deploy the `MemeNFT1155.sol` contract to Base (see below)
   - Set your contract address and Chainlink price feed address in `src/utils/contract.js`

3. **Run locally:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

## Contract Deployment
- Deploy `MemeNFT1155.sol` to Base using Remix or Hardhat.
- Use the Base ETH/USD Chainlink price feed address (see Chainlink docs for latest address).
- The owner address is hardcoded to `0x58ad103D0C0E69250CaC89Ddf0BDaD396914C411`.

## Farcaster Integration
- Deploy your frontend (e.g., Vercel, Netlify).
- Share your app link in a Farcaster cast or channel.
- The app is optimized for iframe embedding and mobile use.

## Customization
- Update meme styles, colors, and branding in `src/App.css` and components.
- Your Farcaster handle (MrRogueKnight) is shown in the UI for trust.

---

Enjoy your fast, meme-powered Farcaster mini app! 