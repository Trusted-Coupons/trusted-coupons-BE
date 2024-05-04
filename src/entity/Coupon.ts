import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("coupons_website")
export class Coupon {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    offer_id: string;

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
    start_date: Date;

    @Column()
    end_date: Date;

    @Column()
    status: string;

    @Column()
    primary_location: string;

    public table_name: string;
}
