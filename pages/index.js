import React, { Component } from "react";
import { Card, Button } from "semantic-ui-react";

import Layout from "../components/Layout";
import contract from "../ethereum/contract";

class AuctionIndex extends Component {
  static async getInitialProps() {
    const auctions = await contract.methods.getDeployedAuctions().call();
    return { auctions };
  }

  renderAuctions() {
    const auctions = this.props.auctions.map(address => {
      return {
        header: address,
        description: <a>View Auction</a>,
        fluid: true
      };
    });

    return <Card.Group items={auctions} />;
  }

  render() {
    return (
      <Layout>
        <h3>Open Auctions</h3>
        {this.renderAuctions()}
      </Layout>
    );
  }
}

export default AuctionIndex;
