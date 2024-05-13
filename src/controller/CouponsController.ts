import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Coupon } from "../entity/Coupon";
import { getTableForLanguage, isLangauageFormated } from "../services/CouponLangaugeService";
import { Category } from "../entity/Category";
import { errorApiResponse, successApiResponse } from "../services/ResponseService";
import { ApiResponse } from "../types/ResponeType";
/**
 * Controller for managing coupons.
 */
export class CouponsController {

  /**
   * Coupons repository.
   */
  private couponsWebRepository = AppDataSource.getRepository(Coupon);

  /**
   * Categories repository.
   */
  private categoriesRepsitory = AppDataSource.getRepository(Category);

  /**
   * Retrieves all coupons for a specific language.
   *
   * @param {Request} _request - The request object.
   * @param {NextFunction} _next - The next function.
   * @param {Response} _response - The response object.
   * @return {Promise<Object[] | string>} An array of mapped coupons or an error message.
   */
  async all(_request: Request, _next: NextFunction, _response: Response): Promise<string | ApiResponse | object[]> {
    // Destructure the query parameters from the request
    const {
      query: { page, perPage, store },
    } = _request;

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(_request.params.ln)) {
      // Return an error message if the language code is invalid
      return errorApiResponse({ statusCode: 404, message: "Code language format is not valid" });
    }

    // Retrieve the table name and status code for the specified language
    const { table, statusCode } = await getTableForLanguage(_request.params.ln);

    // Return an error message if the language is not found
    if (statusCode !== 200) {
      return errorApiResponse({ statusCode: 404, message: "Coupons for given language were not found!" });
    }

    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      // Calculate the limit and offset for pagination
      const limit = Number(perPage) || 20;
      const offset = (Number(page) - 1) * limit;

      // Retrieve the coupons from the repository
      const query = this.couponsWebRepository
        .createQueryBuilder()
        .take(limit)
        .offset(offset)

      if (store) {
        query.where({ store })
      }

      const coupons = await query.getMany();

      // Map the coupons with the table name
      const mappedCoupons = coupons.map(coupon => ({
        ...coupon,
        table_name: table
      }));

      // Return the mapped coupons
      return successApiResponse({statusCode:200,message:"success", data: mappedCoupons });

    } catch (error) {
      // Return an error message if an error occurs
      return errorApiResponse({ statusCode: 400, message: "Something went wrong while trying to fetch coupons" });
    }
  }

  /**
   * Retrieves a specific coupon by its ID for a given language.
   *
   * @param {Request} request - The request object.
   * @param {Response} _response - The response object.
   * @param {NextFunction} _next - The next function.
   * @return {Promise<Object | string>} The coupon object if found, or an error message.
   */
  async one(request: Request, _response: Response, _next: NextFunction): Promise<string | ApiResponse | object[]> {
    // Extract the coupon ID and language code from the request parameters
    const id = request.params.id;
    const ln_formated = request.params.ln_formated;

    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${ln_formated}`;

    try {
      // Find the coupon by its ID using the coupons repository
      const coupon = await this.couponsWebRepository.findOneBy({ offer_id: id });
      if (coupon) {
        coupon.table_name = ln_formated;
      }

      // If the coupon is not found, return an error message
      if (!coupon) {
        return "Coupon not found";
      }

      // Return the coupon object
      return successApiResponse({ statusCode: 200, message: "Coupon found", data: coupon });
    } catch (error) {
      return errorApiResponse({ statusCode: 400, message: "Something went wrong while trying to fetch coupons" });
    }
  }

  /**
   * Increments the click count for a coupon.
   *
   * @param {Request} request - The request object.
   * @param {Response} _response - The response object.
   * @param {NextFunction} _next - The next function.
   * @return {Promise<Object | string>} A success message if the click count is updated, or an error message.
   */
  async clicked(request: Request, _response: Response, _next: NextFunction): Promise<string | ApiResponse | object[]> {
    // Extract the coupon ID and language code from the request parameters
    const id = request.body.coupon_id;
    const coupons_table = request.params.coupons_table;

    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${coupons_table}`;

      // Find the coupon by its ID using the coupons repository
      const coupon = await this.couponsWebRepository
        .createQueryBuilder()
        .update()
        .set({ rating: () => "rating + 1" })
        .where("offer_id = :id", { id })
        .execute();

      // If the coupon is not found, return an error message
      if (!coupon) {
        return "Coupon not found";
      }

      // Return a success message
      return successApiResponse({ statusCode: 200, message: "Coupon click count updated successfully!" });
    } catch (error) {
      // Return an error message if an error occurs
      return errorApiResponse({ statusCode: 500, message: "Something went wrong while trying to update  coupon click count!" });
    }
  }

  /**
   * Retrieves all coupons for a specific category for a given language.
   *
   * @param {Request} request - The request object.
   * @param {Response} _response - The response object.
   * @param {NextFunction} _next - The next function.
   * @return {Promise<Object[] | string>} An array of mapped coupons or an error message.
   */
  async couponsByCategory(request: Request, _response: Response, _next: NextFunction): Promise<string | ApiResponse | object[]> {
    // Destructure the query parameters from the request
    const {
      query: { page, perPage },
    } = request;

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(request.params.ln)) {
      // Return an error message if the language code is invalid
      return errorApiResponse({ statusCode: 404, message: "Code language format is not valid" });
    }

    // Retrieve the table name and status code for the specified language
    const { table, statusCode } = await getTableForLanguage(request.params.ln);

    // Return an error message if the language is not found
    if (statusCode !== 200) {
      return errorApiResponse({ statusCode: 404, message: "Coupons for given language were not found!" });
    }

    try {
      // Set the table path for the coupons repository
      this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

      // Calculate the limit and offset for pagination
      const limit = Number(perPage) || 20;
      const offset = (Number(page) - 1) * limit;

      const categoryId = request.params.categoryId;
      const category = await this.categoriesRepsitory.findOneBy({ id: Number(categoryId) });


      // Retrieve the coupons from the repository
      const query = this.couponsWebRepository
        .createQueryBuilder('coupon')
        .where("coupon.categories like :category", { category: `%${category?.category}%` })
        .take(limit)
        .offset(offset)

      const coupons = await query.getMany();

      // Map the coupons with the table name
      const mappedCoupons = coupons.map(coupon => ({
        ...coupon,
        table_name: table
      }));

      // Return the mapped coupons
      return successApiResponse({ statusCode: 200, message:"Coupons by category", data: mappedCoupons });
    } catch (error) {
      // Return an error message if an error occurs
      return errorApiResponse({ statusCode: 404, message: "Coupons with category for given language were not found!" });
    }
  }
}

