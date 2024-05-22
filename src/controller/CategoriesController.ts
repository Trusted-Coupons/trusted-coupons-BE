import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import {
  extractLanguageAndCountry,
  getTableForLanguage,
  isLangauageFormated,
} from "../services/CouponLangaugeService";
import { Category } from "../entity/Category";


export class CategoriesController {
  private categoriesRepsitory = AppDataSource.getRepository(Category);

  async getTableAndCountry(ln: string) {
    const { country } = extractLanguageAndCountry(ln);
    const { table, statusCode } = await getTableForLanguage(ln);
    return { table, country, statusCode };
  }

  async all(_request: Request, _next: NextFunction, _response: Response) {
    return await this.categoriesRepsitory
    .createQueryBuilder()
    .orderBy("category", "ASC")
    .getMany();

  }

  async getCategoriesWithAlphabeticalKeys(
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
      return "Category language not found";
    }

    // Return an error message if the language is not found
    if (table === "none" || statusCode !== 200) {
      return "Category language not found";
    }

    try {
      const stores = await this.categoriesRepsitory
        .createQueryBuilder()
        .orderBy("category", "ASC")
        .getMany();

      const categoriesWithAlphabeticalKeys = stores.reduce((acc, category) => {
        const firstLetter = category.category.charAt(0).toLowerCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(category);
        return acc;
      }, {});

      return categoriesWithAlphabeticalKeys;
    } catch (error) {
      // Return an error message if an error occur
      return "No categories available";
    }
  }
}
