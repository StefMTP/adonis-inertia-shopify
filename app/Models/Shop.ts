import { DateTime } from "luxon";
import {
  afterFetch,
  afterFind,
  BaseModel,
  beforeSave,
  column,
  computed,
} from "@ioc:Adonis/Lucid/Orm";
import Encryption from "@ioc:Adonis/Core/Encryption";

export default class Shop extends BaseModel {
  // primary key
  @column({ isPrimary: true })
  public id: number;

  // shopify data
  @column()
  public shopifyDomain: string;
  @column()
  public shopName: string;
  @column()
  public host: string;
  @column()
  public owner: string;
  @column()
  public email: string;

  // installation data
  @column()
  public isInstalled: boolean;
  @column()
  public accessToken: string;

  // timestamps
  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;
  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // hooks
  @beforeSave()
  public static encryptToken(shop: Shop) {
    if (shop.accessToken !== "") {
      shop.accessToken = Encryption.encrypt(shop.accessToken);
    }
  }

  @afterFetch()
  public static decryptTokens(shops: Shop[]) {
    for (const shop of shops) {
      shop.accessToken = Encryption.decrypt(shop.accessToken) || "";
    }
  }

  @afterFind()
  public static decryptToken(shop: Shop) {
    shop.accessToken = Encryption.decrypt(shop.accessToken) || "";
  }

  @computed()
  public get isNotProperlyInstalled() {
    return !this.isInstalled || !this.accessToken || this.accessToken === "";
  }
}
