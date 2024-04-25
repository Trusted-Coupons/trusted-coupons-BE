import "reflect-metadata"
import { DataSource } from "typeorm"
import { CouponWebsite } from "./entity/CouponWebsite" 

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
        CouponWebsite
    ],
    migrations: [],
    migrationsRun: false,
    subscribers: [],
})
