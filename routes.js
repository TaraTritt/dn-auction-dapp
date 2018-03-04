const routes = require("next-routes")();

routes
  .add("/auctions/new", "/auctions/new")
  .add("/auctions/:address", "/auctions/show")
  .add("/auctions/:address/add-note", "/auctions/add-note")
  .add("/auctions/:address/place-bid", "/auctions/place-bid")
  .add("/auctions/:address/allocate-bids", "/auctions/allocate-bids")
  .add("/auctions/:address/withdraw-funds", "/auctions/withdraw-funds");

module.exports = routes;
