import React, { Component } from "react";
import { Form } from "semantic-ui-react";

import web3 from "ethereum/web3";
import Layout from "components/Layout";
import AuctionActionHeader from "components/auctions/actions/AuctionActionHeader";

class AuctionWithdrawFunds extends Component {
  static getInitialProps(props) {
    return { auctionAddress: props.query.address };
  }

  render() {
    return (
      <Layout>
        <AuctionActionHeader
          auctionAddress={this.props.auctionAddress}
          title="Withdraw Unallocated Funds"
        />
      </Layout>
    );
  }
}

export default AuctionWithdrawFunds;
