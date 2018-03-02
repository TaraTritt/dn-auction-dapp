import React, { Component } from "react";
import { Card, Button, Icon, Grid } from "semantic-ui-react";
import moment from "moment";

import web3 from "../../ethereum/web3";
import Auction from "../../ethereum/auction.contract";
import Layout from "../../components/Layout";

class AuctionShow extends Component {
  static async getInitialProps(props) {
    const auction = Auction(props.query.address);
    let auctionSummary = await auction.methods.getAuctionSummary().call();
    const auctionDetail = {
      startTime: parseInt(auctionSummary[0]),
      endTime: parseInt(auctionSummary[1]),
      auctionManager: auctionSummary[2],
      stage: parseInt(auctionSummary[3])
    };
    const start = moment.unix(auctionDetail.startTime);
    const end = moment.unix(auctionDetail.endTime);
    console.log(start);
    console.log(end);
    return { auctionDetail };
  }

  renderCards() {
    const {
      startTime,
      endTime,
      auctionManager,
      stage
    } = this.props.auctionDetail;
    var now = moment(new Date()); //todays date

    const start = moment.unix(startTime);
    const end = moment.unix(endTime);
    var hoursLeftUntilAuctionOpens = Math.round(
      moment.duration(start.diff(now)).asHours()
    );
    var hoursLeftUntilAuctionEnds = Math.round(
      moment.duration(end.diff(start)).asHours()
    );

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
        description:
          "You may withdraw any unallocated bid amounts once the auction ends"
      }
    ];

    return <Card.Group items={items} itemsPerRow={3} />;
  }

  render() {
    return (
      <Layout>
        <h3>Configure New Auction</h3>
        {this.renderCards()}
      </Layout>
    );
  }
}

export default AuctionShow;
