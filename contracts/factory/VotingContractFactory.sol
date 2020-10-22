pragma solidity >=0.6.0 <0.7.0;
import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../VotingContract.sol";
import "../ICommunity.sol";

contract VotingContractFactory is Ownable {
    
    VotingContract[] public votingContractAddresses;

    event VotingContractCreated(VotingContract votingContract);
    
     /**
     * @param voteTitle vote title
     * @param blockNumberStart vote will start from `blockNumberStart`
     * @param blockNumberEnd vote will end at `blockNumberEnd`
     * @param voteWindowBlocks period in blocks then we check eligible
     * @param contractAddress contract's address which will call after user vote
     * @param methodName method of contract's address which will call after user vote
     * @param communityAddress address community
     * @param communityRole community role of participants which allowance to vote
     * @param communityFraction fraction mul by 1e6. setup if minimum/memberCount too low
     * @param communityMinimum community minimum
     */
    function createVotingContract (
        string memory voteTitle,
        uint256 blockNumberStart,
        uint256 blockNumberEnd,
        uint256 voteWindowBlocks,
        address contractAddress,
        string memory methodName,
        ICommunity communityAddress,
        string memory communityRole,
        uint256 communityFraction,
        uint256 communityMinimum
    ) 
        public
    {
        VotingContract votingContract = new VotingContract(
            voteTitle,
            blockNumberStart,
            blockNumberEnd,
            voteWindowBlocks,
            contractAddress,
            methodName,
            communityAddress,
            communityRole,
            communityFraction,
            communityMinimum
        );
        votingContractAddresses.push(votingContract);
        emit VotingContractCreated(votingContract);
        votingContract.transferOwnership(_msgSender());  
    }
    
}