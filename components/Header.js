import React from "react";
import { Menu, Icon } from "semantic-ui-react";

import { Link } from "../routes";

export default () => {
  return (
    <Menu style={{ marginTop: "10px" }}>
      <Link route="/">
        <a className="item">
          <Icon name="home" color="blue" size="large" />DN Auction
        </a>
      </Link>
      <Menu.Menu position="right" />
    </Menu>
  );
};
