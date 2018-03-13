import React, { Component } from "react";
import { Card, Button, Divider, Table, Grid } from "semantic-ui-react";
import moment from "moment";

import web3 from "ethereum/web3";
import Auction from "ethereum/contract-instances/auction.contract";
import DiscountNote from "ethereum/contract-instances/discount-note.contract";
import Layout from "components/Layout";
import { Link } from "routes";

class AuctionShow extends Component {
  state = {
    userAccount: "",
    userIsApprovedBidder: false,
    userIsAuctionManager: false
  };

  async componentDidMount() {
    const userAccounts = await web3.eth.getAccounts();
    const account = userAccounts[0];
    // see if current user is the auction manager
    const isManager = account === this.props.auctionDetail.auctionManager;
    // see if current user is an approved bidder
    const auction = Auction(this.props.auctionDetail.address);
    const isBidder = await auction.methods.approvedBidders(account).call();

    this.setState({
      userAccount: account,
      userIsAuctionManager: isManager,
      userIsApprovedBidder: isBidder
    });

    auction.events.BidPlaced(
      {
        fromBlock: 0,
        toBlock: "latest"
      },
      function(error, event) {
        console.log(event);
        console.log("fiurst");
      }
    );
  }

  static async getInitialProps(props) {
    const auction = Auction(props.query.address);
    // get auction summary
    let auctionSummary = await auction.methods.getAuctionSummary().call();

    const auctionDetail = {
      address: props.query.address,
      startTime: parseInt(auctionSummary[0]),
      endTime: parseInt(auctionSummary[1]),
      auctionManager: auctionSummary[2],
      stage: parseInt(auctionSummary[3]),
      availableNotes: auctionSummary[4]
    };

    // get summary for all notes added to auction
    let noteDetails = {};
    for (let noteAddress of auctionDetail.availableNotes) {
      let note = DiscountNote(noteAddress);
      let noteSummary = await note.methods.getDiscountNoteSummary().call();
      noteDetails[noteAddress] = {
        availableAmount: parseInt(noteSummary[0]),
        totalPurchasedAmount: parseInt(noteSummary[1]),
        maturityDate: parseInt(noteSummary[2]),
        issuer: noteSummary[3]
      };
    }
    return { auctionDetail, noteDetails };
  }

  renderTable() {
    const { noteDetails } = this.props;
    const { availableNotes } = this.props.auctionDetail;
    const rows = availableNotes.map((noteAddress, index) => {
      const noteDetail = noteDetails[noteAddress];
      return (
        <Table.Row key={index}>
          <Table.Cell>{noteAddress}</Table.Cell>
          <Table.Cell>{noteDetail.availableAmount} Ether</Table.Cell>
          <Table.Cell>{noteDetail.totalPurchasedAmount} Ether</Table.Cell>
          <Table.Cell>
            {moment.unix(noteDetail.maturityDate).format("MM/DD/YYYY, h:mm:ss A")}
          </Table.Cell>
          <Table.Cell>{noteDetail.issuer}</Table.Cell>
          <Table.Cell>
            <Link
              route={`/auctions/${this.props.auctionDetail.address}/notes/${
                this.props.auctionDetail.address
              }/place-bid`}
            >
              <a>
                <Button primary floated="right">
                  Place Bid
                </Button>
              </a>
            </Link>
          </Table.Cell>
        </Table.Row>
      );
    });

    return (
      <Table celled padded>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Available Amount</Table.HeaderCell>
            <Table.HeaderCell>Purchased Amount</Table.HeaderCell>
            <Table.HeaderCell>Maturity Date</Table.HeaderCell>
            <Table.HeaderCell>Issuer Address</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>{rows}</Table.Body>
      </Table>
    );
  }

  renderCards() {
    const { startTime, endTime, auctionManager, stage, availableNotes } = this.props.auctionDetail;

    const now = moment(new Date()); //todays date
    const start = moment.unix(startTime);
    const end = moment.unix(endTime);
    const hoursLeftUntilAuctionOpens = Math.round(moment.duration(start.diff(now)).asHours());
    const hoursLeftUntilAuctionEnds = Math.round(moment.duration(end.diff(start)).asHours());

    let hoursLeft = 0;
    let hoursLeftMessage = "This Auction is over";
    if (hoursLeftUntilAuctionOpens > 0) {
      hoursLeft = hoursLeftUntilAuctionOpens;
      hoursLeftMessage = "This Auction hasn't started yet";
    } else if (hoursLeftUntilAuctionEnds > 0) {
      hoursLeft = hoursLeftUntilAuctionEnds;
      hoursLeftMessage = "This Auction is open";
    }

    let items = [
      {
        header: hoursLeft + " hours",
        meta: "Countdown",
        description: hoursLeftMessage
      },
      {
        header: start.format("MM/DD/YYYY, h:mm:ss A"),
        meta: "Auction Open Time",
        description: "You may start placing bids after the auction opens"
      },
      {
        header: end.format("MM/DD/YYYY, h:mm:ss A"),
        meta: "Auction End Time",
        description: "You may withdraw any unallocated bid amounts once the auction ends"
      }
    ];

    return <Card.Group items={items} itemsPerRow={3} />;
  }

  renderButtons() {
    const button = null;
    const route = `/auctions/${this.props.auctionDetail.address}/`;
    if (this.props.auctionDetail.stage === 0 && this.state.userIsAuctionManager) {
      // auction is not open yet
      return (
        <Link route={route + "add-note"}>
          <a>
            <Button primary floated="right">
              Add Discount Note
            </Button>
          </a>
        </Link>
      );
      // auction is open
    } else if (this.props.auctionDetail.stage === 1 && this.state.userIsApprovedBidder) {
      return;
      // auction is closed
    } else if (this.props.auctionDetail.stage === 2 && this.state.userIsAuctionManager) {
      return (
        <Link route={route + "allocate-bids"}>
          <a>
            <Button primary floated="right">
              Allocate Bids
            </Button>
          </a>
        </Link>
      );
      // bids have been allocated
    } else if (this.props.auctionDetail.stage === 3 && this.state.userIsApprovedBidder) {
      return (
        <Link route={route + "withdraw-funds"}>
          <a>
            <Button primary floated="right">
              Withdraw Unallocated Funds
            </Button>
          </a>
        </Link>
      );
    }

    return button;
  }

  render() {
    return (
      <Layout>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column>
              <h2>Auction Details</h2>
            </Grid.Column>
            <Grid.Column>{this.renderButtons()}</Grid.Column>
          </Grid.Row>
        </Grid>
        {this.renderCards()}
        <Divider />
        <h3>Available Notes</h3>
        {this.renderTable()}
      </Layout>
    );
  }
}

export default AuctionShow;
