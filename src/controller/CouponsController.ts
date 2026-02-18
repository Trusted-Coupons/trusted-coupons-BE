import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import {
  getTableForLanguage,
  isLanguageFormatted,
} from "../services/CouponLanguageService";
import { Category } from "../entity/Category";

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

export class CouponsController {
  private categoriesRepository = AppDataSource.getRepository(Category);

  async all(
    request: Request,
    _next: NextFunction,
    response: Response
  ): Promise<object[] | object> {
    const {
      query: { page, perPage, store },
    } = request;

    if (!isLanguageFormatted(request.params.ln)) {
      response.status(400).json({ error: "Invalid language code" });
      return { error: "Invalid language code" };
    }

    const { table, statusCode } = await getTableForLanguage(request.params.ln);

    if (statusCode !== 200) {
      response.status(404).json({ error: "Coupon language not found" });
      return { error: "Coupon language not found" };
    }

    try {
      const tableName = buildTableName(table);
      const limit = Number(perPage) || 20;
      const offset = Number(page) > 0 ? (Number(page) - 1) * limit : 0;

      let coupons: any[];
      let count: number;

      if (store) {
        [coupons, [{ count }]] = await Promise.all([
          AppDataSource.query(
            `SELECT * FROM "${tableName}" WHERE store = $1 LIMIT $2 OFFSET $3`,
            [store, limit, offset]
          ),
          AppDataSource.query(
            `SELECT COUNT(*) AS count FROM "${tableName}" WHERE store = $1`,
            [store]
          ),
        ]);
      } else {
        [coupons, [{ count }]] = await Promise.all([
          AppDataSource.query(
            `SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`,
            [limit, offset]
          ),
          AppDataSource.query(`SELECT COUNT(*) AS count FROM "${tableName}"`),
        ]);
      }

      const total = Number(count);
      return coupons.map((coupon) => ({
        ...coupon,
        table_name: table,
        total_coupons_count: total,
      }));
    } catch (error) {
      console.error("Error in all:", error);
      response.status(500).json({ error: "Failed to fetch coupons" });
      return { error: "Failed to fetch coupons" };
    }
  }

  async one(
    request: Request,
    response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    const id = request.params.id;
    const ln_formated = request.params.ln_formated;

    if (!isLanguageFormatted(ln_formated)) {
      return response.status(400).json({ error: "Invalid language code" });
    }

    try {
      const tableName = buildTableName(ln_formated);
      const [coupon] = await AppDataSource.query(
        `SELECT * FROM "${tableName}" WHERE offer_id = $1 LIMIT 1`,
        [id]
      );

      if (!coupon) {
        return response.status(404).json({ error: "Coupon not found" });
      }

      return response.status(200).json({ ...coupon, table_name: ln_formated });
    } catch (error) {
      console.error("Error in one:", error);
      return response.status(500).json({ error: "Failed to fetch coupon" });
    }
  }

  async clicked(
    request: Request,
    response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    const id = request.body.coupon_id;
    const couponsTable = request.body.coupons_table; // e.g. "us_english"

    if (!id || !couponsTable) {
      return response
        .status(400)
        .json({ error: "coupon_id and coupons_table are required" });
    }

    try {
      const tableName = buildTableName(couponsTable);
      const result = await AppDataSource.query(
        `UPDATE "${tableName}" SET rating = rating + 1 WHERE id = $1`,
        [id]
      );

      // pg driver returns [rows, rowCount] for UPDATE
      if (result[1] === 0) {
        return response.status(404).json({ error: "Coupon not found" });
      }

      return response.status(200).json({ message: "Coupon clicked", statusCode: 200 });
    } catch (error) {
      console.error("Error in clicked:", error);
      return response.status(500).json({ error: "Failed to update coupon" });
    }
  }

  async couponsByCategory(
    request: Request,
    response: Response,
    _next: NextFunction
  ): Promise<object | string> {
    const {
      query: { page, perPage },
    } = request;

    if (!isLanguageFormatted(request.params.ln)) {
      return response.status(400).json({ error: "Invalid language code" });
    }

    const { table, statusCode } = await getTableForLanguage(request.params.ln);

    if (statusCode !== 200) {
      return response.status(404).json({ error: "Coupon language not found" });
    }

    try {
      const tableName = buildTableName(table);
      const limit = Number(perPage) || 20;
      const offset = Number(page) > 0 ? (Number(page) - 1) * limit : 0;

      const categoryId = request.params.categoryId;
      const category = await this.categoriesRepository.findOne({
        where: { id: Number(categoryId) },
        cache: false,
      });

      if (!category) {
        return response.status(404).json({ error: "Category not found" });
      }

      const coupons = await AppDataSource.query(
        `SELECT * FROM "${tableName}"
         WHERE categories::text LIKE $1
         LIMIT $2 OFFSET $3`,
        [`%${category.category}%`, limit, offset]
      );

      const mappedCoupons = coupons.map((coupon: any) => ({
        ...coupon,
        table_name: table,
      }));

      return response.status(200).json(mappedCoupons);
    } catch (error) {
      console.error("Error in couponsByCategory:", error);
      return response.status(500).json({ error: "Failed to fetch coupons" });
    }
  }
}
