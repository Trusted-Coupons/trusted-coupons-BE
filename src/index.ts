import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { Routes } from "./routes"
const cors = require("cors");
require('dotenv').config({ path:'.env' })

AppDataSource.initialize().then(async () => {
    // Create a Redis client


    // create express app
    const app = express()
    app.use(cors());
    app.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'https://clownfish-app-uq5u9.ondigitalocean.app');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        next();
    });

    app.use(bodyParser.json())
    // register express routes from defined application routes
    Routes.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })

    // start express server
    app.listen(3010)

}).catch(error => console.log(error))
