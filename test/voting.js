const BN = require('bn.js'); // https://github.com/indutny/bn.js
const util = require('util');

const VotingContractMock = artifacts.require("VotingContractMock");
const CommunityMock = artifacts.require("CommunityMock");
const SomeExternalMock = artifacts.require("SomeExternalMock");
const IntercoinMock = artifacts.require("IntercoinMock");



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
    
    var votesData = [
        ["lorem1", 11],
        ["lorem2", 22],
        ["lorem3", 33]
    ];
    var votesDataSecond = [
        ["Ipsum1", 444],
        ["Ipsum2", 555]
    ];
    
    var methodNametoCall = 'vote';
    
    it('test voting contract ', async () => {
        
        
        var CommunityMockInstance = await CommunityMock.new({from: accountTen});
        var SomeExternalMockInstance = await SomeExternalMock.new({from: accountTen});
        var IntercoinMockInstance = await IntercoinMock.new({from: accountTen});
        
        
        var counterBefore = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        CommunityMockInstance.setMemberCount(300000);
        
        let block1 = await web3.eth.getBlock("latest");
        
        var VotingContractMockInstance = await VotingContractMock.new({from: accountOne});
        
        // reg imitation interaction with intercoin. usual it is happens in creation factory which will be clone instances
        await VotingContractMockInstance.setIntercoinAddress(IntercoinMockInstance.address, {from: accountTen});
        // --------------

        await VotingContractMockInstance.init(
            [
                'VoteTitle',// string memory voteTitle,
                block1.number+10, // uint256 blockNumberStart,
                block1.number+10+200,// uint256 blockNumberEnd,
                10,// uint256 voteWindowBlocks,
            ],
            SomeExternalMockInstance.address, // address contractAddress,
            CommunityMockInstance.address, // ICommunity communityAddress,
            // communityRole,communityFraction,communityMinimum
            [['members',1000,1]],
            {from: accountOne}
        );
        
        
        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+1, methodNametoCall, votesData, {from: accountOne}),
            "Voting is outside period "+(block1.number+10)+" - "+(block1.number+10+200)+" blocks"
        );
        
        for(i=0;i<20;i++) {
            await helper.advanceBlock();    
        }
        
        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+19, methodNametoCall, votesData, {from: accountOne}),
            "Sender has not eligible yet"
        );
        
        await CommunityMockInstance.setMemberCount(2);
        await VotingContractMockInstance.setCommunityFraction('members', 990000);
        

        for(i=0;i<10;i++) {
            await helper.advanceBlock();
        }
        
        let tmpblock = await web3.eth.getBlock("latest");


        
        await VotingContractMockInstance.vote(tmpblock.number-1, methodNametoCall, votesData, {from: accountOne});
        await VotingContractMockInstance.vote(tmpblock.number-2, methodNametoCall, votesDataSecond, {from: accountTwo});

        await truffleAssert.reverts(
            VotingContractMockInstance.vote(block1.number+22, methodNametoCall, votesData, {from: accountOne}),
            "Sender has already voted"
        );
        
        var counterAfter = await SomeExternalMockInstance.viewCounter({from: accountTen});
        
        assert.equal(counterAfter-counterBefore, 2,'counter does not work');
        
        
        // check in votestant list
        let list = await VotingContractMockInstance.getVoters({from: accountTwo});
        assert.equal(list[0], accountOne,'votestant is not put at list');
        
        // check stored votestantInfo
        let votestantData = await VotingContractMockInstance.getVoterInfo(accountOne, {from: accountTwo});
        assert.equal(votestantData.alreadyVoted, true,'vote is not set');
        
        // check stored votestantInfoSecond
        let votestantDataSecond = await VotingContractMockInstance.getVoterInfo(accountTwo, {from: accountTwo});
        assert.equal(votestantDataSecond.alreadyVoted, true,'vote is not set');
        
    });
    
});
