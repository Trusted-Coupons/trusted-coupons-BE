import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { CouponWebisteLanguageBased } from "../entity/CouponWebsiteLangagueBased"
import { CountryLanguage } from "../entity/CountryLanguage"
export class CouponsWebsiteLangagueBasedController {

    private couponsWebLangagueBasedRepository = AppDataSource.getRepository(CouponWebisteLanguageBased)
    private countryLanguageRepository = AppDataSource.getRepository(CountryLanguage);
    private table_prefix:string = "coupons_website"

    async all(_request: Request, _next: NextFunction) {
        const ln = _request.params.lng

        const languageSuffix = await this.countryLanguageRepository.findOne({where:[
            {Alpha_2: ln},
            {Alpha_3:ln}
        ]
        })
        const table = this.table_prefix + "_" + languageSuffix?.Alpha_2_Lang + '_' + languageSuffix?.Language1.toLowerCase();
      
        this.couponsWebLangagueBasedRepository.metadata.tablePath = table;

        const coupons: CouponWebisteLanguageBased[]  = await this.couponsWebLangagueBasedRepository.createQueryBuilder(table).limit(100).orderBy("id", "ASC").getMany();
        return coupons
    }

    async one(request: Request, _response: Response, _next: NextFunction) {
        const id = parseInt(request.params.id)

        const coupon = await this.couponsWebLangagueBasedRepository.findOneBy({ id })

        if (!coupon) {
            return "coupon with id: " + id + " not found"
        }
        return coupon
    }


}

