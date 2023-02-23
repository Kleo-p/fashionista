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

    //sruct for the fashion wear
    struct Wear {
        address payable creator;
        string name;
        string description;
        string image;
        uint256 amount;
        uint256 stock;
        uint256 discount;
    }

    //address of the token contract
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    //track total number of fashion wear stored
    uint256 wearsLength = 0;

    //mapping for the Wear
    mapping(uint256 => Wear) internal wears;

    //modifier for fashion creator

    modifier onlyOwner(uint _index){
       require(
            msg.sender == wears[_index].creator,
            "Only creator can use this function"
        );
        _;
    }

    //creator stores fashion wear in the smart contract.
    function createWear(
        string calldata _name,
        string calldata _description,
        string calldata _image,
        uint256 _amount,
        uint256 _stock,
        uint256 _discount
    ) public {

        require(bytes(_name).length > 0,"input is invalid");
        require(bytes(_description).length > 0,"input is invalid");
        require(bytes(_image).length > 0,"input is invalid");
        require(_amount > 0,"input is invalid");
        require(_stock > 0,"input is invalid");
        require(_amount > _discount,"input is invalid");

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

    //buy fashion wear from the creator
    function buy(uint256 _index) public payable {
        Wear memory _wear = wears[_index];
        
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                _wear.creator,
                 _wear.amount - _wear.discount
            ),
            "This transaction could not be performed"
        );
        // update stock
        _wear.stock -= 1;
    }


    //change discount for the fashion wear
    function change_discount(uint256 _index, uint256 _discount) public onlyOwner(_index) {
        wears[_index].discount = _discount;
    }

    //update stock number for a specific fashion wear.
    function update_stock(uint256 _index, uint256 _stock) public onlyOwner(_index){
        wears[_index].stock = _stock;
    }


    //track number of fashion wear.
    function getWearsLength() public view returns (uint256) {
        return wearsLength;
    }

    //retrieve specific fashion wear 
    function getWear(uint256 _index) public view returns (Wear memory){
        return wears[_index];
    }

    // delete the wear from the contract
    function deleteWear(uint _index) public onlyOwner(_index){
        delete wears[_index];
    }



}
