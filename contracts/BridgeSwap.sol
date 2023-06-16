// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OnApprove } from "./OnApprove.sol";

import { Address } from "@openzeppelin/contracts/utils/Address.sol";

import "./libraries/BytesLib.sol";

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

contract BridgeSwap is OnApprove {
    using SafeERC20 for IERC20;
    using BytesLib for bytes;

    address public ton;
    address public wton;
    address public l2Token;
    address public l1Bridge;

    event DepositedWTON (
        address sender,
        uint256 wtonAmount,
        uint256 tonAmount
    );

    event DepositedTON (
        address sender,
        uint256 tonAmount
    );

    constructor(
        address _ton,
        address _wton,
        address _l2Token,
        address _l1Bridge
    ) {
        ton = _ton;
        wton = _wton;
        l2Token = _l2Token;
        l1Bridge = _l1Bridge;

        IERC20(ton).approve(
            l1Bridge,
            type(uint256).max
        );
    }

    /// @notice calling approveAndCall in wton and ton.
    /// @param sender sender is msg.sender requesting approveAndCall.
    /// @param amount If it is called from TONContract, it is TONAmount, and if it is called from WTONContract, it is WTONAmount.
    /// @param data The first 64 digits of data indicate the l2gas value, and the next 64 digits indicate the data value.
    /// @return Whether or not the execution succeeded
    function onApprove(
        address sender,
        address,
        uint256 amount,
        bytes calldata data
    ) external override returns (bool) {
        require(msg.sender == address(ton) || msg.sender == address(wton), "only TON and WTON");
        bytes memory uintData = data.slice(0,4);
        uint32 l2GasUsed = uintData.toUint32(0);
        bytes calldata callData = data[4:]; 

        if(msg.sender == address(ton)) {
            _depositTON(
                sender,
                amount,
                l2GasUsed,
                callData
            );
        } else if (msg.sender == address(wton)) {
            _depositWTON(
                sender,
                amount,
                l2GasUsed,
                callData
            );
        }

        return true;
    }

    /// @notice This function is called after approve or permit is done in advance.
    /// @param depositAmount this is wtonAmount.
    /// @param l2gas This is the gas value entered when depositing in L2.
    /// @param data This is the data value entered when depositing into L2.
    function depositWTON (
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) external {
        require(IERC20(wton).allowance(msg.sender, address(this)) >= depositAmount, "wton exceeds allowance");
        _depositWTON(
            msg.sender,
            depositAmount,
            l2gas,
            data
        );
    }


    /// @notice This function is called after approve or permit is done in advance.
    /// @param depositAmount this is tonAmount
    /// @param l2gas This is the gas value entered when depositing in L2.
    /// @param data This is the data value entered when depositing into L2.
    function depositTON(
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) external {
        require(IERC20(ton).allowance(msg.sender, address(this)) >= depositAmount, "ton exceeds allowance");
        _depositTON(
            msg.sender,
            depositAmount,
            l2gas,
            data
        );
    }


    /// @notice This function is called when depositing wton in approveAndCall.
    /// @param depositAmount this is wtonAmount
    /// @param l2gas This is the gas value entered when depositing in L2.
    /// @param data It is decoded in approveAndCall and is data in memory form.
    function _depositWTON(
        address sender,
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) internal {
        require(!Address.isContract(sender),"sender is contract");
        IERC20(wton).safeTransferFrom(sender,address(this),depositAmount);
        IIWTON(wton).swapToTON(depositAmount);
        uint256 tonAmount = _toWAD(depositAmount);
        if(tonAmount > IERC20(ton).allowance(address(this),l1Bridge)) {
            require(
                IERC20(ton).approve(
                    l1Bridge,
                    type(uint256).max
                ),
                "ton approve fail"
            );
        }
        IIL1Bridge(l1Bridge).depositERC20To(
            ton,
            l2Token,
            sender,
            tonAmount,
            l2gas,
            data
        );

        emit DepositedWTON(sender, depositAmount, tonAmount);
    }

    
    /// @notice This function is called when depositing ton in approveAndCall.
    /// @param depositAmount this is tonAmount
    /// @param l2gas This is the gas value entered when depositing in L2.
    /// @param data It is decoded in approveAndCall and is data in memory form.
    function _depositTON(
        address sender,
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) internal {
        require(!Address.isContract(sender),"sender is contract");
        IERC20(ton).safeTransferFrom(sender,address(this),depositAmount);
        if(depositAmount > IERC20(ton).allowance(address(this),l1Bridge)) {
            require(
                IERC20(ton).approve(
                    l1Bridge,
                    type(uint256).max
                ),
                "ton approve fail"
            );
        }
        IIL1Bridge(l1Bridge).depositERC20To(
            ton,
            l2Token,
            sender,
            depositAmount,
            l2gas,
            data
        );

        emit DepositedTON(sender, depositAmount);
    }

    function _toWAD(uint256 v) internal pure returns (uint256) {
        return v / 10 ** 9;
    }
}
