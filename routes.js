const routes = require("next-routes")();

routes
  .add("/auctions/new", "/auctions/new")
  .add("/auctions/:address", "/auctions/show")
  .add("/auctions/:address/add-note", "/auctions/add-note");

module.exports = routes;
