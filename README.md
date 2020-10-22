# VotingContract
Smart contract for facilitating voting and polling

# Deploy
when deploy it is need to pass parameters in to constructor
Params:
name  | type | description
--|--|--
voteTitle|string|Vote title
blockNumberStart|uint256|vote will start from `blockNumberStart`
blockNumberEnd|uint256|vote will end at `blockNumberEnd`
voteWindowBlocks|uint256|period in blocks then we check eligible
contractAddress|address|contract's address which will call after user vote
methodName|string|method of contract's address which will call(without params) after user vote
communityAddress|address|address of community contract
communityRole|string|community role of participants which allowance to vote
communityFraction|uint256|fraction (percents mul by 1e6). setup if minimum/memberCount too low
communityMinimum|uint256|community minimum

# Overview
once installed will be use methods:

## Methods

### wasEligible

Checking if the user was eligible in last `voteWindowBlocks` blocks

Params:
name  | type | description
--|--|--
addr|address|user's address
blockNumber|uint256|Block number

### vote

user can vote if he hasn't vote before and he has was eligible for last `voteWindowBlocks` blocks

Params:
name  | type | description
--|--|--

## Lifecycle of Vote
* deploy( or got) contract which method we will be call from voting contract. for example `<address contract1>` and method "increaseCounter"
* got contract of Community and roles name. for example `<address community>` and role "members"
* creation VotingContract with params 
   *   voteTitle = "My First Vote
   *   blockNumberStart = 11105165
   *   blockNumberEnd =  11155165
   *   voteWindowBlocks = 100
   *   contractAddress = `<address contract1>`
   *   methodName = "`increaseCounter`"
   *   communityAddress = `<address community>`
   *   communityRole = 'members'
   *   communityFraction = 150000
   *   communityMinimum = 20
* now any user which contain in contract community with role 'members' can vote in period from `blockNumberStart` to `blockNumberEnd` if was eligible for last `voteWindowBlocks` blocks
* each successful vote will call method `increaseCounter` of `<address contract1>`