import web3 from "ethereum/web3";
import Auction from "ethereum/build/DNAuction.json";

export default address => {
  return new web3.eth.Contract(JSON.parse(Auction.interface), address);
};
