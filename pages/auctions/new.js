import React, { Component } from "react";
import { Form, Input, Message, Button } from "semantic-ui-react";

import web3 from "../../ethereum/web3";
import Layout from "../../components/Layout";

class AuctionNew extends Component {
  state = {
    startTime: "",
    endTime: "",
    approvedBidders: [""],
    errorMessage: "",
    loading: false
  };

  renderApprovedBiddersInput() {
    const approvedBiddersInputs = [];
    for (var i = 0; i < this.state.approvedBidders.length; i++) {
      const bidder = this.state.approvedBidders[i];
      approvedBiddersInputs.push(
        <Form.Field key={i}>
          <Input
            label="Approved Bidder"
            type="text"
            action={{
              content: "Remove Bidder",
              color: "red",
              labelPosition: "right",
              icon: "delete",
              onClick: this.handleRemoveBidder(i)
            }}
            value={bidder}
            onChange={this.onChangeApprovedBidders(i)}
          />
        </Form.Field>
      );
    }

    return approvedBiddersInputs;
  }

  onChangeApprovedBidders = idx => event => {
    let bidders = this.state.approvedBidders.concat();
    bidders[idx] = event.target.value;
    this.setState({ approvedBidders: bidders });
  };

  handleAddBidder = () => {
    this.setState({
      approvedBidders: this.state.approvedBidders.concat([""])
    });
  };

  handleRemoveBidder = idx => () => {
    this.setState({
      approvedBidders: this.state.approvedBidders.filter(
        (s, sidx) => idx !== sidx
      )
    });
  };

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    this.setState({ loading: false });
  };

  render() {
    return (
      <Layout>
        <h3>Configure New Auction</h3>
        <Form onSubmit={this.onSubmit} error={!!this.state.errorMessage}>
          <Form.Field>
            <Input
              label="Start Time"
              type="date"
              icon="calendar"
              onChange={event =>
                this.setState({ startTime: event.target.value })
              }
            />
          </Form.Field>
          <Form.Field>
            <Input
              label="End Time"
              type="date"
              icon="calendar"
              onChange={event => this.setState({ endTime: event.target.value })}
            />
          </Form.Field>
          {this.renderApprovedBiddersInput()}
          <Button onClick={this.handleAddBidder}>Add Another Bidder</Button>
          <Message error header="Error" content={this.state.errorMessage} />
          <Button type="submit" loading={this.state.loading} primary>
            Submit
          </Button>
        </Form>
      </Layout>
    );
  }
}

export default AuctionNew;
