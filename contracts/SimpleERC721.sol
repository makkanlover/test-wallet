// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract SimpleERC721 is ERC721, Ownable {
    using Strings for uint256;
    
    string private _baseTokenURI;
    uint256 private _tokenIdCounter;
    
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        address owner
    ) ERC721(name, symbol) Ownable(owner) {
        _baseTokenURI = baseTokenURI;
        _tokenIdCounter = 1;
    }
    
    function mint(address to, uint256 tokenId) public onlyOwner {
        _mint(to, tokenId);
    }
    
    function mintNext(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _mint(to, tokenId);
        return tokenId;
    }
    
    function setBaseURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        
        string memory baseURI = _baseURI();
        return bytes(baseURI).length > 0 
            ? string(abi.encodePacked(baseURI, tokenId.toString(), ".json"))
            : "";
    }
}