import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CollectionDocument = Collection & Document<any, any, Collection>;

@Schema()
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  productIds: string[];

  @Prop({ type: Object, default: {} })
  localization: {
    [key: string]: {
      name?: string;
      description?: string;
    };
  };
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
