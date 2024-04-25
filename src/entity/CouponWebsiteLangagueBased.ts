import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class CouponWebisteLanguageBased {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    offer_id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    label: string;

    @Column()
    code: string;

    @Column()
    featured: boolean;

    @Column()
    source: string;

    @Column()
    deeplink: string;

    @Column()
    affiliate_link: string;

    @Column()
    cashback_link: string;

    @Column()
    url: string;

    @Column()
    image_url: string;

    @Column()
    brand_logo: string;

    @Column()
    type: string;

    @Column()
    store: string;

    @Column()
    merchant_home_page: string;

    @Column()
    categories: string;

    @Column()
    standard_categories: string;

    @Column()
    start_date: string;

    @Column()
    end_date: string;

    @Column()
    status: string;

    @Column()
    primary_location: string;

    @Column()
    locations: string; // Assuming this is a comma-separated list of locations

    @Column()
    language: string;

    @Column()
    rating: number; // Assuming this is a numeric rating
}
