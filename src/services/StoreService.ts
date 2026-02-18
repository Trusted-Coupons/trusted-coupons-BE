import { Store } from "../entity/Store";

/**
 * Fills in the metadata variables for a store.
 *
 * @param metadata - The metadata to fill in.
 * @param store - The store to fill in the metadata with.
 * @param fullCountryName - The full country name to fill in the metadata with.
 * @returns The filled-in metadata.
 */
export const fillMetadatVariables = (
  metadata: any[],
  store: Store,
  fullCountryName: string | undefined
): any[] => {
  // Cache to store processed metadata
  const cacheKey = `${store.id}_${fullCountryName || "default"}`;
  const cachedResult = metadataCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // Get coupon label efficiently
  const couponLabel = store.coupons.length
    ? store.coupons[getRandomIntBetween(0, store.coupons.length - 1)].label
    : "";

  // Get current year and month
  const { fullYear, month } = getCurrenYearAndMonth();

  // Define replacements
  const replacements: { [key: string]: string } = {
    STORE: getStoreName(store.store),
    DEAL: couponLabel,
    CURRENT_MONTH: month,
    CURRENT_YEAR: fullYear.toString(),
    STORE_CATEGORY: store.mainCategory.replace(/_/g, " "),
    COUNTRY: fullCountryName || "",
    MY_WEBSITE: "trusted.coupons",
  };

  // Optimize replacements using a single pass
  const result = metadata.map((item) => {
    let { metadata_description, metadata_title } = item;
    for (const [varName, value] of Object.entries(replacements)) {
      const varToReplace = `{{${varName}}}`;
      const regex = new RegExp(varToReplace, "g");
      metadata_description = metadata_description.replace(regex, value);
      metadata_title = metadata_title.replace(regex, value);
    }
    return { ...item, metadata_description, metadata_title };
  });

  // Cache result (evict oldest entry if at capacity)
  evictMetadataCacheIfFull();
  metadataCache.set(cacheKey, result);

  return result;
};

// In-memory cache for processed metadata templates.
// Keyed by store ID + country; bounded to avoid growing indefinitely.
const METADATA_CACHE_MAX = 2000;
const metadataCache = new Map<string, any[]>();

function evictMetadataCacheIfFull(): void {
  if (metadataCache.size >= METADATA_CACHE_MAX) {
    const firstKey = metadataCache.keys().next().value;
    metadataCache.delete(firstKey);
  }
}

const getStoreName = (storeName: string): string => {
  const dotIndex1 = storeName.indexOf(".");
  const dotIndex2 = storeName.lastIndexOf(".");

  if (dotIndex1 !== -1 && dotIndex2 !== -1 && dotIndex1 !== dotIndex2) {
    return storeName.substring(dotIndex1 + 1, dotIndex2);
  }
  return storeName.substring(
    0,
    dotIndex2 !== -1 ? dotIndex2 : storeName.length
  );
};

const getCurrenYearAndMonth = () => {
  const date = new Date();
  return {
    fullYear: date.getFullYear(),
    month: date.toLocaleString("default", { month: "long" }),
  };
};

const getRandomIntBetween = (min: number, max: number): number => {
  if (min === max) return max;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
