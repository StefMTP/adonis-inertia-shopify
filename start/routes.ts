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

Route.get("/shop/products", "ProductsController.index").middleware(
  "verifySessionToken"
);
Route.post("/shop/products/addTag", "ProductsController.addTag").middleware(
  "verifySessionToken"
);
