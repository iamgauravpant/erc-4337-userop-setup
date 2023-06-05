// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

contract AddSubtract {
    uint256 public current = 100;
    function addBy10() public {
        current += 10;
    }
    function subtractBy1() public {
        current -= 1;
    }
}