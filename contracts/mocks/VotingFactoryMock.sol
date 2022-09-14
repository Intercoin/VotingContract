// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "../VotingFactory.sol";
contract VotingFactoryMock is VotingFactory {
    
    constructor(
        address implVotingContract,
        address costManager
    ) 
        VotingFactory(implVotingContract,costManager)
    {

    }

    function registerCustomInstance(address stateContractAddress) public {
        registerInstance(stateContractAddress);
    }
    
}