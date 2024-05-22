import { AppDataSource } from "../data-source";
import { CountryLanguage } from "../entity/CountryLanguage";

type LanguageTableResponse = {
    table: string,
    statusCode:number,
    langauage:string,
    fullCountryName?:string
}

/**
 * Gets the table name for the given language code.
 *
 * @param languageCode - The language code in the format of "xx-XX" where "xx" is the ISO 639-1 language code and "XX" is the ISO 3166-1 alpha-2 country code.
 * @returns A promise that resolves to an object containing the table name, status code, language code, and full country name.
 */
export const getTableForLanguage = async (languageCode: string): Promise<LanguageTableResponse> => {
  const { country } = extractLanguageAndCountry(languageCode);
  const repository = AppDataSource.getRepository(CountryLanguage);
  const languageData = await repository.findOne({
    where: [
      { Alpha_2: country }, // Try to find the language by the ISO 3166-1 alpha-2 country code
      { Alpha_3: country }, // Try to find the language by the ISO 3166-1 alpha-3 country code
    ],
  });

  const table = languageData
    ? `${languageData.Alpha_2.toLowerCase()}_${languageData.Language1.toLowerCase()}`
    : 'none';
  const statusCode = languageData ? 200 : 404;
  const langauage = languageData ? languageData.Language1 : 'none';
  const fullCountryName = languageData ? languageData.Country : 'none';

  return { table, statusCode, langauage, fullCountryName };
}

export const isLangauageFormated = (ln:string): boolean => {
    const pattern = /^[a-z]{2}-[A-Z]{2}$/;
    return pattern.test(ln);
}

export const extractLanguageAndCountry = (languageCode: string): { language: string, country: string } => {
    const [language, country] = languageCode.split("-") as [string, string];
    return { language, country };
}

export const getLanguageUsedInCountry = async (languageCode:string) => {
  const { language } = extractLanguageAndCountry(languageCode);
 
  const repository = AppDataSource.getRepository(CountryLanguage);
  const languageData = await repository.findOne({ where: { Alpha_2_Lang: language }});

  return languageData?.Language1;
}