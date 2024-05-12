import { Store } from "../entity/Store";
// import { StoreMd } from "../entity/StoreMd";

export const fillMetadatVariables = (metadata: any, store: Store, fullCountryName: string | undefined) => {
    const couponLabel = store.coupons[0].label ? store.coupons[0].label : "";
    const { fullYear, month } = getCurrenYearAndMonth();
    const currentWebsiteName = 'trusted.coupons'

    const replacements = {
        STORE: getStoreName(store.store),
        DEAL: couponLabel,
        CURRENT_MONTH: month,
        CURRENT_YEAR: fullYear,
        STORE_CATEGORY: store.mainCategory, 
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

const getStoreName = (storeName:string):string =>{
    const arrStr = storeName.split(".");
    return arrStr.slice(1, -1).join(".");
}

const getCurrenYearAndMonth = () => {
    const date = new Date(); // Current date
    const month = date.toLocaleString('default', { month: 'long' });

    return {
        fullYear: date.getFullYear(),
        month
    }
}