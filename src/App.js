import React, { useState, useEffect } from "react";
import Cover from "./components/Cover";
import './App.css';
import Wallet from "./components/Wallet";
import { Container, Nav } from "react-bootstrap";
import Wears from "./components/marketplace/Wears";

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";

import { ERC20_DECIMALS, contractAddress } from "./utils/constants";
import wear from "./contracts/wears.abi.json";

import { Notification } from "./components/utils/Notifications";



const App = function AppWrapper() {

    const [address, setAddress] = useState(null);
    const [name, setName] = useState(null);
    const [balance, setBalance] = useState(0);
    const [contract, setContract] = useState(null);
    const [kit, setKit] = useState(null);

    useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (kit && address) {
      return fetchBalance(address);
    } else {
      console.log("no kit or address");
    }
  }, [kit, address]);

    const connectWallet = async () => {
        if (window.celo) {
            try {
                await window.celo.enable();
                // notificationOff()
                const web3 = new Web3(window.celo);
                let _kit = newKitFromWeb3(web3);

                const accounts = await _kit.web3.eth.getAccounts();
                const user_address = accounts[0];

                _kit.defaultAccount = user_address;

                setAddress(user_address);
                setKit(_kit);
            } catch (error) {
                console.log("There is an error");
                console.log({ error });
            }
        } else {
            console.log("please install the extension");
        }
    };

    const fetchBalance = async (_address) => {
        console.log(kit);
        const balance = await kit.getTotalBalance(address);
        const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);
        console.log(USDBalance);
        const contract = new kit.web3.eth.Contract(
            wear,
            contractAddress
        );
        setContract(contract);
        setBalance(USDBalance);
    };

    const disconnect = () => {
        setAddress(null);
        setName(null);
        setBalance(null);
    };

    return (
        <>
            <Notification />
            <Container fluid="md">
                <Nav className="justify-content-end pt-3 pb-5">
                    <Nav.Item>
                        <Wallet
                            address={address}
                            name={name}
                            amount={balance}
                            disconnect={disconnect}
                            symbol={"CUSD"}
                        />
                    </Nav.Item>
                </Nav>
                <main>
                    <Wears address={address} contract={contract} kit={kit} fetchBalance={fetchBalance} />
                </main>
            </Container>

        </>
    );
}

export default App;
