const { ethers, waffle } = require('hardhat');
const { BigNumber } = require('ethers');
const { expect } = require('chai');
const chai = require('chai');
//const { time } = require('@openzeppelin/test-helpers');

const ZERO = BigNumber.from('0');
const ONE = BigNumber.from('1');
const TWO = BigNumber.from('2');
const THREE = BigNumber.from('3');
const FOUR = BigNumber.from('4');
const FIVE = BigNumber.from('5');
const SIX = BigNumber.from('6');
const SEVEN = BigNumber.from('7');
const TEN = BigNumber.from('10');
const HUN = BigNumber.from('100');

const ONE_ETH = ethers.utils.parseEther('1');    
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const NO_COSTMANAGER = ZERO_ADDRESS;



describe("VotingContract", function () {
    
    // it("should assert true", async function(done) {
    //     await TestExample.deployed();
    //     assert.isTrue(true);
    //     done();
    //   });
    
    // Setup accounts.
    
    const accounts = waffle.provider.getWallets();
    const owner = accounts[0];                     
    const alice = accounts[1];
    const bob = accounts[2];
    const charlie = accounts[3];
    const dave = accounts[4];
    const mallory = accounts[5];
    const trudy = accounts[6];

    const votesData = [
        ["lorem1", 11],
        ["lorem2", 22],
        ["lorem3", 33]
    ];
    const votesDataSecond = [
        ["Ipsum1", 444],
        ["Ipsum2", 555]
    ];
    
    const membersRoleId = 2;

    const methodNametoCall = 'vote';


    var VotingFactory;
    var VotingContractInstance;
    var releaseManager;
    var tx,rc,event,instance,instancesCount;
    before("deploying", async() => {
        const VotingFactoryF = await ethers.getContractFactory("VotingFactoryMock");
        const VotingContractF = await ethers.getContractFactory("VotingContractMock");
        const ReleaseManagerFactoryF = await ethers.getContractFactory("MockReleaseManagerFactory");
        const ReleaseManagerF = await ethers.getContractFactory("MockReleaseManager");

        let implementationReleaseManager    = await ReleaseManagerF.deploy();
        let releaseManagerFactory   = await ReleaseManagerFactoryF.connect(owner).deploy(implementationReleaseManager.address);
                
        //
        tx = await releaseManagerFactory.connect(owner).produce();
        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.events.find(event => event.event === 'InstanceProduced');
        [instance, instancesCount] = event.args;

        releaseManager = await ethers.getContractAt("MockReleaseManager",instance);


        let implVotingContract = await VotingContractF.deploy();
        VotingFactory = await VotingFactoryF.deploy(implVotingContract.address, NO_COSTMANAGER);

        // 
        const factoriesList = [VotingFactory.address];
        const factoryInfo = [
            [
                1,//uint8 factoryIndex; 
                1,//uint16 releaseTag; 
                "0x53696c766572000000000000000000000000000000000000"//bytes24 factoryChangeNotes;
            ]
        ]
        await VotingFactory.connect(owner).registerReleaseManager(releaseManager.address);
        await releaseManager.connect(owner).newRelease(factoriesList, factoryInfo);

    });

    it('test voting contract ', async () => {
        
        const CommunityMockF = await ethers.getContractFactory("CommunityMock");
        const SomeExternalMockF = await ethers.getContractFactory("SomeExternalMock");
        
        // here it just dummy. it's not real community contract
        var CommunityMockInstance = await CommunityMockF.connect(owner).deploy();
        var SomeExternalMockInstance = await SomeExternalMockF.connect(owner).deploy();
        //var IntercoinMockInstance = await IntercoinMock.new({from: accountTen});

        
        
        var counterBefore = await SomeExternalMockInstance.viewCounter();
        
        await CommunityMockInstance.connect(owner).setMemberCount(300000);
        
        let block1 = await hre.ethers.provider.getBlock("latest");
        

        await expect(
           VotingFactory.connect(alice).produce(
            [
                'VoteTitle',// string memory voteTitle,
                block1.number+10, // uint256 blockNumberStart,
                block1.number+10+200,// uint256 blockNumberEnd,
                10,// uint256 voteWindowBlocks,
            ],
            SomeExternalMockInstance.address, // address contractAddress,
            CommunityMockInstance.address, // ICommunity communityAddress,
            // communityRole,communityFraction,communityMinimum
            [[membersRoleId,1000,1]],
        )
       ).to.be.revertedWith(`ShouldBeRegisteredInReleaseManager("${SomeExternalMockInstance.address}", "${releaseManager.address}")`);
        //var VotingContractMockInstance = await VotingContractMock.new({from: accountOne});
        
        // reg imitation interaction with intercoin. usual it is happens in creation factory which will be clone instances
        //to be able to call `SomeExternalMockInstance` in vote method
        await VotingFactory.registerCustomInstance(SomeExternalMockInstance.address);        

        tx = await VotingFactory.connect(alice).produce(
            [
                'VoteTitle',// string memory voteTitle,
                block1.number+10, // uint256 blockNumberStart,
                block1.number+10+200,// uint256 blockNumberEnd,
                10,// uint256 voteWindowBlocks,
            ],
            SomeExternalMockInstance.address, // address contractAddress,
            CommunityMockInstance.address, // ICommunity communityAddress,
            // communityRole,communityFraction,communityMinimum
            [[membersRoleId,1000,1]],
        );

        rc = await tx.wait(); // 0ms, as tx is already confirmed
        event = rc.events.find(event => event.event === 'InstanceCreated');
        [instance, instancesCount] = event.args;
        VotingContractMockInstance = await ethers.getContractAt("VotingContractMock",instance);

        await expect (
            VotingContractMockInstance.connect(bob).setWeight(membersRoleId+1, 20)
        ).to.be.revertedWith("Ownable: caller is not the owner");
        await VotingContractMockInstance.connect(alice).setWeight(membersRoleId+1, 20);

        await expect(
            VotingContractMockInstance.connect(alice).vote(block1.number+1, methodNametoCall, votesData)
        ).to.be.revertedWith(`VotingIsOutsideOfPeriod(${(block1.number+10)}, ${(block1.number+10+200)})`);
        
        for(i = 0; i < 20; i++) {
            await network.provider.send("evm_increaseTime", [3600])
            await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
        }
        

        await expect(
            VotingContractMockInstance.connect(alice).vote(block1.number+19, methodNametoCall, votesData)
        ).to.be.revertedWith(`NotEligibleYet("${alice.address}")`);
        
        await CommunityMockInstance.setMemberCount(2);
        await VotingContractMockInstance.setCommunityFraction(membersRoleId, 990000);
        

        for(i = 0; i < 10; i++) {
            await network.provider.send("evm_increaseTime", [3600])
            await network.provider.send("evm_mine") // this one will have 02:00 PM as its timestamp
        }
        
        let tmpblock = await hre.ethers.provider.getBlock("latest");

        await VotingContractMockInstance.connect(alice).vote(tmpblock.number-1, methodNametoCall, votesData);
        await VotingContractMockInstance.connect(bob).vote(tmpblock.number-2, methodNametoCall, votesDataSecond);

        await expect(
            VotingContractMockInstance.connect(alice).vote(block1.number+22, methodNametoCall, votesData),
        ).to.be.revertedWith(`AlreadyVoted("${alice.address}")`);
        
        
        var counterAfter = await SomeExternalMockInstance.viewCounter();

        expect(counterAfter-counterBefore).to.be.eq(2);
        
        // check in votestant list
        let list = await VotingContractMockInstance.getVoters();
        expect(list[0]).to.be.eq(alice.address); // 'votestant is not put at list'
        
        // check stored votestantInfo
        let votestantData = await VotingContractMockInstance.getVoterInfo(alice.address);
        expect(votestantData.alreadyVoted).to.be.eq(true); //'vote is not set'
        
        // check stored votestantInfoSecond
        let votestantDataSecond = await VotingContractMockInstance.getVoterInfo(bob.address);
        expect(votestantDataSecond.alreadyVoted).to.be.eq(true); //'vote is not set'
        
    });
    
});
