import web3 from "ethereum/web3";
import AuctionFactory from "ethereum/build/DNAuctionFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(AuctionFactory.interface),
  "0x2aaB15b32086354c5D5012A7b327309ddDCfB1f9"
);

export default instance;
