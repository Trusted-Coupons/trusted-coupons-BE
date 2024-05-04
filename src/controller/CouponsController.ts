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
        this.couponsWebRepository.metadata.tablePath = table;

        const limit = Number(perPage) || 20;
        const offset = (Number(page) - 1) * limit;
        const categories = await this.couponsWebRepository
          .createQueryBuilder()
          .take(limit)
          .offset(offset)
          .getMany();
        return categories;
    }catch(error){
        return  'Coupon language not found';
    }
  
  }

  async one(request: Request, _response: Response, _next: NextFunction) {
    const id = parseInt(request.params.id);

    const category = await this.couponsWebRepository.findOneBy({ id });

    if (!category) {
      return "unregistered category";
    }
    return category;
  }
}
