import React, { Component } from "react";
import { Card, Button, Icon, Grid } from "semantic-ui-react";
import moment from "moment";

import web3 from "../ethereum/web3";
import Layout from "../components/Layout";
import auctionFactory from "../ethereum/auction-factory.contract";
import Auction from "../ethereum/auction.contract";
import { Link } from "../routes";

class AuctionIndex extends Component {
  state = {
    userAccount: "",
    userIsFactoryManager: false
  };

  async componentDidMount() {
    const userAccounts = await web3.eth.getAccounts();
    const isFactoryManager = userAccounts[0] === this.props.factoryManager;
    this.setState({
      userAccount: userAccounts[0],
      userIsFactoryManager: isFactoryManager
    });
  }

  static async getInitialProps() {
    const auctions = await auctionFactory.methods.getDeployedAuctions().call();
    let auctionDetails = {};
    for (let auctionAddress of auctions) {
      let auction = Auction(auctionAddress);
      let auctionDetail = await auction.methods.getAuctionSummary().call();
      auctionDetails[auctionAddress] = {
        startTime: parseInt(auctionDetail[0]),
        endTime: parseInt(auctionDetail[1]),
        auctionManager: auctionDetail[2],
        stage: parseInt(auctionDetail[3])
      };
    }
    const factoryManager = await auctionFactory.methods.factoryManager().call();

    return { auctions, auctionDetails, factoryManager };
  }

  renderAuctions() {
    const auctions = this.props.auctions.map(address => {
      let auction = this.props.auctionDetails[address];
      var startTime = moment
        .unix(auction.startTime)
        .format("MM/DD/YYYY, h:mm:ss A");
      var endTime = moment
        .unix(auction.endTime)
        .format("MM/DD/YYYY, h:mm:ss A");

      let auctionInfo = {};

      if (auction.stage === 0) {
        auctionInfo = {
          icon: "warning sign",
          color: "yellow",
          title: "Not Open Yet"
        };
      } else if (auction.stage === 1) {
        auctionInfo = {
          icon: "checkmark",
          color: "green",
          title: "Open"
        };
      } else if (auction.stage === 2) {
        auctionInfo = {
          icon: "remove",
          color: "red",
          title: "Closed"
        };
      } else {
        auctionInfo = {
          icon: "checkmark",
          color: "blue",
          title: "Bids Allocated"
        };
      }

      const extra = (
        <Grid columns={3} divided>
          <Grid.Column key="0">
            <Icon name={auctionInfo.icon} color={auctionInfo.color} />
            {auctionInfo.title}
          </Grid.Column>
          <Grid.Column key="1">
            <Icon name="hourglass start" /> Start Time: {startTime}
          </Grid.Column>
          <Grid.Column key="2">
            <Icon name="hourglass end" /> End Time: {endTime}
          </Grid.Column>
        </Grid>
      );

      return {
        header: address,
        description: (
          <Link route={`/auctions/${address}`}>
            <a>View Auction</a>
          </Link>
        ),
        fluid: true,
        extra: extra
      };
    });

    return <Card.Group items={auctions} />;
  }

  render() {
    return (
      <Layout>
        <h2>Open Auctions</h2>
        {this.renderAuctions()}

        {this.state.userIsFactoryManager && (
          <Link route="/auctions/new">
            <a>
              <Button primary style={{ marginTop: "10px" }}>
                Configure New Auction
              </Button>
            </a>
          </Link>
        )}
      </Layout>
    );
  }
}

export default AuctionIndex;
