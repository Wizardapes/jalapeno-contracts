// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./libs/IBEP20.sol";
import "./libs/SafeBEP20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract JalapenoPresale is Ownable {
    using SafeMath for uint256;
    using SafeBEP20 for IBEP20;

    //===============================================//
    //          Contract Variables                   //
    //===============================================//


    // Start time 03/01/2021 @ 9:00pm (GMT) //
    uint256 public constant PRESALE_START_TIME = 1614632400;

    // Start time 03/02/2021 @ 9:00pm (GMT) //
    uint256 public constant PRESALE_END_TIME = 1614715200;

    uint256 public constant DECIMAL_MULTIPLIER = 10**18;

    //Minimum contribution is 1 BNB
    uint256 public constant MIN_CONTRIBUTION = 1 * DECIMAL_MULTIPLIER;

    //Maximum contribution is 15 BNB
    uint256 public constant MAX_CONTRIBUTION = 15 * DECIMAL_MULTIPLIER;

    //The presale amount to be collected is 100k JLP
    uint256 public constant PRESALE_CAP = 100000 * DECIMAL_MULTIPLIER;

    // Wallet contributions state
    mapping(address => uint256) private _walletContributions;

    // Claimable Jalapenos state
    mapping(address => uint256) private _claimableJalapenos;

    bool private _tokensClaimable = false;

    // Total BNB raised
    uint256 public bnbRaised;

    // Total JLP sold
    uint256 public jalapenosSold;

    // Pointer to the JalapenoToken
    IBEP20 public jalapenoToken;

    // How many Jalapenos do we send per BNB contributed.
    uint256 public jalapenosPerBnb;


    //===============================================//
    //                 Constructor                   //
    //===============================================//
    constructor(
        IBEP20 _jalapenoToken,
        uint256 _jalapenosPerBnb
    ) public Ownable() {
        jalapenoToken = _jalapenoToken;
        jalapenosPerBnb = _jalapenosPerBnb;
    }

    //===============================================//
    //                   Events                      //
    //===============================================//
    event TokenPurchase(
        address indexed beneficiary,
        uint256 bnbAmount,
        uint256 tokenAmount
    );

    event TokenClaim(
        address indexed beneficiary,
        uint256 tokenAmount
    );

    //===============================================//
    //                   Methods                     //
    //===============================================//

    // BUY TOKENS

    /**
     * Main entry point for buying into the Pre-Sale. Contract Receives BNB
     */
    function purchaseTokens() external payable {
        // Validations.
        require(
            msg.sender != address(0),
            "JalapenoPresale: beneficiary is the zero address."
        );

        require(isOpen() == true, "JalapenoPresale: the presale is not open.");

        // Check if we will sell more than the PRESALE_CAP
        require(jalapenosSold.add(_getTokenAmount(msg.value)) <= PRESALE_CAP, "JalapenoPresale: the presale amount is reached.");

        uint256 userContribution = _walletContributions[msg.sender].add(msg.value);
        require(userContribution >= MIN_CONTRIBUTION, "JalapenoPresale: minimum contribution is 1 BNB.");
        require(userContribution <= MAX_CONTRIBUTION, "JalapenoPresale: You cannot buy more than 15 BNB worth of tokens.");

        // Validations passed, buy tokens
        _buyTokens(msg.sender, msg.value);
    }

    /**
     * Function that perform the actual transfer of JLPs
     */
    function _buyTokens(address beneficiary, uint256 bnbAmount) internal {

        // Update how much bnb we have raised
        bnbRaised = bnbRaised.add(bnbAmount);

        // Update how much bnb has this address contributed
        _walletContributions[beneficiary] = _walletContributions[beneficiary].add(bnbAmount);

        // Calculate how many JLPs can be bought with that bnb amount
        uint256 tokenAmount = _getTokenAmount(bnbAmount);

        // Update how much JLP we sold
        jalapenosSold = jalapenosSold.add(tokenAmount);

        _claimableJalapenos[beneficiary] = _claimableJalapenos[beneficiary].add(tokenAmount);

        emit TokenPurchase(beneficiary, bnbAmount, tokenAmount);
    }

    // CLAIM TOKENS

    /**
     * Function that handles the retrieval of purchased tokens, if the sender is eligible to.
     * To be called only after the tokens are set to be claimable by the owner.
     */
    function claimTokens() external {
        // Validations.
        require(
            msg.sender != address(0),
            "JalapenoPresale: beneficiary is the zero address"
        );

        require(areTokensClaimable() == true, "JalapenoPresale: The tokens are not claimable yet.");
        require(_claimableJalapenos[msg.sender] > 0, "JalapenoPresale: There is nothing to claim.");

        // Send tokens to user and update user's state
        _claimTokens(msg.sender);

    }



    /**
     * Function that sends the JLPs to the beneficiary and updates the user's state.
     */
    function _claimTokens(address beneficiary) internal {
        // Transfer the JLP tokens to the beneficiary
        uint256 tokenAmount = _claimableJalapenos[beneficiary];
        _claimableJalapenos[beneficiary] = 0;
        jalapenoToken.safeTransfer(beneficiary, tokenAmount);

        emit TokenClaim(beneficiary, tokenAmount);
    }



    /**
    * Calculate how many JLPs do they get given the amount of BNB.
    */
    function _getTokenAmount(uint256 bnbAmount) internal view returns (uint256)
    {
        return bnbAmount.mul(jalapenosPerBnb);
    }

    /**
     * Get claimable JLP tokens for address
    */
    function getClaimableJalapenosAmount(address user) public view returns (uint256)
    {
        return _claimableJalapenos[user];
    }

    /**
     * Get wallet contributions in BNB for address
    */
    function getBNBContributedAmount(address user) public view returns (uint256)
    {
        return _walletContributions[user];
    }



    // CONTROL FUNCTIONS

    // The presale is open if the transaction made is within the time interval
    function isOpen() public view returns (bool) {
        return now >= PRESALE_START_TIME && now <= PRESALE_END_TIME;
    }

    // Are tokens claimable?
    function areTokensClaimable() public view returns (bool) {
        return _tokensClaimable;
    }

    // Enable retrieval of the tokens. This function will be called by the contract owner once the presale is finished
    // and liquidity is provided in the Liquidity pools.
    function enableTokenRetrieval() public onlyOwner {
        _tokensClaimable = true;
    }

    // Allow the owner to retrieve the remaining tokens
    function takeOutRemainingTokens() public onlyOwner {
        jalapenoToken.safeTransfer(msg.sender, jalapenoToken.balanceOf(address(this)));
    }

    // Allow the owner to retrieve the raised funds
    function takeOutFundingRaised() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

}