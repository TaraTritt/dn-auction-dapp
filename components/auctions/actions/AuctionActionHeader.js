import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";

import { Link } from "routes";

export default props => {
  return (
    <div>
      <Grid columns={2}>
        <Grid.Row>
          <Grid.Column>
            <h2>{props.title}</h2>
          </Grid.Column>
          <Grid.Column>
            <Link route={`/auctions/${props.auctionAddress}/`}>
              <a>
                <Button primary floated="right">
                  Go Back to Auction Details
                </Button>
              </a>
            </Link>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <br />
    </div>
  );
};
