/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer''
|
*/

import Route from "@ioc:Adonis/Core/Route";

Route.get("/app", "ShopifyAppController.app").middleware("verifyHmac");
Route.get("/auth/callback", "ShopifyAppController.auth_callback").middleware([
  "verifyHmac",
  "verifyRegEx",
  "verifyState",
]);
Route.get("/credentials", "ShopifyAppController.credentials");
Route.post("/uninstall", "ShopifyAppController.uninstall").middleware(
  "verifyWebhooksHmac"
);

Route.get("/settings", "ShopifyAppController.settings");

Route.get("/shop/products", "ProductsController.index").middleware(
  "verifySessionToken"
);
Route.get(
  "/shop/products/count",
  "ProductsController.productsCount"
).middleware("verifySessionToken");
Route.get(
  "/shop/products/tags",
  "ProductsController.allShopProductTags"
).middleware("verifySessionToken");
Route.post("/shop/products/editTag", "ProductsController.editTag").middleware(
  "verifySessionToken"
);
