import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Store } from "../entity/Store";
import {
  extractLanguageAndCountry,
  getTableForLanguage,
  isLangauageFormated,
} from "../services/CouponLangaugeService";
import { Coupon } from "../entity/Coupon";

import { convertToArray } from "../services/Helpers";
import { StoreMd } from "../entity/StoreMd";
import { fillMetadatVariables } from "../services/StoreService";
import { Redis } from "ioredis"

export class StoresController {
  private storesWebRepository = AppDataSource.getRepository(Store);
  private couponsWebRepository = AppDataSource.getRepository(Coupon);
  client:Redis = new Redis();
  /**
   * Retrieve all stores for a specific language.
   *
   * @param {Request} _request - The request object.
   * @param {NextFunction} _next - The next function.
   * @param {Response} _response - The response object.
   * @return {Promise<Object[] | string>} An array of mapped stores or an error message.
   */
  async all(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object[] | string> {
    // Destructure the query parameters from the request

   
    const {
      query: { page, perPage },
    } = _request;
    // Check if the language code is formatted correctly
    if (!isLangauageFormated(_request.params.ln)) {
      // Return an error message if the language code is invalid
      return "invalid language code";
    }

    const { table, country, statusCode } = await this.getTableAndCountry(
      _request.params.ln
    );

    // Return an error message if the language is not found
    if (!country) {
      return "Store language not found";
    }

    // Return an error message if the language is not found
    if (table === "none" || statusCode !== 200) {
      return "Coupon language not found";
    }

    

    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      // Calculate the limit and offset for pagination
      const limit = Number(perPage);
      const offset = (Number(page) - 1) * limit;

      // Retrieve the stores from the repository
      const stores = await this.storesWebRepository
        .createQueryBuilder('store')
        .where('"countryAlpha2Code" = :country', { country })
        .select(['store.id', 'store.store', 'store.description','store.icon','store.keywords']) 
        .take(limit)
        .offset(offset)
        .getMany();

      stores.map((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      stores.forEach(async (store) => {
        const coupons = await this.checkRedisCacheForStoreCoupons(`${country}_store_${store.id}_coupons`,store.store,table);
        store.coupons = coupons;
      });

      return stores;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }
  checkRedisCacheForStoreCoupons = async (key: string,storeName:string,table:string) => {
    const cachedValue = await this.client.get(key);

    if (cachedValue) {
      console.log("Cache hit");
        return JSON.parse(cachedValue);
    } else {
        const newValue = await this.getStoreCouponsAndMap(storeName,table); // Implement the function to generate the value if not cached

        await this.client.set(key, JSON.stringify(newValue), 'EX', 3600);
        
        return newValue;
    }
}
  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode, langauage,fullCountryName } = await getTableForLanguage(ln);
    return { table, country, statusCode, langauage, fullCountryName };
  }
 async one(
    request: Request,
    _response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    // Extract the store ID and language code from the request parameters
    const id = Number(request.params.id);

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(request.params.ln)) {
      // Return an error message if the language code is invalid
      return "invalid language code";
    }

    const { table, country, statusCode, langauage, fullCountryName } = await this.getTableAndCountry(
      request.params.ln
    );
    // Return an error message if the language is not found
    if (!country) {
      return "Store language not found";
    }

    // Return an error message if the language is not found
    if (table === "none" || statusCode !== 200) {
      return " language not found";
    }

    // Find the store by its ID using the stores repository
    const store = await this.storesWebRepository.findOneBy({ id });
   
    if (!store) return "No store found wioth ID: " + id;
    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;
      store.allCategoriesArr = convertToArray(store.altCategories);
      store.allTopicsArr = convertToArray(store.altTopics);
      store.keywordsArr = convertToArray(store.keywords);

     
      let storeCoupons = await this.client.get(`store_${store.id}_coupons`, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        console.log('Single store from cache'); // Prints "value"
      }
      return result;
    });

     if(storeCoupons){
      let coupons =  JSON.parse(storeCoupons);
      store.storeCouponsLength = coupons.length;
      store.coupons = JSON.parse(storeCoupons)
     }else{
      let coupons = await this.getSingleStoreCoupons(store.store);
      this.client.set(`store_${store.id}_coupons`,JSON.stringify(coupons), 'EX',3600);
      store.storeCouponsLength = coupons.length;
      store.coupons = coupons;
     }
      const metadata = await this.getStoreMetadata(langauage,country)
      store.storeMetadata = fillMetadatVariables(metadata, store, fullCountryName)
      
      return store;
    } catch (error) {
      console.log(error)
      // Return an error message if an error occur
      return "No stores available";
    }
  }

  async getStoreMetadata(langauage:string, country:string) {
    const mdr = AppDataSource.getRepository(StoreMd);
    return await mdr.findBy({ language: langauage, country: country });
    
  }

  async getStoreCouponsAndMap(storeName:string, table: string) {
    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

   
    let couponsByStoreId = {};
    if (storeName) {
      const coupons = await this.couponsWebRepository
        .createQueryBuilder()
        .where(`store = :storeName`, { storeName })
        .getMany();
       couponsByStoreId = coupons.reduce((acc, coupon) => {
        if (!acc[coupon.store]) {
          acc[coupon.store] = [];
        }
        acc[coupon.store].push(coupon);
        return acc;
      }, {});
    }
    return couponsByStoreId || [];
  }

  async getSingleStoreCoupons(storeName: string) {
    const coupons = await this.couponsWebRepository
      .createQueryBuilder()
      .where(`store = :storeName`, { storeName })
      .getMany();
    coupons.reduce((acc, coupon) => {
      if (!acc[coupon.store]) {
        acc[coupon.store] = [];
      }
      acc[coupon.store].push(coupon);
      return acc;
    }, {});
    return coupons;
  }

  async getStoresWithAlphabeticalKeys(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLangauageFormated(_request.params.ln)) {
      // Return an error message if the language code is invalid
      return "invalid language code";
    }

    const { table, country, statusCode } = await this.getTableAndCountry(
      _request.params.ln
    );

    // Return an error message if the language is not found
    if (!country) {
      return "Store language not found";
    }

    // Return an error message if the language is not found
    if (table === "none" || statusCode !== 200) {
      return "Coupon language not found";
    }

    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      const stores = await this.storesWebRepository
        .createQueryBuilder('store')
        .orderBy("store", "ASC")
        .select(['store.id', 'store.store', 'store.description','store.icon','store.keywords']) 
        .getMany();
     
      const storesWithAlphabeticalKeys = stores.reduce((acc, store) => {
        const firstLetter = store.store.charAt(0).toLowerCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(store);
        return acc;
      }, {});
      let result= {};

      for (let letter = 'a'; letter <= 'z'; letter = String.fromCharCode(letter.charCodeAt(0) + 1)) {
        if (!storesWithAlphabeticalKeys[letter]) {
          result[letter] = [];
        }else{
          result[letter] = storesWithAlphabeticalKeys[letter]
        }
      }

      return result;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }
}
