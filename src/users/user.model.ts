import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enum/enums';

export type UserDocument = User & Document<any, any, User>;

export interface User extends Document {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  isActivated: boolean;
  discount: number;
  favorites: Types.ObjectId[];
  settings: { email: boolean; language: string };
}

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: String })
  role: UserRole;

  @Prop({ type: [Types.ObjectId], default: [] })
  favorites: Types.ObjectId[];

  @Prop({
    type: { email: Boolean, language: String },
    default: { email: true, language: 'EN' },
  })
  settings: { email: boolean; language: string };

  @Prop({ default: false })
  isActivated: boolean;

  @Prop({ default: 3 })
  discount: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
export { UserRole };
