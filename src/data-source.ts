import "reflect-metadata"
import { DataSource } from "typeorm"
import { Coupon } from "./entity/Coupon" 
import { CountryLanguage } from "./entity/CountryLanguage"
import { Store} from "./entity/Store"

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "postgres",
    synchronize: false,
    logging: true,
    entities: [
        Coupon,
        CountryLanguage,
        Store
    ],
    migrations: [],
    migrationsRun: false,
    subscribers: [],
})
