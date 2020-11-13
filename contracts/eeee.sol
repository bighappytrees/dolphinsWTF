// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/GSN/Context.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/utils/Address.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v3.2.0/contracts/math/Math.sol";

/*
        _decimals = 18;
        _totalSupply = 42069e18;
        _balances[msg.sender] = _totalSupply;
    When the game is on each transaction is taxed, with the money being sent to an address. This can be "snatch" by any dolphin holding at least 69 tokens.

*/


// DolphinToken, hardcap set on deployment with minting to crunch base
contract DolphinToken is ERC20 {
    using SafeMath for uint256;

    bool public _gameStarted;
    uint256 public _lastUpdated;
    uint256 public _coolDownTime;
    uint256 public _snatchRate;
    uint256 public _snatchPool;
    uint256 public _devFoodBucket;
    bool public _devCanEat;
    bool public _isAnarchy;
    uint256 public _orca;
	uint256 public _river;
	uint256 public _bottlenose;
	uint256 public _flipper;
	uint256 public _peter;
	address public _owner;
	address public _UniLP;
	uint256 public _lpMin;
	uint256 public _feeLevel1;
	uint256 public _feeLevel2;
	
    
    mapping(address => uint256) private _balances;


    constructor() public
        ERC20("Dolphin Token", "EEEE")
    {
        _mint(msg.sender, 42069e18);
        _balances[msg.sender] = 42069e18;
        _gameStarted = false;
        _coolDownTime = 1 minutes; //set this back
        _devCanEat = false;
        _isAnarchy = false;
        _snatchRate = 1;
        _orca = 69e18;
		_river = 42069e16;
		_bottlenose = 210345e16;
		_flipper = 42069e17;
		_peter = 210345e17;
		_lpMin = 1;
		_UniLP = address(0);
		_feeLevel1 = 1e18;
		_feeLevel2 = 5e18;
		_owner = msg.sender;
    }

    // levels: checks caller's balance to determine if they can access a function

    function _uniLPBalance() internal view returns (uint256) {
		IERC20 _LPToken;
		_LPToken = IERC20(_UniLP);
		return _LPToken.balanceOf(msg.sender);
	}
	
    //  Orcas (are you even a dolphin?) - 69 (0.00164%); Can: Snatch tax base
    modifier onlyOrcas() {
        require(_balances[msg.sender] >= _orca, "Eeee! You're not even an orca");
        _;
    }
    
    modifier onlyLPs() {
        require(_UniLP != address(0), "Eeee! The LP contract has not been set");
		require(_uniLPBalance() > _lpMin, "Eeee! You're not even an LP orca");
		_;
    }

    // River Dolphin (what is wrong with your nose?) - 420.69 (1%); Can: turn game on/off
    modifier onlyRiver() {
        require(_balances[msg.sender] >= _river, "You're not even a river dolphin");
        _;
    }

    // Bottlenose Dolphin  (now that's a dolphin) - 2103.45 (5%); Can: Change tax rate (up to 2.5%); Devs can eat (allows dev to withdraw from the dev food bucket)
    modifier onlyBottlenose() {
        require(_balances[msg.sender] >= _bottlenose, "You're not even a bottlenose dolphin");
        _;
    }

    // Flipper (A based dolphin) - 4206.9 (10%); Can: Change levels thresholds (except Flipper and Peter); Change tax rate (up to 10%); Change cooldown time
    modifier onlyFlipper() {
        require(_balances[msg.sender] >= _flipper, "You're not flipper");
        _;
    }

    // Peter the Dolphin (ask Margaret Howe Lovatt) - 21034.5 (50%); Can: Burn the key and hand the world over to the dolphins, and stops feeding the devs
    modifier onlyPeter() {
        require(_balances[msg.sender] >= _peter, "You're not peter the dolphin");
        _;
    }
	
	
    // Are you the dev?
    modifier onlyDev() {
        require(address(msg.sender) == _owner, "You're not the dev, get out of here");
        _;
    }

    // modifiers
    modifier cooledDown() {
        //require(now > (_lastUpdated+_coolDownTime));
        _;
    }

    // functions:
    
    // snatch - grab from snatch pool, requires min 0.01 EEEE in snatchpool -- always free
    function snatchFood() public onlyOrcas cooledDown {
        require(_snatchPool >= 1 * 1e16, "snatchpool: min snatch amount (0.01 EEEE) not reached.");
		_balances[msg.sender] = _balances[msg.sender].add(_snatchPool);
        _snatchPool = 0;
    }
    
    function snatchFoodLP() public onlyLPs cooledDown {
        require(_snatchPool >= 1 * 1e16, "snatchpool: min snatch amount (0.01 EEEE) not reached.");
		_balances[msg.sender] = _balances[msg.sender].add(_snatchPool);
        _snatchPool = 0;
    }
    
    function fundSnatch(uint256 EEEEtoSnatchPool) public {
        _balances[msg.sender] = _balances[msg.sender].sub(EEEEtoSnatchPool);
        _snatchPool = _snatchPool.add(EEEEtoSnatchPool);
    }
    
    function checkSnatching(uint256 EEEEtoSnatchPool) public {
        _balances[msg.sender] = _balances[msg.sender].sub(EEEEtoSnatchPool);
        _snatch(EEEEtoSnatchPool);
    }

    // startGame -- call fee level 1
    function startGame() public onlyRiver cooledDown {
        require(!_gameStarted, "Eeee! The game has already started");
        _balances[msg.sender] = _balances[msg.sender].sub(_feeLevel1);
		_snatch(_feeLevel1);
		_gameStarted = true;
        _lastUpdated = now;
    }

    // endGame -- call fee level 1
    function endGame() public onlyRiver cooledDown {
        require(_gameStarted, "Eeee! The game has already ended");
		_balances[msg.sender] = _balances[msg.sender].sub(_feeLevel1);
		_snatch(_feeLevel1);
        _gameStarted = false;
        _lastUpdated = now;
    }

    // allowDevToEat - can only be turned on once  -- call fee level 1
    function allowDevToEat() public onlyBottlenose {
        require(!_devCanEat, "Eeee! Too late sucker, dev's eating tonight");
		_balances[msg.sender] = _balances[msg.sender].sub(_feeLevel1);
		_snatch(_feeLevel1);
        _devCanEat = true;
		_lastUpdated = now;
    }

    // changeSnatchRate - with max of 3% if Bottlenose; with max of 10% if Flipper -- call fee level 2
    function changeSnatchRate(uint256 newSnatchRate) public onlyBottlenose cooledDown {
        require(newSnatchRate >= 1 && newSnatchRate <= 3, "Eeee! Minimum snatchRate is 1%, maximum is 3% for Bottlenose dolphins or maximum 10% for Flipper");
        _balances[msg.sender] = _balances[msg.sender].sub(_feeLevel2);
		_snatch(_feeLevel2);
		_snatchRate = newSnatchRate;
		_lastUpdated = now;
    }
    
    // changeSnatchRate - with max of 10% if Flipper -- call fee level 2
    function changeSnatchRateHigh(uint256 newSnatchRate) public onlyFlipper cooledDown {
        require(newSnatchRate >= 1 && newSnatchRate <= 10, "Eeee! Minimum snatchRate is 1%, maximum is 3% for Bottlenose dolphins or maximum 10% for Flipper");
        _balances[msg.sender] = _balances[msg.sender].sub(_feeLevel2);
		_snatch(_feeLevel2);
		_snatchRate = newSnatchRate;
		_lastUpdated = now;
    }

    // changeCoolDownTime - make the game go faster or slower, cooldown to be set in hours (min 1; max 24) -- call fee level 2
    function updateCoolDown(uint256 newCoolDown) public onlyFlipper cooledDown {
        require(_gameStarted, "Eeee! You need to wait for the game to cooldown first");
        require(newCoolDown <= 24 && newCoolDown >= 1, "Eeee! Minimum cooldown is 1 hour, maximum is 24 hours");
        _balances[msg.sender] = _balances[msg.sender].sub(_feeLevel2);
		_snatch(_feeLevel2);
		_coolDownTime = newCoolDown * 1 hours;
        _lastUpdated = now;
    }

    // functions to change levels, caller should ensure to calculate this on 1e18 basis -- call fee level 1 * sought change
    function changeSizeWholeEEEE(uint256 currentThreshold, uint256 newThreshold) private pure returns (uint256) {
        return currentThreshold >= newThreshold ? currentThreshold.sub(newThreshold).div(1e18) : newThreshold.sub(currentThreshold).div(1e18);
    }
    
    function updateOrca(uint256 updatedThreshold) public onlyFlipper {
        uint256 changeFee;
        changeFee = changeSizeWholeEEEE(_orca, updatedThreshold).mul(1e18);
        require(_balances[msg.sender] >= changeFee, "Eeee! You don't have enough EEEE to make this change.");
		require(updatedThreshold >= 1e18 && updatedThreshold <= 99e18, "Threshold for Orcas must be 1 to 99 EEEE");
        _orca = updatedThreshold;
		_balances[msg.sender] = _balances[msg.sender].sub(changeFee);
		_snatch(changeFee);
		_lastUpdated = now;
    }
    
    function updateRiver(uint256 updatedThreshold) public onlyFlipper {
        uint256 changeFee;
        changeFee = changeSizeWholeEEEE(_river, updatedThreshold).mul(1e18);
        require(_balances[msg.sender] >= changeFee, "Eeee! You don't have enough EEEE to make this change.");
		require(updatedThreshold >= 1e18 && updatedThreshold <= 210345e16, "Maximum threshold for River Dolphins is 2103.45 EEEE");
        _river = updatedThreshold;
		_balances[msg.sender] = _balances[msg.sender].sub(changeFee);
		_snatch(changeFee);
		_lastUpdated = now;
    }
    
    function updateBottlenose(uint256 updatedThreshold) public onlyFlipper {
        uint256 changeFee;
        changeFee = changeSizeWholeEEEE(_bottlenose, updatedThreshold).mul(1e18);
        require(_balances[msg.sender] >= changeFee, "Eeee! You don't have enough EEEE to make this change.");
		require(updatedThreshold >= 1e18 && updatedThreshold <= 42069e17, "Maximum threshold for River Dolphins is 4206.9 EEEE");
        _bottlenose = updatedThreshold;
		_balances[msg.sender] = _balances[msg.sender].sub(changeFee);
		_snatch(changeFee);
		_lastUpdated = now;
    }

    // dolphinAnarchy - transfer owner permissions to 0xNull & stops feeding dev. CAREFUL: this cannot be undone and once you do it the dolphins swim alone.  -- call fee level 2
    function activateAnarchy() public onlyPeter {
        //Return anything in dev pool to snatchpool
        _balances[msg.sender] = _balances[msg.sender].sub(_feeLevel2);
		_snatch(_feeLevel2);
		_snatchPool = _snatchPool + _devFoodBucket;
        _devFoodBucket = 0;
        _isAnarchy = true; // ends dev feeding
        _owner = address(0);
    }

    // transfers tokens to snatchSupply and fees paid to dev (5%) only when we have not descended into Dolphin BASED anarchy
    function _snatch(uint256 amount) internal {
        // check that the amount is at least 5e-18, otherwise throw it all in the snatchpool
        if (amount >= 5) {
        uint256 devFood;
            devFood = _isAnarchy ? 0 : amount.mul(5).div(100); // 5% put in a food bucket for the contract creator if we've not descended into dolphin anarchy
            uint256 snatchedFood = amount.sub(devFood);
            _snatchPool = _snatchPool.add(snatchedFood);
            _devFoodBucket = _devFoodBucket.add(devFood);
        } else {
            _snatchPool = _snatchPool.add(amount);
        }
    }
    
    // transfer - with send to tax snatch pool
    function _transfer(address sender, address recipient, uint256 amount) internal override {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
 
        // check if sender has balance, then debit sender, execute _snatch, credit receipient
        _balances[sender] = _balances[sender].sub(amount, "ERC20: transfer amount exceeds balance");
        uint256 creditAmount;
        if (_gameStarted) {
            // calculate the taxed amount to be transfered if the game is active
            uint256 snatch_amount;
            snatch_amount = amount.mul(_snatchRate).div(100);
            _snatch(snatch_amount);
            creditAmount = amount.sub(snatch_amount);
        } else {
            creditAmount = amount;
        }
        
        _balances[recipient] = _balances[recipient].add(creditAmount);
        emit Transfer(sender, recipient, creditAmount);
    }
    
    // feedDev - allows owner to withdraw 5% thrown into dev food buck. Must only be called by the Dev.
    function feedDev() public onlyDev {
        require(_devCanEat, "sorry dev, no scraps for you");
        _balances[msg.sender] = _balances[msg.sender].add(_devFoodBucket);
        _devFoodBucket = 0;
    }
	
	// change fees for function calls, can only be triggered by Dev, and then enters cooldown
	function changeFunctionFees(uint256 newFeeLevel1, uint256 newFeeLevel2) public onlyDev {
		_feeLevel1 = newFeeLevel1;
		_feeLevel2 = newFeeLevel2;
		_lastUpdated = now;
	}
	
	function setLP(address addrUniV2LP, uint256 lpMin) public onlyDev {
		_UniLP = addrUniV2LP;
		_lpMin = lpMin;
	}
}