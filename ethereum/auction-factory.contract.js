import web3 from "./web3";
import AuctionFactory from "./build/DNAuctionFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(AuctionFactory.interface),
  "0x774b9Cf5f16d544684518420391013e10276d3e0"
);

export default instance;
