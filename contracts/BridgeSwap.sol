// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uncomment this line to use console.log
import "hardhat/console.sol";

interface IIWTON {
    function swapToTON(uint256 wtonAmount) external returns (bool);
    function swapFromTON(uint256 tonAmount) external returns (bool);
}

interface IIL1Bridge {
    function depositERC20To(
        address _l1Token,
        address _l2Token,
        address _to,
        uint256 _amount,
        uint32 _l2Gas,
        bytes calldata _data
    ) external;
}

contract BridgeSwap {
    using SafeERC20 for IERC20;

    address payable public owner;

    address public ton;
    address public wton;
    address public l1Token;
    address public l2Token;
    address public l1Bridge;

    uint32 l2Gas = 1300000;

    constructor()  {
    }

    function initialize(
        address _ton,
        address _wton,
        address _l1Token,
        address _l2Token,
        address _l1Bridge
    ) external {
        ton = _ton;
        wton = _wton;
        l1Token = _l1Token;
        l2Token = _l2Token;
        l1Bridge = _l1Bridge;
    }

    function swapAndDeposit(
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) external {
        uint256 wtonAmount = _toRAY(depositAmount);
        uint256 allowanceAmount = IERC20(wton).allowance(msg.sender, address(this));
        console.log(allowanceAmount);
        console.log("-----------");
        console.log(wtonAmount);
        require(allowanceAmount >= wtonAmount, "wton exceeds allowance");
        IERC20(wton).safeTransferFrom(msg.sender,address(this),wtonAmount);
        IIWTON(wton).swapToTON(wtonAmount);
        IERC20(ton).approve(l1Bridge,depositAmount);
        IIL1Bridge(l1Bridge).depositERC20To(
            l1Token,
            l2Token,
            msg.sender,
            depositAmount,
            l2gas,
            data
        );
    }

    function _toRAY(uint256 v) internal pure returns (uint256) {
        return v * 10 ** 9;
    }
}
