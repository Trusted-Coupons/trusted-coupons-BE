import { AppDataSource } from "../data-source";
import { CountryLanguage } from "../entity/CountryLanguage";

type LanguageTableResponse = {
  table: string;
  statusCode: number;
  language: string;
  fullCountryName?: string;
};

/**
 * Gets the table name for the given language code.
 *
 * @param languageCode - The language code in the format of "xx-XX" where "xx" is the ISO 639-1 language code and "XX" is the ISO 3166-1 alpha-2 country code.
 * @returns A promise that resolves to an object containing the table name, status code, language code, and full country name.
 */
export const getTableForLanguage = async (
  languageCode: string
): Promise<LanguageTableResponse> => {
  const { country } = extractLanguageAndCountry(languageCode);

  // Cache check
  const cacheKey = `table_${country}`;
  const cached = languageTableCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const repository = AppDataSource.getRepository(CountryLanguage);
  const languageData = await repository.findOne({
    where: [{ Alpha_2: country }, { Alpha_3: country }],
    cache: false, // Disable TypeORM caching
  });

  const result: LanguageTableResponse = {
    table: languageData
      ? `${languageData.Alpha_2.toLowerCase()}_${languageData.Language1.toLowerCase()}`
      : "none",
    statusCode: languageData ? 200 : 404,
    language: languageData ? languageData.Language1 : "none",
    fullCountryName: languageData ? languageData.Country : "none",
  };

  // Cache result (evict oldest entry if at capacity)
  evictIfFull(languageTableCache);
  languageTableCache.set(cacheKey, result);

  return result;
};

/**
 * Checks if the language code is formatted correctly (e.g., "xx-XX").
 *
 * @param ln - The language code to check.
 * @returns True if the format is valid, false otherwise.
 */
export const isLanguageFormatted = (ln: string): boolean => {
  return /^[a-z]{2}-[A-Z]{2}$/.test(ln);
};

/**
 * Extracts language and country from a language code.
 *
 * @param languageCode - The language code (e.g., "en-US").
 * @returns An object with language and country properties.
 */
export const extractLanguageAndCountry = (
  languageCode: string
): { language: string; country: string } => {
  const [language = "", country = ""] = languageCode.split("-");
  return { language, country };
};

/**
 * Gets the primary language used in a country based on the language code.
 *
 * @param languageCode - The language code (e.g., "en-US").
 * @returns The primary language or undefined if not found.
 */
export const getLanguageUsedInCountry = async (
  languageCode: string
): Promise<string | undefined> => {
  const { language } = extractLanguageAndCountry(languageCode);
  if (!language) return undefined;

  const cacheKey = `lang_${language}`;
  const cached = languageCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const repository = AppDataSource.getRepository(CountryLanguage);
  const languageData = await repository.findOne({
    where: { Alpha_2_Lang: language },
    cache: false, // Disable TypeORM caching
  });

  const result = languageData?.Language1;
  evictIfFull(languageCache);
  languageCache.set(cacheKey, result);

  return result;
};

// In-memory caches — bounded to prevent unbounded memory growth.
// Country/language combos are finite (~250 entries max) so 500 is a safe ceiling.
const CACHE_MAX_SIZE = 500;
const languageTableCache = new Map<string, LanguageTableResponse>();
const languageCache = new Map<string, string | undefined>();

function evictIfFull(cache: Map<string, any>): void {
  if (cache.size >= CACHE_MAX_SIZE) {
    // Delete the oldest entry (Maps preserve insertion order)
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
}
