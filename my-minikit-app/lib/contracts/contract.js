import { ethers } from 'ethers';

// TODO: Set your deployed contract address and price feed address here
export const CONTRACT_ADDRESS = '0xbdb4bf6601d54e97fc162a62bc81bc4d82abf705';
export const PRICE_FEED_ADDRESS = '0x694AA1769357215DE4FAC081bf1f309aDC325306';

export const MemeNFT1155_ABI = [
  // Only the relevant parts of the ABI for frontend
  "function ownerAddMeme(string name, string uri)",
  "function addMeme(string name, string uri) payable",
  "function mint(uint256 tokenId, uint256 amount) payable",
  "function memes(uint256 tokenId) view returns (string name, string uri, uint256 totalSupply)",
  "function mintedSupply(uint256 tokenId) view returns (uint256)",
  "function getMintPriceInETH() view returns (uint256)",
  "function withdraw()",
  "function setMemeURI(uint256 tokenId, string uri)",
  "function uri(uint256 tokenId) view returns (string)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
];

export function getMemeContract(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, MemeNFT1155_ABI, signerOrProvider);
} 