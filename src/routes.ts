import { CouponsController } from "./controller/CouponsController"

type Routes = {
    method: string;
    route: string;
    controller:any;
    action: string;
}

const couponRoutes:Routes = {
    method: "get",
    route: "/:ln/coupons",
    controller: CouponsController,
    action: "all"
}

export const Routes = [
    couponRoutes
]
