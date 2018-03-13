import web3 from "ethereum/web3";
import DiscountNote from "ethereum/build/DiscountNote.json";

export default address => {
  return new web3.eth.Contract(JSON.parse(DiscountNote.interface), address);
};
