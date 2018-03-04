// solidity version
pragma solidity ^0.4.18;

// 'contract' has similarities to 'class' in other languages
contract DNAuctionFactory {
    // The keyword "public" makes those variables readable from outside 
    // Any public variables will have a getter function automatically created - called deployedAuctions
    // However the getter functions for arrays only allow returning the address at a single index i.e. deployedAuctions[1]
    address[] public deployedAuctions;
    address public factoryManager;

    function createAuction(uint _startTime, uint _endTime, address[] _approvedBidders) public {
        address newAuction = new DNAuction(_startTime, _endTime, _approvedBidders, msg.sender);
        deployedAuctions.push(newAuction);
        factoryManager = msg.sender; // only original account that creates this factory is the manager
    }
    
    function getDeployedAuctions() public view returns(address[]) {
        return deployedAuctions;
    }

    function changeFactoryManager(address newFactoryManager) public {
        require(msg.sender == factoryManager);
        factoryManager = newFactoryManager;
    }
    
}

contract DNAuction {
    // storage variables
    // storage variables are local state variables stored with the contract instance
    
    uint public startTime;
    uint public endTime;
    
    // 0 index is reserved to check for non approved traders
	mapping (address => uint) public approvedBidders;
    mapping (address => Bid[]) private bids; 
    address[] public availableNotes;
    
    address public auctionManager;
    
    struct Bid {
		address bidder;
	    // all amounts are measured in wei, not ether
	    uint amount;
	    uint maturityAmount;
	    // percent*100 since fixed point numbers are not fully supported by Solidity
	    uint discountRate;
	    uint allocatedAmount;
	    bool refunded;
	}
    
    enum Stages {
        AuctionNotOpenYet,//0
        AuctionOpen,//1
        AuctionClosed,//2
        BidsAllocated//3
    }
    
    function nextStage() internal {
        stage = Stages(uint(stage) + 1);
    }   
    
    // modifiers
    // modifiers validate inputs to functions such as minimal balance or user authentication
    
    modifier timedTransitions() {
        if (stage == Stages.AuctionNotOpenYet &&
                now > startTime)
            nextStage();
        if (stage == Stages.AuctionOpen &&
                now > endTime)
            nextStage();
        _;
    }
    
    // This is the current stage. Set initial state to auction not open yet
    Stages public stage = Stages.AuctionNotOpenYet;
    
    modifier atStage(Stages _stage) {
        require(stage == _stage);
        _;
    }
    
    modifier managerOnly() {
        require(msg.sender == auctionManager);
        _;
    }
    
    modifier onlyApprovedBidders {
        require(approvedBidders[msg.sender] != 0);
	    _;
    }
    
    // DnAuction constructor
    function DNAuction(uint _startTime, uint _endTime, address[] _approvedBidders, address _auctionManager) public {
        startTime = _startTime;
        endTime = _endTime;
        // 0 index is reserved to check for non approved bidders since it is the default of uint
        for (uint j = 0; j < _approvedBidders.length; j++) {
            approvedBidders[_approvedBidders[j]] = j+1;
        }
        auctionManager = _auctionManager;
    }

    function getAuctionSummary() public view returns(uint, uint, address, uint, address[]) {
        return (
            startTime,
            endTime, 
            auctionManager,
            uint(stage),
            availableNotes
        );
    }

    function updateStage() public timedTransitions { }

    function addDiscountNote(uint _maturityDate, uint _totalAmount, address _issuer) public timedTransitions atStage(Stages.AuctionNotOpenYet) managerOnly {
        address discountNote = new DiscountNote(_maturityDate, _totalAmount, _issuer, msg.sender);
        availableNotes.push(discountNote);
    }
    
    function getAvailableNotes() public view returns(address[]) {
        return availableNotes;
    }
    
    function placeBid(uint _maturityAmount, address _discountNote) public payable timedTransitions atStage(Stages.AuctionOpen) onlyApprovedBidders {
        uint oneEther = 1 ether;
	    uint maturityAmountToEther = _maturityAmount * oneEther;
	    require(msg.value < maturityAmountToEther);
        Bid memory bid = Bid({
            bidder: msg.sender,
            amount: msg.value,
            maturityAmount: _maturityAmount,
            discountRate: ((maturityAmountToEther - msg.value)/(msg.value/100)),
            allocatedAmount: 0,
            refunded: false
        });
        
        Bid[] memory bidsForNote = bids[_discountNote];
        Bid[] storage bidsUpdated = bids[_discountNote];
        
        // Sort bids as they are added to prevent a costly allocateBids() execution
        
        // Define a variable to indicate that if a property location is found.
        bool found = false;
        // Define a variable to store an index for insert
        uint indexToInsert = 0;
        for (uint i = 0; i < bidsForNote.length; i++) {
             if ( !found && bid.discountRate < bidsForNote[i].discountRate) {
                 found = true;
                 indexToInsert = i;
                 bidsUpdated[indexToInsert] = bid;
                 i--;
             } else {
                 // if adding bid to end of array then push to array
                 if (found && i+1 == bidsUpdated.length) {
                     bidsUpdated.push(bidsForNote[i]);
                 } else if (found) {
                     bidsUpdated[i+1] = bidsForNote[i]; 
                 } else {
                     bidsUpdated[i] = bidsForNote[i];
                 }
    
             }
        }
        
        // no bids in array, so push bid to end of array
        if (!found) {
            indexToInsert = bidsForNote.length;
            bidsUpdated.push(bid);
        }

    }
    
    function allocateBids() public managerOnly timedTransitions atStage(Stages.AuctionClosed) returns(bool) {
        // allocate bids
        for (uint i = 0; i < availableNotes.length; i++) {
            Bid[] storage bidsForNote = bids[availableNotes[i]];
            DiscountNote note = DiscountNote(availableNotes[i]);
            uint amountRemaining = note.availableAmount();
            uint amountToSendToIssuer = 0;
            for (uint j = 0; j < bidsForNote.length; j++) {
                Bid storage tmpBid = bidsForNote[j];
                // bid amount is <= to the amount remaining in the selected note, so the full bid can be allocated
                if (tmpBid.amount <= amountRemaining) {
                    tmpBid.allocatedAmount = tmpBid.amount;

                    amountToSendToIssuer += tmpBid.allocatedAmount;
                    amountRemaining -= tmpBid.amount;
                    note.setAllocation(tmpBid.allocatedAmount, tmpBid.maturityAmount, tmpBid.bidder);
                // bid amount is > to the amount remaining in the selected note, so allocate to bid the full amount remaining
                } else if (0 < amountRemaining) {
                    tmpBid.allocatedAmount = amountRemaining;
     
                    amountToSendToIssuer += amountRemaining;
                    // rest of amount allocated - set to 0
                    amountRemaining = 0;
                    note.setAllocation(tmpBid.allocatedAmount, tmpBid.maturityAmount * ((tmpBid.amount - tmpBid.allocatedAmount) / tmpBid.amount), tmpBid.bidder);
                } // else {} the amountRemaining == 0, which the default so nothing needs to be done
            }
            
            // send funds to note issuers
            if (!note.issuer().send(amountToSendToIssuer)) {
                // reset all allocated and unallocated amounts since transfer failed if above evaluates to true
                for(uint m = 0; m < bidsForNote.length; m++) {
                    Bid storage tmpBid2 = bidsForNote[m];
                    // reset allocatedAmount
                    tmpBid2.allocatedAmount = 0;
                    
                    // reset note allocation for bid
                    note.setAllocation(0, 0, tmpBid2.bidder);
                }
                return false;
            }
            
            // set total amount of note purchased / allocated
            note.setTotalPurchasedAmount(amountToSendToIssuer);
            // manually go to next state - BidsAllocated
            nextStage();
            return true;

        }
    
    }
    
    // Using Withdrawal pattern
    // If refunded no allocated amounts in allocateBids() an attacker could trap the contract into an unusable state by causing richest to be the address of a contract that has a fallback function which fails (e.g. by using revert() or by just consuming more than the 2300 gas stipend).
    // Using the withdrawal pattern the attacker can only cause his or her own withdraw to fail and not the rest of the contract’s workings.
    // withdrawal pattern also allows for seperation of concerns
    function withdrawUnAllocatedAmount() atStage(Stages.BidsAllocated) onlyApprovedBidders public returns (bool) {
        uint amountToRefund = 0;
        Bid[] storage bidsBySender;
        for (uint i = 0; i < availableNotes.length; i++) {
            address noteAddress = availableNotes[i];
            Bid[] storage bidsForNote = bids[noteAddress];
            for (uint j = 0; j < bidsForNote.length; j++) {
                Bid storage tmpBid = bidsForNote[j];
                if (tmpBid.bidder == msg.sender) {
                    bidsBySender.push(tmpBid);
                    amountToRefund += tmpBid.amount - tmpBid.allocatedAmount;
                }
            }
        }
        
        if (amountToRefund > 0) {
            // It is important to set unallocatedAmountToRefund to 0 first because the recipient
            // can call this function again as part of the receiving call
            // before `send` returns.
            for (uint m = 0; m < bidsBySender.length; m++) {
                bidsBySender[m].refunded = true;
            }

            if (!msg.sender.send(amountToRefund)) {
                // No need to call throw here, just reset the amount that need to still refund
                for (uint n = 0; n < bidsBySender.length; n++) {
                    bidsBySender[n].refunded = false;
                }
                return false;
            }
        }
        return true;
    }
}

