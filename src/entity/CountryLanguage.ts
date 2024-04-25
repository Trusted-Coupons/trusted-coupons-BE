import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('country_language_ecommerce')
export class CountryLanguage {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    Country: string;

    @Column()
    Alpha_2: string;

    @Column()
    Alpha_3: string;

    @Column()
    Alpha_2_Lang: string;

    @Column()
    Language1: string;

    @Column()
    Language2: string;

    @Column()
    Language3: string;

    @Column()
    ubersuggest_code: string;

    @Column()
    Population: number;

    @Column()
    GDP_billion: number;

    @Column()
    Statista_Digital_Commerce_Market_2024_million: number;

    @Column()
    Statista_Spending_Per_Person: number;
}
