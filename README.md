# VotingContract
Smart contract for facilitating voting and polling

# Installation
### Node
`npm install @openzeppelin/contracts-ethereum-package`

# Deploy
when deploy it is need to pass parameters in to init method
Params:
name  | type | description
--|--|--
voteTitle|string|Vote title
blockNumberStart|uint256|vote will start from `blockNumberStart`
blockNumberEnd|uint256|vote will end at `blockNumberEnd`
voteWindowBlocks|uint256|period in blocks then we check eligible
contractAddress|address|contract's address which will call after user vote
communityAddress|address|address of community contract
communityRole|string|community role of participants which allowance to vote
communityFraction|uint256|fraction (percents mul by 1e6). setup if minimum/memberCount too low
communityMinimum|uint256|community minimum

# Overview
once installed will be use methods:

## Methods

### wasEligible

Checking if the user was eligible in  `blockNumber` block

Params:
name  | type | description
--|--|--
addr|address|user's address
blockNumber|uint256|Block number

### vote

user can vote if he hasn't vote before and he has was eligible in `blockNumber` block

Params:
name  | type | description
--|--|--
blockNumber|uint256|Block number
functionSignature|bytes| function signature (see https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#examples)

## Lifecycle of Vote
* deploy( or got) contract which method we will be call from voting contract. for example `<address contract1>` and method "counter" which increment internal variable
* got contract of Community and roles name. for example `<address community>` and role "members"
* creation VotingContract and call init method with params 
   *   voteTitle = "My First Vote
   *   blockNumberStart = 11105165
   *   blockNumberEnd =  11155165
   *   voteWindowBlocks = 100
   *   contractAddress = `<address contract1>`
   *   communityAddress = `<address community>`
   *   communityRole = 'members'
   *   communityFraction = 150000
   *   communityMinimum = 20
* now any user which contain in contract community with role 'members' can vote in period from `blockNumberStart` to `blockNumberEnd` if was eligible in `blockNumber` block
calling vote with Params
    * blockNumber = 11105222
    * functionSignature = "0x61bc221a"  (it the same that `abi.encodePacked(bytes4(keccak256(abi.encodePacked('counter',"()"))))`)

* each successful vote will call method `counter` of `<address contract1>`