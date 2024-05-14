import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Coupon } from "./Coupon";
import { StoreMd } from "./StoreMd";

export type StoreMetadata = {
    store: string,
    deal: string,
    current_month: string,
    current_year: string,
    store_category: string,
    country: string,
    my_website: string
}

@Entity({ name: 'stores_website'})
export class Store {
    @PrimaryGeneratedColumn()
    id: number;


    @Column({ type: "varchar", length: 255 })
    store: string;

    @Column({ type: "varchar", length: 255 })
    description: string;

    @Column({ type: "integer" })
    globalRank: number;

    @Column({ type: "integer" })
    countryRank: number;

    @Column({ type: "integer" })
    categoryRank: number;

    @Column({ type: "integer" })
    monthlyVisits: number;

    @Column({ type: "varchar", length: 255 })
    mainCategory: string;

    @Column({ type: "varchar", length: 255 })
    altTopics: string;

    @Column({ type: "varchar", length: 255 })
    altCategories: string;

    @Column({ type: "varchar", length: 255 })
    keywords: string;

    @Column({ type: "varchar", length: 255 })
    ourCategories: string;

    @Column({ type: "varchar", length: 255 })
    country_language: string;

    @Column({ type: "varchar", length: 255, name: 'AU_English' })
    AU_English: string;

    @Column({ type: "varchar", length: 255, name: 'BE_Dutch' })
    BE_Dutch: string;

    @Column({ type: "varchar", length: 255, name: 'BE_French' })
    BE_French: string;

    @Column({ type: "varchar", length: 255, name: 'BE_German' })
    BE_German: string;

    @Column({ type: "varchar", length: 255, name: 'BG_Bulgarian' })
    BG_Bulgarian: string;

