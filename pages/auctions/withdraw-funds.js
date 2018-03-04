import React, { Component } from "react";
import { Form } from "semantic-ui-react";

import web3 from "../../ethereum/web3";
import Layout from "../../components/Layout";

class AuctionWithdrawFunds extends Component {
  render() {
    return (
      <Layout>
        <h3>Withdraw Unallocated Funds</h3>
      </Layout>
    );
  }
}

export default AuctionWithdrawFunds;
