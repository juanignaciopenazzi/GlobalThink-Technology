import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Profile extends Document {
  @Prop({ required: true })
  firstName!: string;

  @Prop()
  secondName?: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop()
  phone?: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
