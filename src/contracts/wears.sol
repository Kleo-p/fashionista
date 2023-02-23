// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Fashionista {
    struct Wear {
        address payable creator;
        string name;
        string description;
        string image;
        uint256 amount;
        uint256 stock;
        uint256 discount;

    }

   modifier onlyOwner() {
        require(msg.sender == wear.creator , "Unauthorized access");
        _;
    }

    Wear public wear;


    mapping(uint256 => Wear) internal wears;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    uint256 wearsLength = 0;

   

    function createWear(
        string memory _name,
        string memory _description,
        string memory _image,
        uint256 _amount,
        uint256 _stock,
        uint256 _discount
    ) public onlyOwner {
        wears[wearsLength] = Wear(
            payable(msg.sender),
            _name,
            _description,
            _image,
            _amount,
            _stock,
            _discount
        );
        wearsLength++;
    }

   

    function buy(uint256 _index) public payable {
        require(
            wears[_index].amount > wears[_index].discount,
            "Amount must be greater than discount"
        );
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                wears[_index].creator,
                wears[_index].amount - wears[_index].discount
            ),
            "This transaction could not be performed"
        );

        // update stock
        wears[_index].stock -= 1;
    }

    function change_discount(uint256 _index, uint256 _discount) public {
        require(
            msg.sender == wears[_index].creator,
            "Only creator can use this function"
        );
        wears[_index].discount = _discount;
    }

    function update_stock(uint256 _index, uint256 _stock) public {
        require(
            msg.sender == wears[_index].creator,
            "Only creator can use this function"
        );
        wears[_index].stock = _stock;
    }

    function getWearsLength() public view returns (uint256) {
        return (wearsLength);
    }

    function getWear(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            string memory,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            wears[_index].creator,
            wears[_index].name,
            wears[_index].description,
            wears[_index].image,
            wears[_index].amount,
            wears[_index].stock,
            wears[_index].discount
        );
    }
}
