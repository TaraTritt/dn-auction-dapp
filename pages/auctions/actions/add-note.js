import React, { Component } from "react";
import { Form, Input, Message, Button, Grid } from "semantic-ui-react";
import moment from "moment";

import web3 from "ethereum/web3";
import Auction from "ethereum/contract-instances/auction.contract";
import Layout from "components/Layout";
import AuctionActionHeader from "components/auctions/actions/AuctionActionHeader";

class AuctionAddNote extends Component {
  state = {
    maturityDate: "",
    totalAmount: 0,
    issuer: "",
    errorMessage: "",
    successMessage: "",
    loading: false
  };

  static getInitialProps(props) {
    return { auctionAddress: props.query.address };
  }

  addDiscountNote = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "", successMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      const auction = Auction(this.props.auctionAddress);

      await auction.methods
        .addDiscountNote(
          moment(this.state.maturityDate, "YYYY-MM-DD").unix(),
          this.state.totalAmount,
          this.state.issuer
        )
        .send({
          from: accounts[0]
        });

      // reset state
      this.setState({
        maturityDate: "",
        totalAmount: 0,
        issuer: "",
        approvedBidders: [""],
        successMessage:
          "A new Discount Note has been created to the auction at address: " +
          this.props.auctionAddress +
          ". Go back to the Auction Details page to view it."
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <AuctionActionHeader auctionAddress={this.props.auctionAddress} title="Add Discount Note" />
        <Form
          onSubmit={this.addDiscountNote}
          error={!!this.state.errorMessage}
          success={!!this.state.successMessage}
        >
          <Form.Field required>
            <Input
              label="Maturity Date"
              type="date"
              icon="calendar"
              value={this.state.maturityDate}
              onChange={event => this.setState({ maturityDate: event.target.value })}
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="Total Amount"
              type="number"
              icon="money"
              value={this.state.totalAmount}
              onChange={event => this.setState({ totalAmount: event.target.value })}
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="Issuer Address"
              type="string"
              icon="address card outline"
              value={this.state.issuer}
              onChange={event => this.setState({ issuer: event.target.value })}
            />
          </Form.Field>

          <Message error header="Error" content={this.state.errorMessage} />
          <Message success header="Success" content={this.state.successMessage} />
          <Button type="submit" loading={this.state.loading} primary style={{ marginTop: "13px" }}>
            Add Discount Note
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default AuctionAddNote;
