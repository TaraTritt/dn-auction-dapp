const routes = require("next-routes")();

routes
  .add("/auctions/new", "/auctions/new")
  .add("/auctions/:address", "/auctions/show")
  .add("/auctions/:address/add-note", "/auctions/actions/add-note")
  .add("/auctions/:address/notes/:address/place-bid", "/auctions/actions/place-bid")
  .add("/auctions/:address/allocate-bids", "/auctions/actions/allocate-bids")
  .add("/auctions/:address/withdraw-funds", "/auctions/actions/withdraw-funds");

module.exports = routes;
