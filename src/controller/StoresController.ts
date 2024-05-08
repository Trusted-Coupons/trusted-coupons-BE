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

export class StoresController {
  private storesWebRepository = AppDataSource.getRepository(Store);
  private couponsWebRepository = AppDataSource.getRepository(Coupon);

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
        .createQueryBuilder()
        .where('"countryAlpha2Code" = :country', { country })
        .take(limit)
        .offset(offset)
        .getMany();

      stores.map((store) => {
        store.allCategoriesArr = convertToArray(store.altCategories);
        store.allTopicsArr = convertToArray(store.altTopics);
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      return storesWithCoupons;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }

  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode } = await getTableForLanguage(ln);
    return { table, country, statusCode };
  }

  /**
   * Retrieve a specific store by its ID for a given language.
   *
   * @param {Request} request - The request object.
   * @param {Response} _response - The response object.
   * @param {NextFunction} _next - The next function.
   * @return {Promise<Object | string>} The store object if found, or an error message.
   */
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

    const { table, country, statusCode } = await this.getTableAndCountry(
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

      store.coupons = await this.getSingleStoreCoupons(store.store);
      // Return the store object
      return store;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }
  async getStoreCouponsAndMap(stores: Store[], table: string) {
    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

    const storeNames = stores.map((store) => store.store);
    if (stores.length) {
      const coupons = await this.couponsWebRepository
        .createQueryBuilder()
        .where(`store IN (:...storeNames)`, { storeNames })
        .getMany();
      const couponsByStoreId = coupons.reduce((acc, coupon) => {
        if (!acc[coupon.store]) {
          acc[coupon.store] = [];
        }
        acc[coupon.store].push(coupon);
        return acc;
      }, {});

      stores.forEach((store) => {
        store.coupons = couponsByStoreId[store.store] || [];
      });
    }

    return stores;
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
        .createQueryBuilder()
        .orderBy("store", "ASC")
        .getMany();

      const storesWithAlphabeticalKeys = stores.reduce((acc, store) => {
        const firstLetter = store.store.charAt(0).toLowerCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(store);
        return acc;
      }, {});

      return storesWithAlphabeticalKeys;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }
}
