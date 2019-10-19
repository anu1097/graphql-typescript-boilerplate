import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn, BeforeInsert, BaseEntity } from "typeorm";
import * as uuid4 from "uuid/v4";

@Entity("users")
export class User extends BaseEntity {

    @PrimaryColumn("uuid")
    id: string;

    @Column("varchar", { length: 255 })
    email: string;

    @Column("text")
    password: string;

    @BeforeInsert()
    addId() {
        this.id = uuid4();
    }

}
