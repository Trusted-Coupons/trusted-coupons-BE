import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Coupon } from "../entity/Coupon";
import { getTableForLanguage, isLangauageFormated } from "../services/CouponLangaugeService";
import { Category } from "../entity/Category";

export class CouponsController {

  private couponsWebRepository = AppDataSource.getRepository(Coupon);
  private categoriesRepsitory = AppDataSource.getRepository(Category);


  /**
   * Retrieve all coupons for a specific language.
   *
   * @param {Request} _request - The request object.
   * @param {NextFunction} _next - The next function.
   * @param {Response} _response - The response object.
   * @return {Promise<Object[] | string>} An array of mapped coupons or an error message.
   */
  async all(_request: Request, _next: NextFunction, _response: Response): Promise<object[] | string> {
    // Destructure the query parameters from the request
    const {
      query: { page, perPage,store },
    } = _request;

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(_request.params.ln)) {
      // Return an error message if the language code is invalid
      return "invalid language code";
    }

    // Retrieve the table name and status code for the specified language
    const { table, statusCode } = await getTableForLanguage(_request.params.ln);

    // Return an error message if the language is not found
    if (statusCode !== 200) {
      return "Coupon language not found";
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

        if(store){
          query.where({ store })
        }
      
      const coupons = await query.getMany();

      // Map the coupons with the table name
      const mappedCoupons = coupons.map(coupon => ({
        ...coupon,
        table_name: table
      }));

      // Return the mapped coupons
      return mappedCoupons;
    } catch (error) {
      // Return an error message if an error occurs
      return "Coupon language not found";
    }
  }


  /**
   * Retrieve a specific coupon by its ID for a given language.
   *
   * @param {Request} request - The request object.
   * @param {Response} _response - The response object.
   * @param {NextFunction} _next - The next function.
   * @return {Promise<Object | string>} The coupon object if found, or an error message.
   */
  async one(request: Request, _response: Response, _next: NextFunction): Promise<object | string> {
    // Extract the coupon ID and language code from the request parameters
    const id = request.params.id;
    const ln_formated = request.params.ln_formated;

    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${ln_formated}`;

    // Find the coupon by its ID using the coupons repository
    const coupon = await this.couponsWebRepository.findOneBy({ offer_id: id });
    if(coupon){
      coupon.table_name = ln_formated;
    }

    // If the coupon is not found, return an error message
    if (!coupon) {
      return "Coupon not found";
    }

    // Return the coupon object
    return coupon;
  }
  async clicked(request: Request, _response: Response, _next: NextFunction): Promise<object | string> {
    // Extract the coupon ID and language code from the request parameters
    const id = request.body.coupon_id;
    const coupons_table = request.params.coupons_table;

    // Set the table path for the coupons repository
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${coupons_table}`;

    // Find the coupon by its ID using the coupons repository
    const coupon  = await this.couponsWebRepository
        .createQueryBuilder()
        .update()
        .set({ rating: () => "rating + 1" })
        .where("offer_id = :id", { id })
        .execute();

    // If the coupon is not found, return an error message
    if (!coupon) {
      return "Coupon not found";
    }

    // Return the coupon object
    return {
      "message": "Coupon clicked",
      statusCode: 200
    }
  }

  async couponsByCategory(request: Request, _response: Response, _next: NextFunction): Promise<object | string> {
     // Destructure the query parameters from the request
     const {
      query: { page, perPage },
    } = request;

    // Check if the language code is formatted correctly
    if (!isLangauageFormated(request.params.ln)) {
      // Return an error message if the language code is invalid
      return "invalid language code";
    }

    // Retrieve the table name and status code for the specified language
    const { table, statusCode } = await getTableForLanguage(request.params.ln);

    // Return an error message if the language is not found
    if (statusCode !== 200) {
      return "Coupon language not found";
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
        .where("coupon.categories like :category", {category: `%${category?.category}%`})
        .take(limit)
        .offset(offset)
      
      const coupons = await query.getMany();

      // Map the coupons with the table name
      const mappedCoupons = coupons.map(coupon => ({
        ...coupon,
        table_name: table
      }));

      // Return the mapped coupons
      return mappedCoupons;
    } catch (error) {
      console.log(error)
      // Return an error message if an error occurs
      return "Coupon language not found";
    }
  }
}


