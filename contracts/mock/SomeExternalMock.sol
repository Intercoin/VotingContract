pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

contract SomeExternalMock {
    uint256 incrementCount;
    
    function counter() public {
        incrementCount++;
    }
    
    function viewCounter() public view returns(uint256) {
        return incrementCount;
    }
   
}
