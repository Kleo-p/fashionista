import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import AddWear from "./AddWear";
import Wear from "./Wear";
import Loader from "../utils/Loader";
import { NotificationError, NotificationSuccess } from "../utils/Notifications";
import PropTypes from "prop-types";
import { Row } from "react-bootstrap";
import IERC20 from '../../contracts/IERC20.abi.json';
import { contractAddress, cUSDContractAddress } from "../../utils/constants";
import { CUSDToString, stringToCUSD } from "../../utils/conversions";
import { RegisteredContracts } from "@celo/contractkit";
import { privateEncrypt } from "crypto";

const Wears = ({ address, contract, kit, fetchBalance }) => {
    const [wears, setWears] = useState([]);
    const [loading, setLoading] = useState(false);

    const getWears = async () => {
        setLoading(true)
        try {
            console.log(address, contract)
            const wearsLength = await contract.methods.getWearsLength().call();
            console.log(wearsLength)
            const _wears = [];

            for (let index = 0; index < wearsLength; index++) {
                let _wear = new Promise(async (resolve, reject) => {
                    try {
                        let wear = await contract.methods.getWear(index).call();
                        resolve({
                            index: index,
                            creator: wear[0],
                            name: wear[1],
                            description: wear[2],
                            image: wear[3],
                            amount: wear[4],
                            stock: wear[5],
                            discount: wear[6]
                        });
                    } catch (error) {
                        console.log(error);
                    }
                });
                _wears.push(_wear);
            }
            const wears = await Promise.all(_wears);
            setWears(wears)
            console.log(wears)
        } catch (error) {
            console.log(error)
            toast(< NotificationError text="Failed to get a wear." />);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if(contract)getWears();
    }, [contract]);

    const createWear = async (data) => {
        
        const { name, description, image, price, stock, discount } = data;
        console.log(name, description, image, price, stock, discount)
        setLoading(true);
        try {
            await contract.methods.createWear(name, description, image, price, parseInt(stock), discount)
                .send({ from: address });
            toast(<NotificationSuccess text="Wear added successfully." />);
            getWears();
            fetchBalance(address);
        } catch (error) {
            console.log(error);
            toast(<NotificationError text="Failed to create a wear." />);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const buyWear = async (wear, amount) => {
        const cUSDContract = new kit.web3.eth.Contract(IERC20, cUSDContractAddress);
        console.log(amount);
        setLoading(true);
        try {
            if(amount === 0){
                toast(<NotificationSuccess text="Cant buy for 0 cUSD" />);
                return;
            }
            await cUSDContract.methods
                .approve(contractAddress, amount.toString())
                .send({ from: address });
            await contract.methods.buy(wear.index).send({ from: address })
            toast(<NotificationSuccess text="Wear bought successfully" />);
            getWears();
            fetchBalance(address);
        } catch (error) {
            console.log(error)
            toast(<NotificationError text="Failed to purchase wear." />);
            setLoading(false);
        } finally {
            setLoading(false);
        }

    };

    const changeDiscount = async (wear, discount) => {
        setLoading(true);
        try {
            await contract.methods.change_discount(wear.index, discount)
                .send({ from: address });
            toast(<NotificationSuccess text="changed wear discount successfully" />);
            getWears();
            fetchBalance(address);
        } catch (error) {
            console.log(error);
            toast(<NotificationError text="Failed to Change discount." />);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const updateStock = async (wear, stock) => {
        setLoading(true);
        try {
            await contract.methods.update_stock(wear.index, stock)
                .send({ from: address });
            toast(<NotificationSuccess text="Update stock successfully" />);
            getWears();
            fetchBalance(address);
        } catch (error) {
            console.log(error);
            toast(<NotificationError text="Failed to update stock." />);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return <Loader />;
    }
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="fs-4 fw-bold mb-0">Fashionista</h1>
                <AddWear createWear={createWear} />
            </div>
            <Row xs={1} sm={2} lg={3} className="g-3 mb-5 g-xl-4 g-xxl-5">
                <>
                    {wears.map((wear, index) => (
                        <Wear
                            address={address}
                            wear={wear}
                            buyWear={buyWear}
                            updateStock={updateStock}
                            changeDiscount={changeDiscount}
                            key={index}
                        />
                    ))}
                </>
            </Row>
        </>
    );
};

Wears.propTypes = {
    address: PropTypes.string.isRequired,
    fetchBalance: PropTypes.func.isRequired
};

export default Wears;
