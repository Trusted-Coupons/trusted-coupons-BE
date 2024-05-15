import "reflect-metadata";
import { DataSource } from "typeorm";
import { Coupon } from "./entity/Coupon";
import { CountryLanguage } from "./entity/CountryLanguage";
import { Store } from "./entity/Store";
import { Category } from "./entity/Category";
import { StoreMd } from "./entity/StoreMd";
require("dotenv").config();

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.HOST,
    port: Number(process.env.PORT),
    username: process.env.USERNAME,
    password: process.env.PASSWORD?.toString(),
    database: process.env.DATABASE,
    synchronize: false,
    logging: false,
    entities: [Coupon, CountryLanguage, Store, Category, StoreMd],
    migrations: [],
    migrationsRun: false,
    subscribers: [],
});