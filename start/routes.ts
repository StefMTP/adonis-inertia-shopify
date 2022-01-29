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

Route.group(() => {
  Route.get("/app", "ShopifyAppController.app");
  Route.get("/auth/callback", "ShopifyAppController.auth_callback").middleware([
    "verifyRegEx",
    "verifyState",
  ]);
}).middleware("verifyHmac");
Route.post("/uninstall", "ShopifyAppController.uninstall").middleware(
  "verifyWebhooksHmac"
);

Route.get("/credentials", "ShopifyAppController.credentials");
Route.get("/settings", "ShopifyAppController.settings");

Route.group(() => {
  Route.get("/products", "ProductsController.index");
  Route.group(() => {
    Route.get("/count", "ProductsController.productsCount");
    Route.get("/totalVariants", "ProductsController.totalVariantsCount");
    Route.get("/tags", "ProductsController.allShopProductTags");
    Route.get("tagProducts", "ProductsController.tagProducts");
    Route.post("/editTag", "ProductsController.editTag");
  }).prefix("/products");
  Route.get("/productTypes", "ProductsController.allShopProductTypes");
})
  .prefix("/shop")
  .middleware("verifySessionToken");
