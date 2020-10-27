pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;


import "./openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

import "./openzeppelin-contracts/contracts/math/SafeMath.sol";
import "./openzeppelin-contracts/contracts/utils/Address.sol";
import "./openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import "./openzeppelin-contracts/contracts/access/Ownable.sol";
import "./ICommunity.sol";

contract VotingContract is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using Address for address;

    uint256 constant public N = 1e6;
    
    struct Vote {
        string voteTitle;
        uint256 startBlock;
        uint256 endBlock;
        uint256 voteWindowBlocks;
        address contractAddress;
        ICommunity communityAddress;
        string communityRole;
        uint256 communityFraction;
        uint256 communityMinimum;
    }
    
    mapping(address => bool) alreadyVoted;
    mapping(address => uint256) lastEligibleBlock;
    Vote voteData;
    
    //event PollStarted();
    event PollEmit(address votestant);
    //event PollEnded();
    
    
    //addr.delegatecall(abi.encodePacked(bytes4(keccak256("setSomeNumber(uint256)")), amount));
    
    modifier canVote() {
        require(
            (voteData.startBlock <= block.number) && (voteData.endBlock >= block.number), 
            string(abi.encodePacked("Voting is outside period ", uintToStr(voteData.startBlock), " - ", uintToStr(voteData.endBlock), " blocks"))
        );
        _;
    }
    
    modifier hasVoted() {
        require(alreadyVoted[msg.sender] == false, "Sender has already voted");
        _;
    }
    modifier eligible(uint256 blockNumber) {
        require(wasEligible(msg.sender, blockNumber) == true, "Sender has not eligible yet");
        
        require(
            block.number.sub(blockNumber) <= voteData.voteWindowBlocks,
            "Voting is outside `voteWindowBlocks`"
        );
            
            
        _;
    }
    modifier isVotestant() {
        bool s = false;
        string[] memory roles = ICommunity(voteData.communityAddress).getRoles(msg.sender);
        for (uint256 i=0; i< roles.length; i++) {
            
            if (keccak256(abi.encodePacked(voteData.communityRole)) == keccak256(abi.encodePacked(roles[i]))) {
                s = true;
            }
        }
        require(s == true, "Sender has not in Votestant List");
        _;
    }
    
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
    {
        voteData.voteTitle = voteTitle;
        voteData.startBlock = blockNumberStart;
        voteData.endBlock = blockNumberEnd;
        voteData.voteWindowBlocks = voteWindowBlocks;
        voteData.contractAddress = contractAddress;
        voteData.communityAddress = communityAddress;
        voteData.communityRole = communityRole;
        voteData.communityFraction = communityFraction;
        voteData.communityMinimum = communityMinimum;
    }
   
   /**
    * check user eligible
    */
   function wasEligible(
        address addr, 
        uint256 blockNumber // user is eligle to vote from  blockNumber
    )
        public 
        view
        returns(bool)
    {
        
        bool was = false;
        uint256 blocksLength;
        uint256 number;
        uint256 memberCount = ICommunity(voteData.communityAddress).memberCount(voteData.communityRole);
        
        if (block.number.sub(blockNumber)>256) {
            // hash of the given block - only works for 256 most recent blocks excluding current
            // see https://solidity.readthedocs.io/en/v0.4.18/units-and-global-variables.html
        
        } else {
            
            uint256 m = voteData.communityMinimum.mul(N).div(memberCount);
            
            if (m < voteData.communityFraction) {
                m = voteData.communityFraction;
            }
    
            number = getNumber(blockNumber, 1000000);
            
            if (number < m) {
                was = true;
            }
        
        }
        return was;
    }

    /**
     * can vote
     */
    function vote(
        uint256 blockNumber,
        bytes memory functionSignature
        
    )
        public 
        hasVoted()
        isVotestant()
        canVote()
        eligible(blockNumber)
        nonReentrant()
    {
        emit PollEmit(msg.sender);
        alreadyVoted[msg.sender] = true;
        
        //_e.call(bytes4(sha3("setN(uint256)")), _n); // E's storage is set, D is not modified 
        // voteData.contractAddress.call(abi.encodePacked(bytes4(keccak256(abi.encodePacked(voteData.methodName,"()")))));
        voteData.contractAddress.call(functionSignature);
        // see https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#examples
        
    }
    
    function getNumber(uint256 blockNumber, uint256 max) internal view returns(uint256 number) {
        bytes32 blockHash = blockhash(blockNumber);
        number = (uint256(keccak256(abi.encodePacked(blockHash, msg.sender))) % max);
    }
    
    /**
     * convert uint to string
     */
    function uintToStr(uint _i) internal pure returns (string memory _uintAsString) {
        uint number = _i;
        if (number == 0) {
            return "0";
        }
        uint j = number;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (number != 0) {
            bstr[k--] = byte(uint8(48 + number % 10));
            number /= 10;
        }
        return string(bstr);
    }
    
}