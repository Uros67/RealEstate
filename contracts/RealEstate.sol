//SPDX-License-Identifier: UNLINCESED

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstateNFT is ERC721URIStorage {
    uint256 private _tokenId;

    constructor() ERC721("RealEstate", "REAL") {}

    event Minted(address ownerOfNft, uint256 nftId, string tokenUri);

    function mint(string memory tokenURI) public {
        _tokenId++;

        uint256 newTokenId = _tokenId;
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit Minted(msg.sender, newTokenId, tokenURI);


    }
    function totalSuply() public view returns(uint256){
        return _tokenId;
    }
}
