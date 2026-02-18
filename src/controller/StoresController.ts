import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Store } from "../entity/Store";
import {
  extractLanguageAndCountry,
  getTableForLanguage,
  isLanguageFormatted,
  getLanguageUsedInCountry,
} from "../services/CouponLanguageService";
import { convertToArray } from "../services/Helpers";
import { StoreMd } from "../entity/StoreMd";
import { fillMetadatVariables } from "../services/StoreService";
import { Not } from "typeorm";

// Max coupons shown per store on listing/alphabetical pages
const LISTING_COUPONS_PER_STORE = 5;
// Max coupons fetched for a single store detail page
const SINGLE_STORE_COUPON_LIMIT = 200;
// How many candidate similar stores to evaluate
const SIMILAR_STORES_QUERY_LIMIT = 30;
// How many similar stores to return to the client
const SIMILAR_STORES_RESULT_LIMIT = 10;
// Top N coupons per store used to rank similar stores
const TOP_COUPONS_PER_SIMILAR_STORE = 5;

/**
 * Validates and returns the full coupon table name.
 * Prevents SQL injection from dynamic table segments.
 */
function buildTableName(table: string): string {
  if (!/^[a-z]{2}_[a-z]+$/.test(table)) {
    throw new Error(`Invalid table name segment: ${table}`);
  }
  return `coupons_website_${table}`;
}

