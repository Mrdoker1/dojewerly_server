import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { UserRole } from '../enum/enums';

export type UserDocument = User & Document<any, any, User>;

export interface User extends Document {
  email: string;
  username: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  favorites: Types.ObjectId[];
  settings: { email: boolean };
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

  @Prop({ type: { email: Boolean }, default: {} })
  settings: { email: boolean };

  @Prop({ default: false })
  isActivated: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
export { UserRole };
