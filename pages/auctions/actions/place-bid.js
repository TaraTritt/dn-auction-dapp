import React, { Component } from "react";
import { Form, Button, Message, Input } from "semantic-ui-react";

import web3 from "ethereum/web3";
import Auction from "ethereum/auction.contract";
import Layout from "components/Layout";
import AuctionActionHeader from "components/auctions/actions/AuctionActionHeader";

class AuctionPlaceBid extends Component {
  state = {
    bidAmount: 0,
    maturityAmount: 0,
    errorMessage: "",
    successMessage: "",
    loading: false
  };

  static getInitialProps(props) {
    return { auctionAddress: props.query.address, noteAddress: props.query.noteAddress };
  }

  placeBid = async event => {
    this.setState({ loading: true, errorMessage: "", successMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const auction = Auction(this.props.auctionAddress);

      await auction.methods
        .placeBid(this.state.maturityAmount, this.props.noteAddress)
        .send({ value: web3.utils.toWei(this.state.bidAmount, "ether"), from: accounts[0] });

      // reset state
      this.setState({
        successMessage:
          "A bid has been placed for the auction at address: " +
          this.props.auctionAddress +
          " for the Discount Note at address " +
          this.props.noteDetails.address
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <AuctionActionHeader auctionAddress={this.props.auctionAddress} title="Place Bid" />
        <Form
          onSubmit={this.placeBid}
          error={!!this.state.errorMessage}
          success={!!this.state.successMessage}
        >
          <Form.Field required>
            <Input
              label="Bid Amount"
              type="number"
              icon="money"
              value={this.state.bidAmount}
              onChange={event => this.setState({ bidAmount: event.target.value })}
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="Maturity Amount"
              type="number"
              icon="money"
              value={this.state.maturityAmount}
              onChange={event => this.setState({ maturityAmount: event.target.value })}
            />
          </Form.Field>
          <Message error header="Error" content={this.state.errorMessage} />
          <Message success header="Success" content={this.state.successMessage} />
          <Button type="submit" loading={this.state.loading} primary style={{ marginTop: "13px" }}>
            Place Bids
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default AuctionPlaceBid;
