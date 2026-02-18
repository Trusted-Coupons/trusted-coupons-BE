import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import {
  extractLanguageAndCountry,
  getTableForLanguage,
  isLanguageFormatted,
} from "../services/CouponLanguageService";
import { Category } from "../entity/Category";

export class CategoriesController {
  private categoriesRepository = AppDataSource.getRepository(Category);

  /**
   * Helper to get table and country info.
   */
  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode } = await getTableForLanguage(ln);
    return { table, country, statusCode };
  }

  /**
   * Retrieve all categories.
   *
   * @param request - The request object.
   * @param _next - The next function.
   * @param response - The response object.
   * @returns An array of categories.
   */
  async all(
    request: Request,
    _next: NextFunction,
    response: Response
  ): Promise<object[]> {
    const {
      query: { page = "1", perPage = "20" },
    } = request;

    try {
      const limit = Number(perPage);
      const offset = Number(page) > 0 ? (Number(page) - 1) * limit : 0;

      const categories = await this.categoriesRepository
        .createQueryBuilder("category")
        .orderBy("category.category", "ASC")
        .limit(limit)
        .offset(offset)
        .cache(false)
        .getMany();

      return categories;
    } catch (error) {
      console.error("Error in all:", error);
      response.status(500).json({ error: "Failed to fetch categories" });
      return [];
    }
  }

  /**
   * Retrieve categories grouped by alphabetical keys.
   *
   * @param request - The request object.
   * @param _next - The next function.
   * @param response - The response object.
   * @returns An object with categories grouped by first letter or an error object.
   */
  async getCategoriesWithAlphabeticalKeys(
    request: Request,
    _next: NextFunction,
    response: Response
  ): Promise<object | string> {
    if (!isLanguageFormatted(request.params.ln)) {
      response.status(400).json({ error: "Invalid language code" });
      return { error: "Invalid language code" };
    }

    const { table, country, statusCode } = await this.getTableAndCountry(
      request.params.ln
    );

    if (!country) {
      response.status(404).json({ error: "Category language not found" });
      return { error: "Category language not found" };
    }

    if (table === "none" || statusCode !== 200) {
      response.status(404).json({ error: "Category language not found" });
      return { error: "Category language not found" };
    }

    try {
      const {
        query: { page = "1", perPage = "20" },
      } = request;
      const limit = Number(perPage);
      const offset = Number(page) > 0 ? (Number(page) - 1) * limit : 0;

      const categories = await this.categoriesRepository
        .createQueryBuilder("category")
        .orderBy("category.category", "ASC")
        .limit(limit)
        .offset(offset)
        .cache(false)
        .getMany();

      const categoriesWithAlphabeticalKeys = categories.reduce(
        (acc: Record<string, Category[]>, category) => {
          const firstLetter = category.category.charAt(0).toLowerCase();
          acc[firstLetter] = acc[firstLetter] || [];
          acc[firstLetter].push(category);
          return acc;
        },
        {}
      );

      const result: Record<string, Category[]> = {};
      for (
        let letter = "a".charCodeAt(0);
        letter <= "z".charCodeAt(0);
        letter++
      ) {
        const char = String.fromCharCode(letter);
        result[char] = categoriesWithAlphabeticalKeys[char] || [];
      }

      return result;
    } catch (error) {
      console.error("Error in getCategoriesWithAlphabeticalKeys:", error);
      response.status(500).json({ error: "No categories available" });
      return { error: "No categories available" };
    }
  }
}
