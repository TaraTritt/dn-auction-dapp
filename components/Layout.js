import React from "react";
import Head from "next/head";
import { Container } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";

import Header from "./Header";

export default props => {
  return (
    <div style={{ maxWidth: "78%", margin: "auto" }}>
      <Head>
        <title>DN Auction DApp</title>
        <link
          rel="stylesheet"
          href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"
        />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <link rel="icon" href="/static/favicon.ico" />
      </Head>
      <Header />
      {props.children}
    </div>
  );
};
