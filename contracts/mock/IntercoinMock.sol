// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";

import "../interfaces/IIntercoin.sol";

contract IntercoinMock is IIntercoin {

	function checkInstance(address addr) public override view returns(bool) {
        return true;
    }
    
    function registerInstance(address addr) external override returns(bool) {
        return true;
    }

}