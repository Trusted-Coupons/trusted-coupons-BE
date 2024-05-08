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
      query: { page, perPage, fL },
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
      // Set the table path for the stores repository

      // Retrieve the stores from the repository
      const query = this.storesWebRepository
        .createQueryBuilder()
        .where('"countryAlpha2Code" = :country', { country });

      if (!fL) {
        // Calculate the limit and offset for pagination
        const limit = Number(perPage) || 20;
        const offset = (Number(page) - 1) * limit;
        query.take(limit).offset(offset);
      }else{
        query.where('store ILIKE :prefix', { prefix: `${fL}%` });
      }

      const stores = await query.getMany();

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
}
