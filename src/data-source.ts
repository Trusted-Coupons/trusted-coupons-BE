import "reflect-metadata"
import { DataSource } from "typeorm"
import { CouponWebsite } from "./entity/CouponWebsite" 
import { CouponWebisteLanguageBased } from "./entity/CouponWebsiteLangagueBased"
import { CountryLanguage } from "./entity/CountryLanguage"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "89.216.18.147",
    port: 5432,
    username: "postgres",
    password: "Admin1",
    database: "postgres",
    synchronize: false,
    logging: true,
    entities: [
        CouponWebsite,
        CouponWebisteLanguageBased,
        CountryLanguage
        
    ],
    migrations: [],
    migrationsRun: false,
    subscribers: [],
})
