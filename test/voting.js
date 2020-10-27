const BN = require('bn.js'); // https://github.com/indutny/bn.js
const util = require('util');

const VotingContractMock = artifacts.require("VotingContractMock");
const CommunityMock = artifacts.require("CommunityMock");
const SomeExternalMock = artifacts.require("SomeExternalMock");


const truffleAssert = require('truffle-assertions');

const helper = require("../helpers/truffleTestHelper");

contract('VotingContract', (accounts) => {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    const accountOne = accounts[0];
    const accountTwo = accounts[1];  
    const accountThree = accounts[2];
    const accountFourth= accounts[3];
    const accountFive = accounts[4];
    const accountSix = accounts[5];
    const accountSeven = accounts[6];
    const accountEight = accounts[7];
    const accountNine = accounts[8];
    const accountTen = accounts[9];
    const accountEleven = accounts[10];
    const accountTwelwe = accounts[11];

    // setup useful vars
    var rolesTitle = 'OWNERS';
    var roleStringADMINS = 'ADMINS';
    
    var rolesTitle = new Map([
      ['owners', 'owners'],
      ['admins', 'admins'],
      ['members', 'members'],
      ['role1', 'Role#1'],
      ['role2', 'Role#2'],
      ['role3', 'Role#3'],
      ['role4', 'Role#4'],
      ['cc_admins', 'AdMiNs']
    ]);
    
    it('test voting contract ', async () => {
        
        
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        var SomeExternalMockInstance = await SomeExternalMock.new({from: accountTen});
        var counterBefore = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        let signatureFunc =  await SomeExternalMockInstance.returnFuncSignature({from: accountTen});
        

        CommunityMockInstance.setMemberCount(300000);
        
        let block1 = await web3.eth.getBlock("latest");
        
        var VotingContractMockInstance = await VotingContractMock.new(
            'VoteTitle',// string memory voteTitle,
            block1.number+10, // uint256 blockNumberStart,
            block1.number+10+200,// uint256 blockNumberEnd,
            10,// uint256 voteWindowBlocks,
            SomeExternalMockInstance.address, // address contractAddress,
            CommunityMockInstance.address, // ICommunity communityAddress,
            'members', // string memory communityRole,
            1000, // uint256 communityFraction,
            1,// uint256 communityMinimum,
            {from: accountOne}
        );
        
        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+1, signatureFunc, {from: accountOne}),
            "Voting is outside period "+(block1.number+10)+" - "+(block1.number+10+200)+" blocks"
        );
        
        for(i=0;i<20;i++) {
            await helper.advanceBlock();    
        }
        
        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+19, signatureFunc, {from: accountOne}),
            "Sender has not eligible yet"
        );
        
        await CommunityMockInstance.setMemberCount(2);
        await VotingContractMockInstance.setCommunityFraction(990000);
        

        for(i=0;i<10;i++) {
            await helper.advanceBlock();
        }
        
        let tmpblock = await web3.eth.getBlock("latest");

        await VotingContractMockInstance.vote(tmpblock.number-1, signatureFunc,{from: accountOne});
        
        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+22, signatureFunc, {from: accountOne}),
            "Sender has already voted"
        );
        
        var counterAfter = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        assert.equal(counterAfter-counterBefore, 1,'counter doest not work');
        
    });
    
});
