import React, { Component } from "react";
import { Form, Button, Message } from "semantic-ui-react";

import web3 from "ethereum/web3";
import Auction from "ethereum/contract-instances/auction.contract";
import Layout from "components/Layout";
import AuctionActionHeader from "components/auctions/actions/AuctionActionHeader";

class AuctionWithdrawFunds extends Component {
  state = {
    errorMessage: "",
    successMessage: "",
    loading: false
  };

  static getInitialProps(props) {
    return { auctionAddress: props.query.address };
  }

  withdrawUnallocateFunds = async event => {
    this.setState({ loading: true, errorMessage: "", successMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const auction = Auction(this.props.auctionAddress);

      await auction.methods.withdrawUnAllocatedAmount().send({ from: accounts[0] });

      // reset state
      this.setState({
        successMessage:
          "All unallocated bids have been refunded back to your account at address: " +
          accounts[0] +
          " for the auction at address: " +
          this.props.auctionAddress +
          "."
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <AuctionActionHeader
          auctionAddress={this.props.auctionAddress}
          title="Withdraw Unallocated Funds"
        />
        <Form
          onSubmit={this.withdrawUnallocateFunds}
          error={!!this.state.errorMessage}
          success={!!this.state.successMessage}
        >
          <Message error header="Error" content={this.state.errorMessage} />
          <Message success header="Success" content={this.state.successMessage} />
          <Button type="submit" loading={this.state.loading} primary style={{ marginTop: "13px" }}>
            Withdraw Unallocated Funds
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default AuctionWithdrawFunds;
