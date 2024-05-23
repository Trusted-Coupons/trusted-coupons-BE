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
    
    @Column({ type: "varchar", length: 255})
    AU_English:string;

    @Column({ type: "varchar", length: 255})
    CA_English:string;

    @Column({ type: "varchar", length: 255})
    CA_French:string;

    @Column({ type: "varchar", length: 255})
    GB_English:string;

    @Column({ type: "varchar", length: 255})
    IN_English:string;

    @Column({ type: "varchar", length: 255})
    IN_Hindi:string;

    @Column({ type: "varchar", length: 255})
    PH_English:string;

    @Column({ type: "varchar", length: 255})
    PH_Filipino:string;

    @Column({ type: "varchar", length: 255})
    US_English:string;

    @Column({ type: "varchar", length: 255})
    US_Spanish:string;

    @Column({ type: "varchar", length: 255})
    CZ_Czech:string;

    @Column({ type: "varchar", length: 255})
    CZ_Slovak:string;

    @Column({ type: "varchar", length: 255})
    DE_German:string;

    @Column({ type: "varchar", length: 255})
    SK_Slovak:string;

    @Column({ type: "varchar", length: 255})
    AT_German:string;

    @Column({ type: "varchar", length: 255})
    CH_German:string;

    @Column({ type: "varchar", length: 255})
    CH_French:string;

    @Column({ type: "varchar", length: 255})
    CH_Italian:string;

    @Column({ type: "varchar", length: 255})
    GR_Greek:string;

    @Column({ type: "varchar", length: 255})
    NL_Dutch:string;

    @Column({ type: "varchar", length: 255})
    PL_Polish:string;

    @Column({ type: "varchar", length: 255})
    FR_French:string;

    @Column({ type: "varchar", length: 255})
    IE_English:string;

    @Column({ type: "varchar", length: 255})
    IE_Irish:string;

    @Column({ type: "varchar", length: 255})
    KR_Korean:string;

    @Column({ type: "varchar", length: 255})
    UA_Ukrainian:string;

    @Column({ type: "varchar", length: 255})
    BE_Dutch:string;

    @Column({ type: "varchar", length: 255})
    BE_French:string;

    @Column({ type: "varchar", length: 255})
    BE_German:string;

    @Column({ type: "varchar", length: 255})
    AE_Arabic:string;

    @Column({ type: "varchar", length: 255})
    AL_Albanian:string;

    @Column({ type: "varchar", length: 255})
    AM_Armenian:string;

    @Column({ type: "varchar", length: 255})
    AR_Spanish:string;

    @Column({ type: "varchar", length: 255})
    AZ_Azerbaijani:string;

    @Column({ type: "varchar", length: 255})
    BA_Serbian:string;

    @Column({ type: "varchar", length: 255})
    BD_Bengali:string;

    @Column({ type: "varchar", length: 255})
    BG_Bulgarian:string;

    @Column({ type: "varchar", length: 255})
    BH_Arabic:string;

    @Column({ type: "varchar", length: 255})
    BO_Spanish:string;

    @Column({ type: "varchar", length: 255})
    BR_Portuguese:string;

    @Column({ type: "varchar", length: 255})
    CL_Spanish:string;

    @Column({ type: "varchar", length: 255})
    CN_Chinese:string;

    @Column({ type: "varchar", length: 255})
    CO_Spanish:string;

    @Column({ type: "varchar", length: 255})
    CR_Spanish:string;

    @Column({ type: "varchar", length: 255})
    CY_Greek:string;

    @Column({ type: "varchar", length: 255})
    CY_Turkish:string;

    @Column({ type: "varchar", length: 255})
    DK_Danish:string;

    @Column({ type: "varchar", length: 255})
    DO_Spanish:string;

    @Column({ type: "varchar", length: 255})
    EC_Spanish:string;

    @Column({ type: "varchar", length: 255})
    EE_Estonian:string;

    @Column({ type: "varchar", length: 255})
    EG_Arabic:string;

    @Column({ type: "varchar", length: 255})
    ES_Spanish:string;

    @Column({ type: "varchar", length: 255})
    FI_Finnish:string;

    @Column({ type: "varchar", length: 255})
    FI_Swedish:string;

    @Column({ type: "varchar", length: 255})
    GE_Georgian:string;

    @Column({ type: "varchar", length: 255})
    GT_Spanish:string;

    @Column({ type: "varchar", length: 255})
    HN_Spanish:string;

    @Column({ type: "varchar", length: 255})
    HR_Croatian:string;

    @Column({ type: "varchar", length: 255})
    HU_Hungarian:string;

    @Column({ type: "varchar", length: 255})
    ID_Indonesian:string;

    @Column({ type: "varchar", length: 255})
    IL_Hebrew:string;

    @Column({ type: "varchar", length: 255})
    IS_Icelandic:string;

    @Column({ type: "varchar", length: 255})
    IT_Italian:string;

    @Column({ type: "varchar", length: 255})
    JM_English:string;

    @Column({ type: "varchar", length: 255})
    JO_Arabic:string;

    @Column({ type: "varchar", length: 255})
    JP_Japanese:string;

    @Column({ type: "varchar", length: 255})
    KW_Arabic:string;

    @Column({ type: "varchar", length: 255})
    KZ_Kazakh:string;

    @Column({ type: "varchar", length: 255})
    KZ_Russian:string;

    @Column({ type: "varchar", length: 255})
    LA_Lao:string;

    @Column({ type: "varchar", length: 255})
    LB_Arabic:string;

    @Column({ type: "varchar", length: 255})
    LK_English:string;

    @Column({ type: "varchar", length: 255})
    LT_Lithuanian:string;

    @Column({ type: "varchar", length: 255})
    LU_French:string;

    @Column({ type: "varchar", length: 255})
    LU_German:string;

    @Column({ type: "varchar", length: 255})
    LU_Luxembourgish:string;

    @Column({ type: "varchar", length: 255})
    LV_Latvian:string;

    @Column({ type: "varchar", length: 255})
    MA_Arabic:string;

    @Column({ type: "varchar", length: 255})
    MD_Romanian:string;

    @Column({ type: "varchar", length: 255})
    ME_Serbian:string;

    @Column({ type: "varchar", length: 255})
    MK_Macedonian:string;

    @Column({ type: "varchar", length: 255})
    MK_Albanian:string;

    @Column({ type: "varchar", length: 255})
    MT_English:string;

    @Column({ type: "varchar", length: 255})
    MT_Maltese:string;

    @Column({ type: "varchar", length: 255})
    MX_Spanish:string;

    @Column({ type: "varchar", length: 255})
    MY_Malay:string;

    @Column({ type: "varchar", length: 255})
    NG_English:string;

    @Column({ type: "varchar", length: 255})
    NI_Spanish:string;

    @Column({ type: "varchar", length: 255})
    NO_Norwegian:string;

    @Column({ type: "varchar", length: 255})
    NZ_English:string;

    @Column({ type: "varchar", length: 255})
    OM_Arabic:string;

    @Column({ type: "varchar", length: 255})
    PA_Spanish:string;

    @Column({ type: "varchar", length: 255})
    PE_Spanish:string;

    @Column({ type: "varchar", length: 255})
    PK_English:string;

    @Column({ type: "varchar", length: 255})
    PK_Urdu:string;

    @Column({ type: "varchar", length: 255})
    PT_Portuguese:string;

    @Column({ type: "varchar", length: 255})
    PY_Spanish:string;

    @Column({ type: "varchar", length: 255})
    QA_Arabic:string;

    @Column({ type: "varchar", length: 255})
    RO_Romanian:string;

    @Column({ type: "varchar", length: 255})
    RS_Serbian:string;

    @Column({ type: "varchar", length: 255})
    RU_Russian:string;

    @Column({ type: "varchar", length: 255})
    SA_Arabic:string;

    @Column({ type: "varchar", length: 255})
    SE_Swedish:string;

    @Column({ type: "varchar", length: 255})
    SG_English:string;

    @Column({ type: "varchar", length: 255})
    SG_Malay:string;

    @Column({ type: "varchar", length: 255})
    SG_Tamil:string;

    @Column({ type: "varchar", length: 255})
    SI_Slovenian:string;

    @Column({ type: "varchar", length: 255})
    SV_Spanish:string;

    @Column({ type: "varchar", length: 255})
    TH_Thai:string;

    @Column({ type: "varchar", length: 255})
    TR_Turkish:string;

    @Column({ type: "varchar", length: 255})
    TW_Chinese:string;

    @Column({ type: "varchar", length: 255})
    UY_Spanish:string;

    @Column({ type: "varchar", length: 255})
    VN_Vietnamese:string;

    @Column({ type: "varchar", length: 255})
    ZA_Afrikaans:string;

    @Column({ type: "varchar", length: 255})
    ZA_English:string;

    @Column({ type: "varchar", length: 255})
    ZA_Zulu:string;

    
    public coupons = new Array<Coupon>();

    public allCategoriesArr: string[] = [];

    public keywordsArr: string;

    public allTopicsArr: string[] = [];

    public storeMetadata: StoreMd[]

    public storeCouponsLength: number


}