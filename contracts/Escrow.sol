//SPDX-License-Identifier: UNLINCESED

pragma solidity ^0.8.9;

import "./interfaces/IERC721.sol";

contract Escrow {
    address public s_nftAddress;
    address public s_seller;
    address public s_lender;
    address public s_inspector;


    constructor(
        address _nftAddress,
        address _seller,
        address _lender,
        address _inspector
    ) {
        s_nftAddress = _nftAddress;
        s_seller = _seller;
        s_lender = _lender;
        s_inspector = _inspector;
    }

    mapping (uint256 => uint256) s_balance;
    mapping(uint256 => bool) public s_isListed;
    mapping(uint256 => uint128) public s_purchasePrice;
    mapping(uint256 => uint128) public s_escrowAmount;
    mapping(uint256 => bool) public s_inspectionPassed;
    mapping(uint256 => address) public s_buyer;
    mapping(uint256 => mapping(address => bool)) public s_approval;


    function list(
        uint256 _nftId,
        address _buyer,
        uint128 _purchasePrice,
        uint128 _escrowAmount
    
    ) external payable {
        require(msg.sender == s_seller, "Only seller can call this func");
        IERC721(s_nftAddress).transferFrom(s_seller, address(this), _nftId);
        s_isListed[_nftId] = true;
        s_purchasePrice[_nftId] = _purchasePrice;
        s_escrowAmount[_nftId] = _escrowAmount;
        s_buyer[_nftId] = _buyer;
        
    }

    function depositEarnest(uint256 _nftID) external payable {
        require(msg.sender == s_buyer[_nftID], "Only buyer can call this func");
        require(msg.value >= s_escrowAmount[_nftID], "Amount is to little");
    }
    function updateInspectionStatus(uint256 _nftID, bool _passed) external{
        require(msg.sender== s_inspector, "Only inspector can call this func");
        s_inspectionPassed[_nftID] = _passed;
    }
    function approveSale(uint256 _nftID) external {
        s_approval[_nftID][msg.sender] = true;
    }
     function finalizeSale(uint256 _nftID) external {
        require(s_inspectionPassed[_nftID]);
        require(s_approval[_nftID][s_buyer[_nftID]]);
        require(s_approval[_nftID][s_seller]);
        require(s_approval[_nftID][s_lender]);
        require(address(this).balance >= s_purchasePrice[_nftID]);

        s_isListed[_nftID] = false;

        (bool success, ) = payable(s_seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        IERC721(s_nftAddress).transferFrom(address(this), s_buyer[_nftID], _nftID);
    }
    function cancelSale(uint256 _nftID) external {
        if (s_inspectionPassed[_nftID] == false) {
            payable(s_buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(s_seller).transfer(address(this).balance);
        }
    }

    receive() external payable {}

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
