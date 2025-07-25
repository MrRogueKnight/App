// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemeNFT1155 is ERC1155, ERC2981 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    address public constant OWNER = 0x58ad103D0C0E69250CaC89Ddf0BDaD396914C411;
    uint256 public constant MINT_PRICE_USD = 25e16; // $0.25 in 18 decimals (0.25 * 1e18)
    uint96 public constant ROYALTY_FEE_NUMERATOR = 500; // 5% (500 basis points)
    uint256 public constant MAX_SUPPLY_PER_MEME = 100;

    // Mapping from tokenId to meme metadata
    struct Meme {
        string name;
        string uri;
        uint256 totalSupply;
    }
    mapping(uint256 => Meme) public memes;

    // Mapping from tokenId to minted supply
    mapping(uint256 => uint256) public mintedSupply;

    // ETH/USD price feed address (Chainlink)
    address public priceFeed;

    // Accumulated fees
    uint256 public collectedFees;

    event MemeCreated(
        uint256 indexed tokenId,
        string name,
        string uri,
        address indexed creator
    );
    event MemeMinted(
        uint256 indexed tokenId,
        address indexed minter,
        uint256 amount
    );

    constructor(address _priceFeed) ERC1155("") {
        priceFeed = _priceFeed;
        _setDefaultRoyalty(OWNER, ROYALTY_FEE_NUMERATOR);
    }

    // Helper to get latest ETH/USD price from Chainlink
    function getLatestETHPrice() public view returns (uint256) {
        (, int256 price, , , ) = AggregatorV3Interface(priceFeed)
            .latestRoundData();
        // price is 8 decimals, convert to 18 decimals
        return uint256(price) * 1e10;
    }

    // Calculate mint price in ETH based on $0.25
    function getMintPriceInETH() public view returns (uint256) {
        uint256 ethPrice = getLatestETHPrice();
        // $0.25 * 1e18 / ethPrice
        return (MINT_PRICE_USD * 1e18) / ethPrice;
    }

    // Owner can add new meme for free
    function ownerAddMeme(string memory name, string memory memeUri) external {
        require(msg.sender == OWNER, "Only owner");
        _addMeme(name, memeUri, msg.sender);
    }

    // Anyone else can add meme for a fee
    function addMeme(
        string memory name,
        string memory memeUri
    ) external payable {
        require(msg.value >= getMintPriceInETH(), "Insufficient fee");
        collectedFees += msg.value;
        _addMeme(name, memeUri, msg.sender);
    }

    function _addMeme(
        string memory name,
        string memory memeUri,
        address creator
    ) internal {
        uint256 tokenId = _tokenIdCounter.current();
        memes[tokenId] = Meme(name, memeUri, 0);
        _tokenIdCounter.increment();
        emit MemeCreated(tokenId, name, memeUri, creator);
    }

    // Mint meme NFT
    function mint(uint256 tokenId, uint256 amount) external payable {
        require(bytes(memes[tokenId].uri).length != 0, "Meme does not exist");
        require(
            mintedSupply[tokenId] + amount <= MAX_SUPPLY_PER_MEME,
            "Exceeds max supply"
        );
        require(
            msg.value >= getMintPriceInETH() * amount,
            "Insufficient ETH sent"
        );
        mintedSupply[tokenId] += amount;
        collectedFees += msg.value;
        _mint(msg.sender, tokenId, amount, "");
        emit MemeMinted(tokenId, msg.sender, amount);
    }

    // Withdraw collected fees
    function withdraw() external {
        require(msg.sender == OWNER, "Only owner");
        uint256 amount = collectedFees;
        collectedFees = 0;
        (bool sent, ) = OWNER.call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    // Set URI for a meme (owner only)
    function setMemeURI(uint256 tokenId, string memory memeUri) external {
        require(msg.sender == OWNER, "Only owner");
        require(bytes(memes[tokenId].uri).length != 0, "Meme does not exist");
        memes[tokenId].uri = memeUri;
    }

    // ERC-1155 URI override
    function uri(uint256 tokenId) public view override returns (string memory) {
        return memes[tokenId].uri;
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC1155, ERC2981) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// Chainlink AggregatorV3Interface
interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