contract DiscountNote {
    uint public availableAmount;
    uint public totalPurchasedAmount;
    uint public maturityDate;
    
    struct Allocation {
        uint purchasedAmount;
        uint maturityAmount;
        bool withdrawnAtMaturity;
    }
    
    mapping(address => Allocation) public allocations;
    address[] public owners;
    
    address public issuer;
    address public auctionManager;
    
    modifier issuerOnly() {
        require(msg.sender == issuer);
        _;
    }
    
    modifier auctionManagerOnly() {
        require(msg.sender == issuer);
        _;
    }
    
    modifier afterMaturity() {
        require(now >= maturityDate);
        _;
    }
    
    function DiscountNote(uint _maturityDate, uint _amount, address _issuer, address _auctionManager) public {
        maturityDate = _maturityDate;
        availableAmount = _amount;
        totalPurchasedAmount = 0;
        
        issuer = _issuer;
        auctionManager = _auctionManager;
    }

    function getDiscountNoteSummary() public view returns(uint, uint, uint, address) {
        return (
            availableAmount,
            totalPurchasedAmount, 
            maturityDate,
            issuer
        );
    }
    
    function setAllocation(uint _purchasedAmount, uint _maturityAmount, address _owner) public auctionManagerOnly {
        Allocation memory allocation = Allocation({
            purchasedAmount: _purchasedAmount,
            maturityAmount: _maturityAmount,
            withdrawnAtMaturity: false
        });
        
        allocations[_owner] = allocation;
        owners.push(_owner);
    }
    
    function setTotalPurchasedAmount(uint _totalPurchasedAmount) public auctionManagerOnly {
        totalPurchasedAmount = _totalPurchasedAmount;
    }
    
    function depositAtMaturity() public issuerOnly payable {
        require(msg.value > 0);
    }
    
    function withdrawAtMaturity() public afterMaturity returns(bool) {
        Allocation storage allocation = allocations[msg.sender];
        require(this.balance >= allocation.maturityAmount);
        allocation.withdrawnAtMaturity = true;
        if (!msg.sender.send(allocation.maturityAmount)) {
            // reset withdrawAtMaturity if send fails
            allocation.withdrawnAtMaturity = false;
            return false;
        }
        
        return true;
    }
}