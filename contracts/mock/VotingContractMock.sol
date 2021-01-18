pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "../VotingContract.sol";
import "../interfaces/ICommunity.sol";

contract VotingContractMock is VotingContract {
   
    function setCommunityFraction(uint256 _communityFraction) public {
        voteData.communityFraction = _communityFraction;
    }
    
}