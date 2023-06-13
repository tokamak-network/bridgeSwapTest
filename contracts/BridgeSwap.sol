// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OnApprove } from "./OnApprove.sol";

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

    //goerli address
    address public ton = 0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00;
    address public wton = 0xe86fCf5213C785AcF9a8BFfEeDEfA9a2199f7Da6;
    // address public l1Token = 0x68c1F9620aeC7F2913430aD6daC1bb16D8444F00;
    address public l2Token = 0x7c6b91D9Be155A6Db01f749217d76fF02A7227F2;
    address public l1Bridge = 0x7377F3D0F64d7a54Cf367193eb74a052ff8578FD;

    event DepositedWTON (
        address sender,
        uint256 wtonAmount,
        uint256 tonAmount
    );

    event DepostiedTON (
        address sender,
        uint256 tonAmount
    );

    constructor() {
        IERC20(ton).approve(
            l1Bridge,
            type(uint256).max
        );
    }

    // function initialize(
    //     address _ton,
    //     address _wton,
    //     address _l1Token,
    //     address _l2Token,
    //     address _l1Bridge
    // ) external {
    //     ton = _ton;
    //     wton = _wton;
    //     l1Token = _l1Token;
    //     l2Token = _l2Token;
    //     l1Bridge = _l1Bridge;
    // }

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
        uint256 len = data.length;
        console.log("approve len : ",len);
        bytes memory uintData = data.slice(0,4);
        uint32 l2GasUsed = uintData.toUint32(0);
        bytes calldata callData = data[4:]; 
        console.log("l2GasUsed : ",l2GasUsed);
        // (uint32 l2gas, bytes memory data1) = _decodeApproveData(data);

        if(msg.sender == address(ton)) {
            _TONDeposit(
                sender,
                amount,
                l2GasUsed,
                callData
            );
        } else if (msg.sender == address(wton)) {
            _WTONDeposit(
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
    function WTONDeposit (
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) external {
        require(IERC20(wton).allowance(msg.sender, address(this)) >= depositAmount, "wton exceeds allowance");
        _WTONDeposit(
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
    function TONDeposit(
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) external {
        _TONDeposit(
            msg.sender,
            depositAmount,
            l2gas,
            data
        );
        // require(IERC20(ton).allowance(msg.sender, address(this)) >= depositAmount, "ton exceeds allowance");
        // IERC20(ton).safeTransferFrom(msg.sender,address(this),depositAmount);
        // uint256 allowAmount = IERC20(ton).allowance(address(this),l1Bridge);
        // if(depositAmount > allowAmount) {
        //     require(
        //         IERC20(ton).approve(
        //             l1Bridge,
        //             type(uint256).max
        //         ),
        //         "ton approve fail"
        //     );
        // }
        // IIL1Bridge(l1Bridge).depositERC20To(
        //     ton,
        //     l2Token,
        //     msg.sender,
        //     depositAmount,
        //     l2gas,
        //     data
        // );

        // emit DepostiedTON(msg.sender, depositAmount);
    }


    /// @notice This function is called when depositing wton in approveAndCall.
    /// @param depositAmount this is wtonAmount
    /// @param l2gas This is the gas value entered when depositing in L2.
    /// @param data It is decoded in approveAndCall and is data in memory form.
    function _WTONDeposit(
        address sender,
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) internal {
        IERC20(wton).safeTransferFrom(sender,address(this),depositAmount);
        IIWTON(wton).swapToTON(depositAmount);
        uint256 tonAmount = _toWAD(depositAmount);
        uint256 allowAmount = IERC20(ton).allowance(address(this),l1Bridge);
        //내가 넣는 TONAmount 보다 allow된게 더 작으면 추가로 approve를 받아야함 
        if(tonAmount > allowAmount) {
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
    function _TONDeposit(
        address sender,
        uint256 depositAmount,
        uint32 l2gas,
        bytes calldata data
    ) internal {
        require(IERC20(ton).allowance(sender, address(this)) >= depositAmount, "ton exceeds allowance");
        IERC20(ton).safeTransferFrom(sender,address(this),depositAmount);
        uint256 allowAmount = IERC20(ton).allowance(address(this),l1Bridge);
        if(depositAmount > allowAmount) {
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

        emit DepostiedTON(msg.sender, depositAmount);
    }

    function _toWAD(uint256 v) internal pure returns (uint256) {
        return v / 10 ** 9;
    }

    // function _decodeApproveData(
    //     bytes memory data
    // ) public pure returns (uint32 gasAmount, bytes memory data1) {
    //     assembly {
    //         gasAmount := mload(add(data, 0x20))
    //         data1 := mload(add(data, 0x40))
    //     }
    // }
}
