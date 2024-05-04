import { AppDataSource } from "../data-source";
import { NextFunction, Request, Response } from "express";
import { Coupon } from "../entity/Coupon";
import { getTableForLanguage, isLangauageFormated } from "../services/CouponLangaugeService";

export class CouponsController {

  private couponsWebRepository = AppDataSource.getRepository(Coupon);

  async all(_request: Request, _next: NextFunction, _response: Response) {
    const {
      query: { page, perPage },
    } = _request;
  
    if(!isLangauageFormated(_request.params.ln)){
        return "invalid language code";
    }
    const { table, statusCode} = await getTableForLanguage(_request.params.ln);
    
    if(statusCode !== 200){
        return "Coupon language not found";
    }
    
    try{
        this.couponsWebRepository.metadata.tablePath = `coupons_website_${table}`;

        const limit = Number(perPage) || 20;
        const offset = (Number(page) - 1) * limit;
        const coupons = await this.couponsWebRepository
          .createQueryBuilder()
          .take(limit)
          .offset(offset)
          .getMany();
        
        const mappedCoupons = coupons.map(coupon => ({
          ...coupon,
          table_name: table
        }));
        console.log(mappedCoupons)
        return mappedCoupons;
    }catch(error){
        return  'Coupon language not found';
    }
  
  }

  async one(request: Request, _response: Response, _next: NextFunction) {
    const id = request.params.id;
    const ln_formated = request.params.ln_formated;
    this.couponsWebRepository.metadata.tablePath = `coupons_website_${ln_formated}`;

    const coupon = await this.couponsWebRepository.findOneBy({ offer_id: id });


    if (!coupon) {
      return "Coupon not found";
    }
    return coupon;
  }
}