export class StoresController {
  private storesWebRepository = AppDataSource.getRepository(Store);

  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode, language, fullCountryName } =
      await getTableForLanguage(ln);
    return { table, country, statusCode, language, fullCountryName };
  }

  async all(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object[] | string> {
    if (!isLanguageFormatted(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, language } =
      await this.getTableAndCountry(_request.params.ln);

    if (!country) return "Store language not found";
    if (table === "none" || statusCode !== 200) return "Coupon language not found";

    try {
      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .where("store.country_language like :country", {
          country: `%${country}_${language}%`,
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

      stores.forEach((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      return await this.getStoreCouponsAndMap(stores, table);
    } catch (error) {
      return "No stores available";
    }
  }

  async one(
    request: Request,
    _response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    const id = Number(request.params.id);

    if (!isLanguageFormatted(request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, language, fullCountryName } =
      await this.getTableAndCountry(request.params.ln);

    if (!country) return "Store language not found";
    if (table === "none" || statusCode !== 200) return "language not found";

    const store = await this.storesWebRepository.findOneBy({ id });
    if (!store) return "No store found with ID: " + id;

    try {
      store.allCategoriesArr = convertToArray(store.altCategories);
      store.allTopicsArr = convertToArray(store.altTopics);
      store.keywordsArr = convertToArray(store.keywords);

      const localeLanguage = await getLanguageUsedInCountry(request.params.ln);
      const storeDescrLanguage = localeLanguage || language;
      store.description =
        store[`${country}_${storeDescrLanguage}`] || store.description;

      const coupons = await this.getSingleStoreCoupons(store.store, table);
      store.storeCouponsLength = coupons.length;
      store.coupons = coupons;

      const metadata = await this.getStoreMetadata(language, country);
      store.storeMetadata = fillMetadatVariables(metadata, store, fullCountryName);
      store.similarStores = await this.getSimilarShopsForCoupons(
        store.mainCategory,
        store.store
      );
      store.storeAppearInCountries = await this.getStoreAppearInCountries(store);

      return store;
    } catch (error) {
      console.error(error);
      return "No stores available";
    }
  }

  async getStoreMetadata(language: string, country: string) {
    const mdr = AppDataSource.getRepository(StoreMd);
    return mdr.findBy({ language, country });
  }

  /**
   * Fetches top N coupons per store in a single query using a window function,
   * then attaches them to each store. Avoids loading all coupons into memory.
   */
  async getStoreCouponsAndMap(stores: Store[], table: string) {
    if (stores.length === 0) return [];

    const storeNames = stores.map((s) => s.store);
    const currentDate = new Date().toISOString().split("T")[0];
    const tableName = buildTableName(table);

    const coupons: any[] = await AppDataSource.query(
      `SELECT * FROM (
         SELECT *, ROW_NUMBER() OVER (PARTITION BY store ORDER BY rating DESC) AS rn
         FROM "${tableName}"
         WHERE store = ANY($1)
           AND end_date IS NOT NULL
           AND end_date::date >= $2::date
       ) ranked
       WHERE rn <= $3`,
      [storeNames, currentDate, LISTING_COUPONS_PER_STORE]
    );

    const couponsByStore: Record<string, any[]> = {};
    for (const coupon of coupons) {
      coupon.table_name = table; // needed by the frontend modal to rate the coupon
      if (!couponsByStore[coupon.store]) couponsByStore[coupon.store] = [];
      couponsByStore[coupon.store].push(coupon);
    }

    return stores.filter((store) => {
      store.coupons = couponsByStore[store.store] || [];
      store.storeCouponsLength = store.coupons.length;
      return store.storeCouponsLength > 0;
    });
  }

  /**
   * Fetches coupons for a single store with a hard upper limit.
   */
  async getSingleStoreCoupons(storeName: string, table: string): Promise<any[]> {
    const currentDate = new Date().toISOString().split("T")[0];
    const tableName = buildTableName(table);

    const rows: any[] = await AppDataSource.query(
      `SELECT * FROM "${tableName}"
       WHERE store = $1
         AND end_date IS NOT NULL
         AND end_date::date >= $2::date
       ORDER BY rating DESC
       LIMIT $3`,
      [storeName, currentDate, SINGLE_STORE_COUPON_LIMIT]
    );
    // Attach table_name so the frontend modal can send it back when rating a coupon
    return rows.map((c) => ({ ...c, table_name: table }));
  }

  async getStoresByCategory(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLanguageFormatted(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, language } =
      await this.getTableAndCountry(_request.params.ln);
    const category = _request.query.category;

    if (!category) return "Store category not found";
    if (!country) return "Store language not found";
    if (table === "none" || statusCode !== 200) return "Coupon language not found";

    try {
      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .orderBy("store", "ASC")
        .select(["store.id", "store.store", "store.description", "store.keywords"])
        .where("store.country_language LIKE :country", {
          country: `%${country}_${language}%`,
        })
        .andWhere("store.ourCategories LIKE :category", {
          category: `%${category}%`,
        })
        .getMany();

      stores.forEach((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      return await this.getStoreCouponsAndMap(stores, table);
    } catch (error) {
      return "No stores available";
    }
  }

  async getAllStores(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLanguageFormatted(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, language } =
      await this.getTableAndCountry(_request.params.ln);

    if (!country) return "Store language not found";
    if (table === "none" || statusCode !== 200) return "Coupon language not found";

    try {
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
          country: `%${country}_${language}%`,
        })
        .getMany();

      stores.forEach((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      return storesWithCoupons.reduce(
        (result: Record<string, Store[]>, store) => {
          const category = store.mainCategory || "Others";
          if (!result[category]) result[category] = [];
          result[category].push(store);
          return result;
        },
        {}
      );
    } catch (error) {
      return "No stores available";
    }
  }

  async getStoresWithAlphabeticalKeys(
    _request: Request,
    _next: NextFunction,
    _response: Response
  ): Promise<object | string> {
    if (!isLanguageFormatted(_request.params.ln)) {
      return "invalid language code";
    }

    const { table, country, statusCode, language } =
      await this.getTableAndCountry(_request.params.ln);

    if (!country) return "Store language not found";
    if (table === "none" || statusCode !== 200) return "Coupon language not found";

    try {
      const stores = await this.storesWebRepository
        .createQueryBuilder("store")
        .orderBy("store", "ASC")
        .select(["store.id", "store.store", "store.description", "store.keywords"])
        .where("store.country_language like :country", {
          country: `%${country}_${language}%`,
        })
        .getMany();

      stores.forEach((store) => {
        store.keywordsArr = convertToArray(store.keywords);
      });

      const storesWithCoupons = await this.getStoreCouponsAndMap(stores, table);

      const byLetter: Record<string, Store[]> = {};
      for (const store of storesWithCoupons) {
        const letter = store.store.charAt(0).toLowerCase();
        if (!byLetter[letter]) byLetter[letter] = [];
        byLetter[letter].push(store);
      }

      const result: Record<string, Store[]> = {};
      for (let c = "a".charCodeAt(0); c <= "z".charCodeAt(0); c++) {
        const letter = String.fromCharCode(c);
        result[letter] = byLetter[letter] || [];
      }

      return result;
    } catch (error) {
      return "No stores available";
    }
  }

  /**
   * Returns store name suggestions matching a search query.
   * Used by the frontend search/autocomplete feature.
   */
  async getStoreSuggestions(
    request: Request,
    _response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    if (!isLanguageFormatted(request.params.ln)) {
      return "invalid language code";
    }

    const q = ((request.query.q as string) || "").trim();
    if (q.length < 2) return [];

    const { country, statusCode, language } = await this.getTableAndCountry(
      request.params.ln
    );
    if (!country || statusCode !== 200) return [];

    const stores = await this.storesWebRepository
      .createQueryBuilder("store")
      .select(["store.id", "store.store"])
      .where("store.country_language LIKE :country", {
        country: `%${country}_${language}%`,
      })
      .andWhere("store.store ILIKE :q", { q: `%${q}%` })
      .limit(10)
      .getMany();

    return stores;
  }

  /**
   * Finds similar stores in the same category.
   * Uses a single batch query with a window function instead of N+1 per-store queries.
   */
  private async getSimilarShopsForCoupons(categories: string, storeName: string) {
    const stores = await this.storesWebRepository
      .createQueryBuilder("store")
      .select(["store.id", "store.store"])
      .where({ mainCategory: categories, store: Not(storeName) })
      .limit(SIMILAR_STORES_QUERY_LIMIT)
      .getMany();

    if (stores.length === 0) return [];

    const storeNames = stores.map((s) => s.store);
    const currentDate = new Date().toISOString().split("T")[0];

    const rows: { store: string; totalrating: string }[] =
      await AppDataSource.query(
        `SELECT store, SUM(rating) AS totalrating
         FROM (
           SELECT store, rating,
                  ROW_NUMBER() OVER (PARTITION BY store ORDER BY rating DESC) AS rn
           FROM "coupons_website_us_english"
           WHERE store = ANY($1)
             AND end_date IS NOT NULL
             AND end_date::date >= $2::date
         ) ranked
         WHERE rn <= $3
         GROUP BY store
         ORDER BY totalrating DESC
         LIMIT $4`,
        [
          storeNames,
          currentDate,
          TOP_COUPONS_PER_SIMILAR_STORE,
          SIMILAR_STORES_RESULT_LIMIT,
        ]
      );

    const storeIdMap = new Map(stores.map((s) => [s.store, s.id]));
    return rows.map((row) => ({
      storeName: row.store,
      storeId: storeIdMap.get(row.store) ?? 0,
      totalCouponRating: Number(row.totalrating),
    }));
  }

  private async getStoreAppearInCountries(store: Store) {
    const formattedStr = store.country_language.replace(/'/g, '"');
    const parsedStr = JSON.parse(formattedStr) as string[];
    return [...new Set(parsedStr.map((item) => item.slice(0, 2)))];
  }
}
