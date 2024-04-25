import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { CouponWebsite } from "../entity/CouponWebsite"
export class CouponsWebsiteController {

    private couponsWebRepository = AppDataSource.getRepository(CouponWebsite)

    async all(_request: Request, _next: NextFunction) {
        const categories = await this.couponsWebRepository.createQueryBuilder().limit(100).orderBy("id", "ASC").getMany();
        return categories
    }

    async one(request: Request, _response: Response, _next: NextFunction) {
        const id = parseInt(request.params.id)

        const category = await this.couponsWebRepository.findOneBy({ id })

        if (!category) {
            return "unregistered category"
        }
        return category
    }

    async save(request: Request, _response: Response, _next: NextFunction) {
        const { name } = request.body;

        const category = Object.assign(new CouponWebsite(), {
            name,
            tablePath: "coupons_website",
        })

        return this.couponsWebRepository.save(category)
    }

    async remove(request: Request, _response: Response, _next: NextFunction) {
        const id = parseInt(request.params.id)

        let categoryToRemove = await this.couponsWebRepository.findOneBy({ id })

        if (!categoryToRemove) {
            return "this category not exist"
        }

        await this.couponsWebRepository.remove(categoryToRemove)

        return "category has been removed"
    }

}

