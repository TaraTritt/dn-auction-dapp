import web3 from "./web3";
import Contract from "./build/DNAuctionFactory.json";

// get Contract instance
// replace <> with the address of your deployed Contract instance
const instance = new web3.eth.Contract(
  JSON.parse(Contract.interface),
  "0x29635c6510547f4258419Ed2835be8CcC955D4F3"
);

export default instance;
