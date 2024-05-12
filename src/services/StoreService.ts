import { Store } from "../entity/Store";
// import { StoreMd } from "../entity/StoreMd";

export const fillMetadatVariables = (metadata: any, store: Store, fullCountryName: string | undefined) => {
    let storeCouponsLength = store.coupons.length;
    let couponLabel: string;

    if (storeCouponsLength === 0) {
        couponLabel = "";
    } else {
        let randomCoupon = getRandomIntBetween(0, storeCouponsLength - 1);
        couponLabel = store.coupons[randomCoupon].label;
    }

    const { fullYear, month } = getCurrenYearAndMonth();
    const currentWebsiteName = 'trusted.coupons'

    const replacements = {
        STORE: getStoreName(store.store),
        DEAL: couponLabel,
        CURRENT_MONTH: month,
        CURRENT_YEAR: fullYear,
        STORE_CATEGORY: store.mainCategory.replace(/_/g, " "),
        COUNTRY: fullCountryName,
        MY_WEBSITE: currentWebsiteName

    }
    for (const key in metadata) {
        for (const varName in replacements) {
            const varToReplace = `{{${varName}}}`;
            metadata[key].metadata_description = metadata[key].metadata_description.replace(new RegExp(varToReplace, 'g'), replacements[varName]);
            metadata[key].metadata_title = metadata[key].metadata_title.replace(new RegExp(varToReplace, 'g'), replacements[varName]);

        }
    }

    return metadata;
}

const getStoreName = (storeName: string): string => {
    const dotIndex1 = storeName.indexOf(".");
    const dotIndex2 = storeName.lastIndexOf(".");

    if (dotIndex1 !== -1 && dotIndex2 !== -1 && dotIndex1 !== dotIndex2) {
        return storeName.substring(dotIndex1 + 1, dotIndex2);
    } else {
        return storeName.substring(0, dotIndex2);
    }
}

const getCurrenYearAndMonth = () => {
    const date = new Date(); // Current date
    const month = date.toLocaleString('default', { month: 'long' });

    return {
        fullYear: date.getFullYear(),
        month
    }
}

const getRandomIntBetween = (min: number, max: number) => {
    if (min === max) {
        return max;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
};