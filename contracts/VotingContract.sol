// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/Address.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/access/Ownable.sol";

import "./interfaces/ICommunity.sol";
import "./IntercoinTrait.sol";

contract VotingContract is Initializable, OwnableUpgradeSafe, ReentrancyGuardUpgradeSafe, IntercoinTrait {
    using SafeMath for uint256;
    using Address for address;

    uint256 constant public N = 1e6;
    
    /**
     * send as array to external method instead two arrays with same length  [names[], values[]]
     */
    struct VoterData {
        string name;
        uint256 value;
    }
    
    struct CommunitySettings {
        string communityRole;
        uint256 communityFraction;
        uint256 communityMinimum;
    }
    struct Vote {
        string voteTitle;
        uint256 startBlock;
        uint256 endBlock;
        uint256 voteWindowBlocks;
        address contractAddress;
        ICommunity communityAddress;
        CommunitySettings[] communitySettings;
        mapping(bytes32 => uint256) communityRolesWeight;
    }
    
    struct Voter {
        address contractAddress;
        string contractMethodName;
        VoterData[] voterData;
        bool alreadyVoted;
    }
    mapping(address => Voter) votersMap;
    
    address[] voters;
    
    mapping(bytes32 => uint256) rolesWeight;
    
    mapping(address => uint256) lastEligibleBlock;
    Vote voteData;
    
    //event PollStarted();
    event PollEmit(address voter, string methodName, VoterData[] data, uint256 weight);
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
        require(votersMap[msg.sender].alreadyVoted == false, "Sender has already voted");
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
    modifier isVoters() {
        bool s = false;
        string[] memory roles = ICommunity(voteData.communityAddress).getRoles(msg.sender);
        for (uint256 i=0; i< roles.length; i++) {
            for (uint256 j=0; j< voteData.communitySettings.length; j++) {
                if (keccak256(abi.encodePacked(voteData.communitySettings[j].communityRole)) == keccak256(abi.encodePacked(roles[i]))) {
                    s = true;
                    break;
                }
            }
            if (s==true)  {
                break;
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
     * @param communitySettings tuples of (communityRole,communityFraction,communityMinimum). where
     *  communityRole community role which allowance to vote
     *  communityFraction fraction mul by 1e6. setup if minimum/memberCount too low
     *  communityMinimum community minimum
     */
    function init(
        string memory voteTitle,
        uint256 blockNumberStart,
        uint256 blockNumberEnd,
        uint256 voteWindowBlocks,
        address contractAddress,
        ICommunity communityAddress,
        CommunitySettings[] memory communitySettings
        
    ) 
        public 
        initializer
    {    
        __Ownable_init();
        __ReentrancyGuard_init();
	
        voteData.voteTitle = voteTitle;
        voteData.startBlock = blockNumberStart;
        voteData.endBlock = blockNumberEnd;
        voteData.voteWindowBlocks = voteWindowBlocks;
        voteData.contractAddress = contractAddress;
        voteData.communityAddress = communityAddress;
        
        // --------
        // voteData.communitySettings = communitySettings;
        // UnimplementedFeatureError: Copying of type struct VotingContract.CommunitySettings memory[] memory to storage not yet supported.
        // -------- so do it in cycle below by pushing every tuple

         for (uint256 i=0; i< communitySettings.length; i++) {
            voteData.communityRolesWeight[keccak256(abi.encodePacked(communitySettings[i].communityRole))] = 1; // default weight
            voteData.communitySettings.push(communitySettings[i]);
        }
        
    }
    
    /**
     * setup weight for role which is
     */
    function setWeight(
        string memory role, 
        uint256 weight
    ) 
        public 
        onlyOwner 
    {
        
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
        
        uint256 memberCount;
        
        if (block.number.sub(blockNumber)>256) {
            // hash of the given block - only works for 256 most recent blocks excluding current
            // see https://solidity.readthedocs.io/en/v0.4.18/units-and-global-variables.html
        
        } else {
            uint256 m;
            uint256 number  = getNumber(blockNumber, 1000000);
            for (uint256 i=0; i<voteData.communitySettings.length; i++) {
                
                memberCount = ICommunity(voteData.communityAddress).memberCount(voteData.communitySettings[i].communityRole);
                m = (voteData.communitySettings[i].communityMinimum).mul(N).div(memberCount);
            
                if (m < voteData.communitySettings[i].communityFraction) {
                    m = voteData.communitySettings[i].communityFraction;
                }
    
            
                if (number < m) {
                    was = true;
                }
            
                if (was == true) {
                    break;
                }
            }
        
        }
        return was;
    }

    /**
     * vote method
     */
    function vote(
        uint256 blockNumber,
        string memory methodName,
        VoterData[] memory voterData
        
    )
        public 
        hasVoted()
        isVoters()
        canVote()
        eligible(blockNumber)
        nonReentrant()
    {
        
        votersMap[msg.sender].contractAddress = voteData.contractAddress;
        votersMap[msg.sender].contractMethodName = methodName;
        votersMap[msg.sender].alreadyVoted = true;
        for (uint256 i=0; i<voterData.length; i++) {
            votersMap[msg.sender].voterData.push(VoterData(voterData[i].name,voterData[i].value));
        }
        
        voters.push(msg.sender);
        
        bool verify =  checkInstance(voteData.contractAddress);
        require (verify == true, '"contractAddress" did not pass verifying at Intercoin');
        
        uint256 weight = getWeight(msg.sender);
      
        
        

        //"vote((string,uint256)[],uint256)":
        voteData.contractAddress.call(
            abi.encodeWithSelector(
                bytes4(keccak256(abi.encodePacked(methodName,"((string,uint256)[],uint256)"))),
                //voterDataToSend, 
                voterData, 
                weight
            )
        );
        
        emit PollEmit(msg.sender, methodName, voterData,  weight);
    }
    
    /**
     * get votestant votestant
     * @param addr votestant's address
     * @return Votestant tuple
     */
    function getVoterInfo(address addr) public view returns(Voter memory) {
        return votersMap[addr];
    }
    
    /**
     * return all votestant's addresses
     */
    function getVoters() public view returns(address[] memory) {
        return voters;
    }
    
    /**
     * findout max weight for sender role
     * @param addr sender's address
     * @return weight max weight from all allowed roles
     */
    function getWeight(address addr) internal view returns(uint256 weight) {
        weight = 1; // default minimum weight
        uint256 iWeight = weight;
        bytes32 iKeccakRole;
        string[] memory roles = ICommunity(voteData.communityAddress).getRoles(addr);
        for (uint256 i = 0; i < roles.length; i++) {
            iKeccakRole = keccak256(abi.encodePacked(roles[i]));
            for (uint256 j = 0; j < voteData.communitySettings.length; j++) {
                if (keccak256(abi.encodePacked(voteData.communitySettings[j].communityRole)) == iKeccakRole) {
                    iWeight = rolesWeight[iKeccakRole];
                    if (weight < iWeight) {
                        weight = iWeight;
                    }
                }
            }
        }
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