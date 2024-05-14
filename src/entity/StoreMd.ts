import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity('metadata_all')
export class StoreMd {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  country: string;

  @Column()
  language: string;

  @Column()
  metadata_title: string;

  @Column()
  metadata_description: string;
}
