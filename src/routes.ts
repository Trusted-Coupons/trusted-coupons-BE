import { CouponsWebsiteController } from "./controller/CouponsWebsiteController"
import { CouponsWebsiteLangagueBasedController } from "./controller/CouponsWebsiteLangagueBasedController"

export const Routes = [{
    method: "get",
    route: "/coupons-website",
    controller: CouponsWebsiteController,
    action: "all"
}, {
    method: "get",
    route: "/coupons-website/:id",
    controller: CouponsWebsiteController,
    action: "one"
}, {
    method: "post",
    route: "/coupons-website",
    controller: CouponsWebsiteController,
    action: "save"
}, {
    method: "delete",
    route: "/coupons-website/:id",
    controller: CouponsWebsiteController,
    action: "remove"
},
{
    method: "get",
    route: "/:lng/coupons-website",
    controller: CouponsWebsiteLangagueBasedController,
    action: "all"
}
]
