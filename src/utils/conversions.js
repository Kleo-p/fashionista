import { ERC20_DECIMALS } from "./constants";
import BigNumber from "bignumber.js";

export const base64ToUTF8String = (base64String) => {
    return Buffer.from(base64String, 'base64').toString("utf-8")
}

export const utf8ToBase64String = (utf8String) => {
    return Buffer.from(utf8String, 'utf8').toString('base64')
}

// Truncate is done in the middle to allow for checking of first and last chars simply to ensure correct address
export const truncateAddress = (address) => {
    if (!address) return
    return address.slice(0, 5) + "..." + address.slice(address.length - 5, address.length);
}

export const stringToCUSD = (num) => {
    if (num === 0)return 0
    if (!num) return
    let bigNumber = new BigNumber(num)
    return bigNumber.shiftedBy(-ERC20_DECIMALS).toString();
}

export const CUSDToString = (str) => {
    if (!str) return
    if (str === "0" || str === 0) return 0;
    let bigNumber = new BigNumber(str)
    return bigNumber.shiftedBy(ERC20_DECIMALS).toString();
}