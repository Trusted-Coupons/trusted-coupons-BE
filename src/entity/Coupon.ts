import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm";

@Entity("")
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

    @Index()
    @Column()
    store: string;

    @Column()
    merchant_home_page: string;

    @Column('text', { array: true, nullable: true })
    categories: string[]; 

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

    @Column()
    rating: string;

    
    public table_name: string;
}

