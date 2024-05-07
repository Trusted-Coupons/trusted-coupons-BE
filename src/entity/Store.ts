import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { Coupon } from "./Coupon";

@Entity('stores_info')
export class Store {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    store: string;

    @Column({ type: "varchar", length: 255 })
    icon: string;

    @Column({ type: "varchar", length: 255 })
    previewDesktop: string;

    @Column({ type: "varchar", length: 255 })
    previewMobile: string;

    @Column({ type: "varchar", length: 255 })
    description: string;

    @Column({ type: "integer" })
    globalRank: number;

    @Column({ type: "varchar", length: 2 })
    countryAlpha2Code: string;

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

    @Column({ type: "integer" })
    totalCountries: number;

    @Column({ type: "varchar", length: 255 })
    countries: string;

    @Column({ type: "varchar", length: 255 })
    country_language: string;

    public coupons = new Array<Coupon>();
}