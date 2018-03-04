import React, { Component } from "react";
import { Form, Input, Message, Button } from "semantic-ui-react";
import moment from "moment";

import web3 from "../../ethereum/web3";
import auctionFactory from "../../ethereum/auction-factory.contract";
import Layout from "../../components/Layout";

class AuctionNew extends Component {
  state = {
    startDate: "",
    startTime: "17:00", // default times
    endDate: "",
    endTime: "17:00", // default times
    approvedBidders: [""],
    errorMessage: "",
    successMessage: "",
    loading: false
  };

  renderApprovedBiddersInput() {
    const approvedBiddersInputs = [];
    for (var i = 0; i < this.state.approvedBidders.length; i++) {
      const bidder = this.state.approvedBidders[i];
      approvedBiddersInputs.push(
        <Form.Field key={i}>
          <Input
            label="Approved Bidder Address"
            type="text"
            action={{
              content: "Remove Bidder",
              color: "red",
              labelPosition: "right",
              icon: "delete",
              onClick: this.handleRemoveBidder(i)
            }}
            value={bidder}
            onChange={this.handleOnChangeApprovedBidders(i)}
          />
        </Form.Field>
      );
    }

    return approvedBiddersInputs;
  }

  handleOnChangeApprovedBidders = idx => event => {
    let bidders = this.state.approvedBidders.concat();
    bidders[idx] = event.target.value;
    this.setState({ approvedBidders: bidders });
  };

  handleAddBidder = event => {
    event.preventDefault();
    this.setState({
      approvedBidders: this.state.approvedBidders.concat([""])
    });
  };

  handleRemoveBidder = idx => event => {
    event.preventDefault();
    this.setState({
      approvedBidders: this.state.approvedBidders.filter(
        (s, sidx) => idx !== sidx
      )
    });
  };

  handleOnSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "", successMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();

      await auctionFactory.methods
        .createAuction(
          moment(
            this.state.startDate + " " + this.state.startTime,
            "YYYY-MM-DD HH:mm"
          ).unix(),
          moment(
            this.state.endDate + " " + this.state.endTime,
            "YYYY-MM-DD HH:mm"
          ).unix(),
          this.state.approvedBidders
        )
        .send({
          from: accounts[0]
        });

      // reset state
      this.setState({
        startDate: "",
        startTime: "17:00",
        endDate: "",
        endTime: "17:00",
        approvedBidders: [""],
        successMessage:
          "A new Auction has been created. Go the homepage to view it"
      });
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    this.setState({ loading: false });
  };

  handleOnChangeEndTime = value => {
    this.setState({ endTimeOther: value });
  };

  render() {
    const timeFormat = "h:mm:ss A";
    const now = moment()
      .hour(0)
      .minute(0);
    return (
      <Layout>
        <h3>Configure New Auction</h3>
        <Form
          onSubmit={this.handleOnSubmit}
          error={!!this.state.errorMessage}
          success={!!this.state.successMessage}
        >
          <Form.Field required>
            <Input
              label="Start Date"
              type="date"
              icon="calendar"
              value={this.state.startDate}
              onChange={event =>
                this.setState({ startDate: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="Start Time"
              type="text"
              icon="time"
              value={this.state.startTime}
              onChange={event =>
                this.setState({ startTime: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="End Date"
              type="date"
              icon="calendar"
              value={this.state.endDate}
              onChange={event => this.setState({ endDate: event.target.value })}
            />
          </Form.Field>
          <Form.Field required>
            <Input
              label="End Time"
              type="text"
              icon="time"
              value={this.state.endTime}
              onChange={event => this.setState({ endTime: event.target.value })}
            />
          </Form.Field>
          {this.renderApprovedBiddersInput()}
          <Button onClick={this.handleAddBidder}>Add Another Bidder</Button>
          <br />
          <Message error header="Error" content={this.state.errorMessage} />
          <Message
            success
            header="Success"
            content={this.state.successMessage}
          />
          <Button
            type="submit"
            loading={this.state.loading}
            primary
            style={{ marginTop: "13px" }}
          >
            Create Auction
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default AuctionNew;
