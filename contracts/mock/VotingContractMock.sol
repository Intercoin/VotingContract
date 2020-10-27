pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "../VotingContract.sol";
import "../ICommunity.sol";

contract VotingContractMock is VotingContract {
   
    
    /**
     * @param voteTitle vote title
     * @param blockNumberStart vote will start from `blockNumberStart`
     * @param blockNumberEnd vote will end at `blockNumberEnd`
     * @param voteWindowBlocks period in blocks then we check eligible
     * @param contractAddress contract's address which will call after user vote
     * @param communityAddress address community
     * @param communityRole community role of participants which allowance to vote
     * @param communityFraction fraction mul by 1e6. setup if minimum/memberCount too low
     * @param communityMinimum community minimum
     */
    constructor
    (
        string memory voteTitle,
        uint256 blockNumberStart,
        uint256 blockNumberEnd,
        uint256 voteWindowBlocks,
        address contractAddress,
        ICommunity communityAddress,
        string memory communityRole,
        uint256 communityFraction,
        uint256 communityMinimum
    )
        public 
        VotingContract(voteTitle, blockNumberStart, blockNumberEnd, voteWindowBlocks, contractAddress, communityAddress, communityRole, communityFraction, communityMinimum)
    {
    }
  
    function setCommunityFraction(uint256 _communityFraction) public {
        voteData.communityFraction = _communityFraction;
    }
    
}