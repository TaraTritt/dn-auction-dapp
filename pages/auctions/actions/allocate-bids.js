import React, { Component } from "react";
import { Form, Grid } from "semantic-ui-react";

import web3 from "ethereum/web3";
import Layout from "components/Layout";
import AuctionActionHeader from "components/auctions/actions/AuctionActionHeader";

class AuctionAllocateBids extends Component {
  static getInitialProps(props) {
    return { auctionAddress: props.query.address };
  }

  render() {
    return (
      <Layout>
        <AuctionActionHeader
          auctionAddress={this.props.auctionAddress}
          title="Allocate Bids"
        />
      </Layout>
    );
  }
}

export default AuctionAllocateBids;
