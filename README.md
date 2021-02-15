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
communitySettings|tuple| see <a href="communitysettings">communitySettings</a>


# Overview
once installed will be use methods:
<table>
<thead>
	<tr>
		<th>method name</th>
		<th>called by</th>
		<th>description</th>
	</tr>
</thead>
<tbody>
    <tr>
		<td><a href="#init">init</a></td>
		<td>anyone</td>
		<td>need to initialize after contract deploy</td>
	</tr>
	<tr>
		<td><a href="#setweight">setWeight</a></td>
		<td>owner</td>
		<td>ability to owner setup weight for role community</td>
	</tr>
	<tr>
		<td><a href="#vote">vote</a></td>
		<td>only which roles specified at Community Contract</td>
		<td>vote method</td>
	</tr>
    <tr>
		<td><a href="#waseligible">wasEligible</a></td>
		<td>anyone</td>
		<td>is block eligible for sender or not</td>
	</tr>
	<tr>
		<td><a href="#getvotestantinfo">getVotestantInfo</a></td>
		<td>anyone</td>
		<td>return votestant info</td>
	</tr>
	<tr>
		<td><a href="#getvotestantlist">getVotestantList</a></td>
		<td>anyone</td>
		<td>return votestant's address</td>
	</tr>
</tbody>
</table>

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
voterData|array of tuples| see <a href="voterdata">voterData</a>

### getVotestantInfo
Return votestant info. tuple of (fucntionSignature;alreadyVoted)
Params:
name  | type | description
--|--|--
addr|address|user's address

### setWeight
setup weight for community role
Params:
name  | type | description
--|--|--
role|string|role name
weight|uint256|weight value


### getVotestantList
return all address which already voted

## Tuples
### communitySettings
name  | type | description
--|--|--
communityRole|string|community role of participants which allowance to vote
communityFraction|uint256|fraction (percents mul by 1e6). setup if minimum/memberCount too low
communityMinimum|uint256|community minimum

### voterData
name  | type | description
--|--|--
name|string| string
value|uint256| uint256



## Lifecycle of Vote
* deploy( or got) contract which method `vote` we will be call from voting contract. for example `<address contract1>`
* got contract of Community and roles name. for example `<address community>` and role "members"
* creation VotingContract and call init method with params 
   *   voteTitle = "My First Vote
   *   blockNumberStart = 11105165
   *   blockNumberEnd =  11155165
   *   voteWindowBlocks = 100
   *   contractAddress = `<address contract1>`
   *   communityAddress = `<address community>`
   *   communitySettings = ['members',150000,20]  ([<communityRole>, <communityFraction>, <communityMinimum>])
   
* now any user which contain in contract community with role 'members' can vote in period from `blockNumberStart` to `blockNumberEnd` if was eligible in `blockNumber` block
calling vote with Params
    * blockNumber = 11105222
    * voterData = [["orange",12],["blackberry",34],["lemon",56]]

* each successful vote will call method `vote` of `<address contract1>`