import { PrimaryKey, Property, SerializedPrimaryKey } from "@mikro-orm/core";
import { ObjectId } from "@mikro-orm/mongodb";

export abstract class BaseEntity {
  @PrimaryKey()
  _id!: ObjectId;

  @SerializedPrimaryKey()
  id!: string;

  @Property({ type: "date" })
  createdAt? = new Date();

  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt? = new Date();
}
