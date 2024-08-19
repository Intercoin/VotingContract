const fs = require('fs');
//const HDWalletProvider = require('truffle-hdwallet-provider');

function get_data(_message) {
    return new Promise(function(resolve, reject) {
        fs.readFile('./scripts/arguments.json', (err, data) => {
            if (err) {
                if (err.code == 'ENOENT' && err.syscall == 'open' && err.errno == -4058) {
					let obj = {};
					data = JSON.stringify(obj, null, "");
                    fs.writeFile('./scripts/arguments.json', data, (err) => {
                        if (err) throw err;
                        resolve(data);
                    });
                } else {
                    throw err;
                }
            } else {
            	resolve(data);
			}
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function main() {
	var data = await get_data();
    var data_object_root = JSON.parse(data);
	if (typeof data_object_root[hre.network.name] === 'undefined') {
		throw("Arguments file: missed data");
    } else if (typeof data_object_root[hre.network.name] === 'undefined') {
		throw("Arguments file: missed network data");
    }
	data_object = data_object_root[hre.network.name];
	if (
		typeof data_object.implementationVotingContract === 'undefined' ||
		typeof data_object.releaseManager === 'undefined' ||
		!data_object.implementationVotingContract ||
		!data_object.releaseManager
	) {
		throw("Arguments file: wrong addresses");
	}

	const networkName = hre.network.name;

    var depl_local,
    depl_auxiliary,
    depl_releasemanager,
    depl_voting;

    var signers = await ethers.getSigners();
    if (networkName == 'hardhat') {
        depl_local = signers[0];
        depl_auxiliary = signers[0];
        depl_releasemanager = signers[0];
        depl_voting = signers[0];
    } else {
        [
            depl_local,
            depl_auxiliary,
            depl_releasemanager,
            depl_voting
        ] = signers;
    }
	
	const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
	console.log(
		"Deploying contracts with the account:",
		depl_voting.address
	);

	var options = {
		//gasPrice: ethers.utils.parseUnits('50', 'gwei'), 
		//gasLimit: 5e6
	};
	let _params = [
		data_object.implementationVotingContract,
		ZERO_ADDRESS, //costmanager
		data_object.releaseManager
	]
	let params = [
		..._params,
		options
	]

    const deployerBalanceBefore = await ethers.provider.getBalance(depl_voting.address);
    console.log("Account balance:", (deployerBalanceBefore).toString());
	
	const VotingFactoryF = await ethers.getContractFactory("VotingFactory");

	this.factory = await VotingFactoryF.connect(depl_voting).deploy(...params);

	console.log("Factory deployed at:", this.factory.target);
	console.log("with params:", [..._params]);

	console.log("registered with release manager:", data_object.releaseManager);
	
	const deployerBalanceAfter = await ethers.provider.getBalance(depl_voting.address);
	console.log("Spent:", ethers.formatEther(deployerBalanceBefore - deployerBalanceAfter));
	console.log("gasPrice:", ethers.formatUnits((await network.provider.send("eth_gasPrice")), "gwei")," gwei");

	const releaseManager = await ethers.getContractAt("ReleaseManager",data_object.releaseManager);
    let txNewRelease = await releaseManager.connect(depl_releasemanager).newRelease(
        [this.factory.target], 
        [
            [
                12,//uint8 factoryIndex; 
                12,//uint16 releaseTag; 
                "0x000000000000000000000000000000000000000000000000"//bytes24 factoryChangeNotes;
            ]
        ]
    );

	console.log('newRelease - waiting');
    await txNewRelease.wait(5);
    console.log('newRelease - mined');
	console.log('this.factory = ', this.factory.target);

    if (networkName == 'hardhat') {
        console.log("skipping verifying for  'hardhat' network");
    } else {
		
        
		var attempt = 0;
        var loopExit = false;
        console.log("Starting verifying:");
        while (!loopExit && attempt < 3) {

            try {
                console.log('Attempt #',attempt+1);
                console.log('waiting 5 sec');
                await sleep(5000);
                
                await hre.run("verify:verify", {
					address: this.factory.target,
					constructorArguments: _params
				});
				
                loopExit = true;
                console.log('successfull');
            } catch (error) {
                attempt++;
            }
        }
        if (!loopExit) {
            console.log('verifying failed');
        }
    }

}

main()
  .then(() => process.exit(0))
  .catch(error => {
	console.error(error);
	process.exit(1);
  });