    @Column({ type: "varchar", length: 255, name: 'BH_Arabic' })
    BH_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'BO_Spanish' })
    BO_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'BR_Portuguese' })
    BR_Portuguese: string;

    @Column({ type: "varchar", length: 255, name: 'CA_English' })
    CA_English: string;

    @Column({ type: "varchar", length: 255, name: 'CA_French' })
    CA_French: string;

    @Column({ type: "varchar", length: 255, name: 'CL_Spanish' })
    CL_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'CN_Chinese' })
    CN_Chinese: string;

    @Column({ type: "varchar", length: 255, name: 'CO_Spanish' })
    CO_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'CR_Spanish' })
    CR_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'CY_Greek' })
    CY_Greek: string;

    @Column({ type: "varchar", length: 255, name: 'CY_Turkish' })
    CY_Turkish: string;

    @Column({ type: "varchar", length: 255, name: 'CZ_Czech' })
    CZ_Czech: string;

    @Column({ type: "varchar", length: 255, name: 'DE_German' })
    DE_German: string;

    @Column({ type: "varchar", length: 255, name: 'DK_Danish' })
    DK_Danish: string;

    @Column({ type: "varchar", length: 255, name: 'DO_Spanish' })
    DO_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'EC_Spanish' })
    EC_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'EE_Estonian' })
    EE_Estonian: string;

    @Column({ type: "varchar", length: 255, name: 'EG_Arabic' })
    EG_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'ES_Spanish' })
    ES_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'FI_Finnish' })
    FI_Finnish: string;

    @Column({ type: "varchar", length: 255, name: 'FI_Swedish' })
    FI_Swedish: string;

    @Column({ type: "varchar", length: 255, name: 'GE_Georgian' })
    GE_Georgian: string;

    @Column({ type: "varchar", length: 255, name: 'GT_Spanish' })
    GT_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'HN_Spanish' })
    HN_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'HR_Croatian' })
    HR_Croatian: string;

    @Column({ type: "varchar", length: 255, name: 'HU_Hungarian' })
    HU_Hungarian: string;

    @Column({ type: "varchar", length: 255, name: 'ID_Indonesian' })
    ID_Indonesian: string;

    @Column({ type: "varchar", length: 255, name: 'IL_Hebrew' })
    IL_Hebrew: string;

    @Column({ type: "varchar", length: 255, name: 'IS_Icelandic' })
    IS_Icelandic: string;

    @Column({ type: "varchar", length: 255, name: 'IT_Italian' })
    IT_Italian: string;

    @Column({ type: "varchar", length: 255, name: 'JM_English' })
    JM_English: string;

    @Column({ type: "varchar", length: 255, name: 'JO_Arabic' })
    JO_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'JP_Japanese' })
    JP_Japanese: string;

    @Column({ type: "varchar", length: 255, name: 'KW_Arabic' })
    KW_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'KZ_Kazakh' })
    KZ_Kazakh: string;

    @Column({ type: "varchar", length: 255, name: 'KZ_Russian' })
    KZ_Russian: string;

    @Column({ type: "varchar", length: 255, name: 'LA_Lao' })
    LA_Lao: string;

    @Column({ type: "varchar", length: 255, name: 'LB_Arabic' })
    LB_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'LK_English' })
    LK_English: string;

    @Column({ type: "varchar", length: 255, name: 'LT_Lithuanian' })
    LT_Lithuanian: string;

    @Column({ type: "varchar", length: 255, name: 'LU_French' })
    LU_French: string;

    @Column({ type: "varchar", length: 255, name: 'LU_German' })
    LU_German: string;

    @Column({ type: "varchar", length: 255, name: 'LU_Luxembourgish' })
    LU_Luxembourgish: string;

    @Column({ type: "varchar", length: 255, name: 'LV_Latvian' })
    LV_Latvian: string;

    @Column({ type: "varchar", length: 255, name: 'MA_Arabic' })
    MA_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'MD_Romanian' })
    MD_Romanian: string;

    @Column({ type: "varchar", length: 255, name: 'ME_Serbian' })
    ME_Serbian: string;

    @Column({ type: "varchar", length: 255, name: 'MK_Macedonian' })
    MK_Macedonia: string;

    @Column({ type: "varchar", length: 255, name: 'MK_Albanian' })
    MK_Albanian: string;

    @Column({ type: "varchar", length: 255, name: 'MT_English' })
    MT_English: string;

    @Column({ type: "varchar", length: 255, name: 'MT_Maltese' })
    MT_Maltese: string;

    @Column({ type: "varchar", length: 255, name: 'MX_Spanish' })
    MX_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'MY_Malay' })
    MY_Malay: string;

    @Column({ type: "varchar", length: 255, name: 'NG_English' })
    NG_English: string;

    @Column({ type: "varchar", length: 255, name: 'NI_Spanish' })
    NI_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'NO_Norwegian' })
    NO_Norwegian: string;

    @Column({ type: "varchar", length: 255, name: 'NZ_English' })
    NZ_English: string;

    @Column({ type: "varchar", length: 255, name: 'OM_Arabic' })
    OM_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'PA_Spanish' })
    PA_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'PE_Spanish' })
    PE_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'PK_English' })
    PK_English: string;

    @Column({ type: "varchar", length: 255, name: 'PK_Urdu' })
    PK_Urdu: string;

    @Column({ type: "varchar", length: 255, name: 'PT_Portuguese' })
    PT_Portuguese: string;

    @Column({ type: "varchar", length: 255, name: 'PY_Spanish' })
    PY_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'QA_Arabic' })
    QA_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'RO_Romanian' })
    RO_Romanian: string;

    @Column({ type: "varchar", length: 255, name: 'RS_Serbian' })
    RS_Serbian: string;

    @Column({ type: "varchar", length: 255, name: 'RU_Russian' })
    RU_Russian: string;

    @Column({ type: "varchar", length: 255, name: 'SA_Arabic' })
    SA_Arabic: string;

    @Column({ type: "varchar", length: 255, name: 'SE_Swedish' })
    SE_Swedish: string;

    @Column({ type: "varchar", length: 255, name: 'SG_English' })
    SG_English: string;

    @Column({ type: "varchar", length: 255, name: 'SG_Malay' })
    SG_Malay: string;

    @Column({ type: "varchar", length: 255, name: 'SG_Tamil' })
    SG_Tamil: string;

    @Column({ type: "varchar", length: 255, name: 'SI_Slovenian' })
    SI_Slovenian: string;

    @Column({ type: "varchar", length: 255, name: 'SV_Spanish' })
    SV_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'TH_Thai' })
    TH_Thai: string;

    @Column({ type: "varchar", length: 255, name: 'TR_Turkish' })
    TR_Turkish: string;

    @Column({ type: "varchar", length: 255, name: 'TW_Chinese' })
    TW_Chinese: string;

    @Column({ type: "varchar", length: 255, name: 'UY_Spanish' })
    UY_Spanish: string;

    @Column({ type: "varchar", length: 255, name: 'VN_Vietnamese' })
    VN_Vietnamese: string;

    @Column({ type: "varchar", length: 255, name: 'ZA_Afrikaans' })
    ZA_Afrikaans: string;

    @Column({ type: "varchar", length: 255, name: 'ZA_English' })
    ZA_English: string;

    @Column({ type: "varchar", length: 255, name: 'ZA_Zulu' })
    ZA_Zulu: string;

    public coupons = new Array<Coupon>();

    public allCategoriesArr: string[] = [];

    public keywordsArr: string[] = [];

    public allTopicsArr: string[] = [];

    public storeMetadata: StoreMd[]

    public storeCouponsLength: number


}