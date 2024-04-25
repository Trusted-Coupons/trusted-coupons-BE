import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { CouponWebsite } from "../entity/CouponWebsite"
export class CouponsWebsiteController {

    private couponsWebRepository = AppDataSource.getRepository(CouponWebsite)

    async all(_request: Request, _next: NextFunction) {
        const coupons = await this.couponsWebRepository.createQueryBuilder().limit(100).orderBy("id", "ASC").getMany();
        return coupons
    }

    async one(request: Request, _response: Response, _next: NextFunction) {
        const id = parseInt(request.params.id)

        const coupon = await this.couponsWebRepository.findOneBy({ id })

        if (!coupon) {
            return "coupon with id: " + id + " not found"
        }
        return coupon
    }

}

