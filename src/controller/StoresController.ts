import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Store } from "../entity/Store";
import {
  extractLanguageAndCountry,
  getTableForLanguage,
  isLangauageFormated,
  getLanguageUsedInCountry,
} from "../services/CouponLangaugeService";
import { Coupon } from "../entity/Coupon";

import { convertToArray } from "../services/Helpers";
import { StoreMd } from "../entity/StoreMd";
import { fillMetadatVariables } from "../services/StoreService";
import { Not } from "typeorm";

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
    // const {
    //   query: { page, perPage },
    // } = _request;

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, langauage } =
      await this.getTableAndCountry(_request.params.ln);

    if (!country) {
      return "Store language not found";
    }

    if (table === "none" || statusCode !== 200) {
      return "Coupon language not found";
    }

    try {
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      // const limit = Number(perPage);
      // const offset = (Number(page) - 1) * limit;

      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .where("store.country_language like :country", {
          country: `%${country}_${langauage}%`,
        })
        .select([
          "store.id",
          "store.store",
          "store.description",
          "store.keywords",
          "store.mainCategory",
          "store.monthlyVisits",
          "store.ourCategories",
        ])
        .getMany();

      stores.map((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      return storesWithCoupons;
    } catch (error) {
      return "No stores available";
    }
  }

  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode, langauage, fullCountryName } =
      await getTableForLanguage(ln);
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

    const { table, country, statusCode, langauage, fullCountryName } =
      await this.getTableAndCountry(request.params.ln);
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

      const localeLanguage = await getLanguageUsedInCountry(request.params.ln);
      let storeDescrLanguage = localeLanguage ? localeLanguage : langauage;

      store.description =
        store[`${country}_${storeDescrLanguage}`] || store.description;

      let groupedCoupons = await this.getSingleStoreCoupons(store.store, table);
      let coupons = groupedCoupons[store.store] || []; // Extract the array of coupons for the specific store, or an empty array if none exist
      store.storeCouponsLength = coupons.length;
      store.coupons = coupons;

      const metadata = await this.getStoreMetadata(langauage, country);
      store.storeMetadata = fillMetadatVariables(
        metadata,
        store,
        fullCountryName
      );
      const similarStores = await this.getSimilarShopsForCoupons(
        store.mainCategory,
        store.store
      );
      store.similarStores = similarStores;
      store.storeAppearInCountries = await this.getStoreAppearInCountries(
        store
      );
      return store;
    } catch (error) {
      console.log(error);
      // Return an error message if an error occur
      return "No stores available";
    }
  }

  async getStoreMetadata(langauage: string, country: string) {
    const mdr = AppDataSource.getRepository(StoreMd);
    return await mdr.findBy({ language: langauage, country: country });
  }

  async getStoreCouponsAndMap(stores: Store[], table: string) {
    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

    const storeNames = stores.map((store) => store.store);
    const currentDate = new Date().toISOString().split("T")[0];

    const coupons = await this.couponsWebRepository
      .createQueryBuilder()
      .where(`store IN (:...storeNames)`, { storeNames })
      .andWhere("end_date IS NOT NULL") // Ensure end_date is not null
      .andWhere("end_date::date >= :currentDate::date", { currentDate }) // Cast to date and compare
      .orderBy("rating", "DESC") // Order by rating in descending order
      .getMany();

    const couponsByStoreId = coupons.reduce((acc, coupon) => {
      if (!acc[coupon.store]) {
        acc[coupon.store] = [];
      }
      acc[coupon.store].push(coupon);
      return acc;
    }, {});

    // Filter stores to only those that have at least one coupon
    const storesWithCoupons = stores.filter((store) => {
      store.coupons = couponsByStoreId[store.store] || [];
      store.storeCouponsLength = store.coupons.length;
      return store.storeCouponsLength > 0; // Only keep stores with coupons
    });
    return storesWithCoupons;
  }

  async getSingleStoreCoupons(storeName: string, table: string) {
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;
    const currentDate = new Date().toISOString().split("T")[0];

    const coupons = await this.couponsWebRepository
      .createQueryBuilder()
      .where(`store = :storeName`, { storeName })
      .andWhere("end_date IS NOT NULL") // Ensure end_date is not null
      .andWhere("end_date::date >= :currentDate::date", { currentDate }) // Cast to date and compare
      .getMany();

    const groupedCoupons = coupons.reduce((acc, coupon) => {
      if (!acc[coupon.store]) {
        acc[coupon.store] = [];
      }
      acc[coupon.store].push(coupon);
      return acc;
    }, {});

    return groupedCoupons; // Return the grouped coupons
  }

  async getStoresByCategory(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLangauageFormated(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, langauage } =
      await this.getTableAndCountry(_request.params.ln);

    const category = _request.query.category;

    if (!category) {
      return "Store category not found";
    }

    if (!country) {
      return "Store language not found";
    }

    if (table === "none" || statusCode !== 200) {
      return "Coupon language not found";
    }

    try {
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .orderBy("store", "ASC")
        .select([
          "store.id",
          "store.store",
          "store.description",
          "store.keywords",
        ])
        .where("store.country_language LIKE :country", {
          country: `%${country}_${langauage}%`,
        })
        .andWhere("store.ourCategories LIKE :category", {
          category: `%${category}%`, // Add Health condition to the query
        })
        .getMany();

      stores.map((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      return storesWithCoupons;
    } catch (error) {
      return "No stores available";
    }
  }

  async getAllStores(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLangauageFormated(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, langauage } =
      await this.getTableAndCountry(_request.params.ln);

    if (!country) {
      return "Store language not found";
    }

    if (table === "none" || statusCode !== 200) {
      return "Coupon language not found";
    }

    try {
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .orderBy("store", "ASC")
        .select([
          "store.id",
          "store.store",
          "store.description",
          "store.mainCategory",
          "store.keywords",
        ])
        .where("store.country_language like :country", {
          country: `%${country}_${langauage}%`,
        })
        .getMany();

      stores.map((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      // Group stores by mainCategory
      const groupedStores = storesWithCoupons.reduce((result, store) => {
        const category = store.mainCategory || "Others"; // Default to 'Others' if no category
        if (!result[category]) {
          result[category] = [];
        }
        result[category].push(store);
        return result;
      }, {});

      return groupedStores;
    } catch (error) {
      return "No stores available";
    }
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

    const { table, country, statusCode, langauage } =
      await this.getTableAndCountry(_request.params.ln);

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
        .createQueryBuilder("store")
        .orderBy("store", "ASC")
        .select([
          "store.id",
          "store.store",
          "store.description",
          "store.keywords",
        ])
        .where("store.country_language like :country", {
          country: `%${country}_${langauage}%`,
        })
        .getMany();

      stores.map((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      const storesWithAlphabeticalKeys = storesWithCoupons.reduce(
        (acc, store) => {
          const firstLetter = store.store.charAt(0).toLowerCase();
          if (!acc[firstLetter]) {
            acc[firstLetter] = [];
          }
          acc[firstLetter].push(store);
          return acc;
        },
        {}
      );
      let result = {};

      for (
        let letter = "a";
        letter <= "z";
        letter = String.fromCharCode(letter.charCodeAt(0) + 1)
      ) {
        if (!storesWithAlphabeticalKeys[letter]) {
          result[letter] = [];
        } else {
          result[letter] = storesWithAlphabeticalKeys[letter];
        }
      }

      return result;
    } catch (error) {
      // Return an error message if an error occur
      return "No stores available";
    }
  }

  private async getSimilarShopsForCoupons(categories: any, storeName: string) {
    const stores = await this.storesWebRepository.findBy({
      mainCategory: categories,
      store: Not(storeName),
    });
    const similarStores: any[] = [];
    const topCouponsLimit = 5; // Define how many top coupons you want per store

    for (let i = 0; i < stores.length; i++) {
      // Get all coupons for the current store
      let groupedCoupons = await this.getSingleStoreCoupons(
        stores[i].store,
        "us_english"
      );
      let storeCoupons = groupedCoupons[stores[i].store];

      let sorted = [];
      // Sort the coupons by rating in descending order
      if (storeCoupons) {
        sorted = storeCoupons.sort((a: any, b: any) => b.rating - a.rating);
      }
      //   // Take only the top N coupons (e.g., top 5)
      const topRatedCoupons: Coupon[] = sorted.slice(0, topCouponsLimit);

      // Add store details and top-rated coupons to the similarStores array
      similarStores.push({
        storeName: stores[i].store,
        storeId: stores[i].id,
        totalCouponRating: topRatedCoupons.reduce(
          (sum, coupon) => sum + coupon.rating,
          0
        ),
      });
    }
    similarStores.sort((a, b) => b.totalCouponRating - a.totalCouponRating);
    return similarStores.slice(0, 10);
  }

  private async getStoreAppearInCountries(store: Store) {
    // Replace all single quotes with double quotes to make it valid JSON
    const formattedStr = store.country_language.replace(/'/g, '"');

    // Remove the square brackets (optional but good to clean up extra spaces)
    const parsedStr = JSON.parse(formattedStr) as string[];
    //   // Get first two letters and remove duplicates
    const result = [...new Set(parsedStr.map((item) => item.slice(0, 2)))];

    return result;
  }
}
