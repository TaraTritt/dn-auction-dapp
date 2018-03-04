import web3 from "./web3";
import DiscountNote from "./build/DiscountNote.json";

export default address => {
  return new web3.eth.Contract(JSON.parse(DiscountNote.interface), address);
};
