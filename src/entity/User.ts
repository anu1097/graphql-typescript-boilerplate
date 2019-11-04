import * as bcrypt from "bcrypt";
import { BaseEntity, BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
@Entity("users")
export class User extends BaseEntity {

		@PrimaryGeneratedColumn("uuid")
		public id: string;

		@Column("varchar", { length: 255 })
		public email: string;

		@Column("text")
		public password: string;

		@Column("boolean", { default: false })
		public confirmed: boolean;

		@Column("boolean", { default: false })
		public lockedAccount: boolean;

		@BeforeInsert()
		public async hashPassword() {
				this.password = await bcrypt.hash(this.password, 10);
		}

}
