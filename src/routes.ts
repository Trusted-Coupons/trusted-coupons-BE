import { CouponsController } from "./controller/CouponsController"
import { StoresController } from "./controller/StoresController"
import { CategoriesController } from "./controller/CategoriesController"
export const Routes = [
    {
        method: "get",
        route: "/:ln/coupons",
        controller: CouponsController,
        action: "all"
    },
    {
        method: "get",
        route: "/:ln_formated/coupon/:id",
        controller: CouponsController,
        action: "one"
    },
    {
        method: "post",
        route: "/:ln_formated/coupon/:id",
        controller: CouponsController,
        action: "clicked"
    },
    {
        method: "get",
        route: "/:ln/stores",
        controller: StoresController,
        action: "all"
    },
    {
        method: "get",
        route: "/:ln/store/:id",
        controller: StoresController,
        action: "one"
    },
    {
        method: "get",
        route: "/:ln/stores-all",
        controller: StoresController,
        action: "getStoresWithAlphabeticalKeys"
    },
    {
        method: "get",
        route: "/:ln/categories-all",
        controller: CategoriesController,
        action: "getCategoriesWithAlphabeticalKeys"
    },
]
