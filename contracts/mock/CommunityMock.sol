pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;


import "../openzeppelin-contracts/contracts/access/Ownable.sol";
import "../ICommunity.sol";

contract CommunityMock is Ownable, ICommunity {
    uint256 count = 5;
    
    function memberCount(string memory role) public override view returns(uint256) {
        return count;
    }
    function setMemberCount(uint256 _count) public returns(uint256) {
        count = _count;
    }
    
    function getRoles(address member)public override view returns(string[] memory){
        string[] memory list = new string[](5);
        list[0] = 'owners';
        list[1] = 'admins';
        list[2] = 'members';
        list[3] = 'sub-admins';
        list[4] = 'unkwnowns';
        return list;
        
    }
    function getMember(string memory role) public override view returns(address[] memory){
        address[] memory list = new address[](0);
        return list;
    }
    
}
