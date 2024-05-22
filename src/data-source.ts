import "reflect-metadata"
import { DataSource } from "typeorm"
import { Coupon } from "./entity/Coupon" 
import { CountryLanguage } from "./entity/CountryLanguage"
import { Store} from "./entity/Store"
import { Category } from "./entity/Category"
import { StoreMd } from "./entity/StoreMd"
require('dotenv').config({ path:'.env' })
export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: process.env.PORT ? parseInt(process.env.PORT) : 5432,
    username:process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [
        Coupon,
        CountryLanguage,
        Store,
        Category,
        StoreMd
    ],
    migrations: [],
    migrationsRun: false,
    subscribers: [],
})
