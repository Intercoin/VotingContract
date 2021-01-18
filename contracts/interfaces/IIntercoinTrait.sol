// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;

interface IIntercoinTrait {
    
    function setIntercoinAddress(address addr) external returns(bool);
    function getIntercoinAddress() external view returns (address);
    
}