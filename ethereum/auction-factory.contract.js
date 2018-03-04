import web3 from "./web3";
import AuctionFactory from "./build/DNAuctionFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(AuctionFactory.interface),
  "0x7EbaC0da20592d950932b3b5BB0A1F6d99C2bCe2"
);

export default instance;
