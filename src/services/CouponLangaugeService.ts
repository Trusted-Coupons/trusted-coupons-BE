import { AppDataSource } from "../data-source";
import { CountryLanguage } from "../entity/CountryLanguage";

type LanguageTableResponse = {
    table: string,
    statusCode:number
}

export const getTableForLanguage = async (languageCode: string): Promise<LanguageTableResponse> => {
  const { country } = extractLanguageAndCountry(languageCode);
  const repository = AppDataSource.getRepository(CountryLanguage);
  const languageData = await repository.findOne({ where: [{ Alpha_2: country }, { Alpha_3: country }] });

  const table = languageData
    ? `${languageData.Alpha_2.toLowerCase()}_${languageData.Language1.toLowerCase()}`
    : 'none';
  const statusCode = languageData ? 200 : 404;

  return { table, statusCode };
}

export const isLangauageFormated = (ln:string): boolean => {
    const pattern = /^[a-z]{2}-[A-Z]{2}$/;
    return pattern.test(ln);
}

export const extractLanguageAndCountry = (languageCode: string): { language: string, country: string } => {
    const [language, country] = languageCode.split("-") as [string, string];
    return { language, country };
}
