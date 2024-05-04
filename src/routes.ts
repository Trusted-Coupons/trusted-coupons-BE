import { CouponsController } from "./controller/CouponsController"

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
    }
]
