import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Profile } from './profile.schema';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  // # Se considera que se puedan agregar mas roles en un futuro
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role!: string;

  @Prop({ type: Types.ObjectId, ref: Profile.name })
  profile!: Profile;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
