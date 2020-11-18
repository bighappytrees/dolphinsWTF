
// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

// Adapted from SushiSwap's MasterChef contract
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./eeee.sol";

// snatchFeeder is one of the elements of dolphins.wtf.
// It can be funded (e.g. by her majesty the Cetacean Queen's devs)
// A call to the snatchFeeder can be made *by anyone* to send eeee to the snatchpool
// Once received by the snatchPool, no one can feed from the snatchPool during the cooldown period (1 hour)
// Calls to the snatchFeeder can only be made once per hour.

contract snatchFeeder is Ownable {
    using SafeMath for uint256;

    eeee    public _eeee;
    uint256 public _coolDownTime;
    uint256 public _feedAmount;
    bool    public _snatchingStarted;
    uint256 public _feedStock;
    uint256 public _lastUpdated;

    event Deposit(address indexed user, uint256 amount);
    event FundSnatch(address indexed user, uint256 amount);

    constructor (eeee dolphinToken) public {
        _eeee = dolphinToken;
        _coolDownTime = 1 hours;
        _feedAmount = 69e16; //0.69 EEEE released per snatch
        _snatchingStarted = false;
    }

    modifier snatchingStarted() {
        require(_snatchingStarted, "you must wait for snatching to begin");
        _;
    }

    modifier cooledDown() {
        require(now > (_lastUpdated+_coolDownTime), "you must wait one hour for the fundSnatch feature to cooldown");
        _;
    }

    function deposit(uint256 _amount) public {
        if(_amount > 0) {
            _eeee.transferFrom(address(msg.sender), address(this), _amount);
            _feedStock = _feedStock.add(_amount);
        }
        emit Deposit(msg.sender, _amount);
    }

    function fundSnatch() public snatchingStarted cooledDown {
        require(_feedStock > 0, 'The funds have been fully snatched');
        if(_feedStock >= _feedAmount) {
            _eeee.fundSnatch(_feedAmount);
            _feedStock = _feedStock.sub(_feedAmount);
        } else {
            _eeee.fundSnatch(_feedStock);
            _feedStock = _feedStock.sub(_feedStock);
        }
        emit FundSnatch(msg.sender, _feedStock);
    }

    function startSnatching() public onlyOwner {
        _snatchingStarted = true;
    }

    function endSnatching() public onlyOwner {
        _snatchingStarted = false;
    }


}