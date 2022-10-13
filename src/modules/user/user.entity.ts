import { Entity, Property, Unique } from "@mikro-orm/core";
import { BaseEntity } from "../../utils/BaseEntity";
import { CreateUserInput } from "./user.schema";
import crypto from "crypto";

@Entity()
export class User extends BaseEntity {
  @Property({ type: "text" })
  name: string;

  @Property({ type: "text" })
  @Unique()
  email: string;

  @Property()
  password?: string;

  @Property()
  salt?: string;

  setPassword(password: string) {
    this.salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto
      .pbkdf2Sync(password, this.salt, 1000, 64, "sha512")
      .toString("hex");

    this.password = hash;
  }

  validatePassword(password: string): boolean {
    const hash = crypto.pbkdf2Sync(password, this.salt!, 1000, 64, "sha512");
    return hash.toString("hex") === this.password;
  }

  constructor({ name, email }: CreateUserInput) {
    super();
    this.name = name;
    this.email = email;
  }
}
