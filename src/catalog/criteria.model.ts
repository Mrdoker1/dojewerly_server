import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CatalogCriteriaDocument = CatalogCriteria & Document;

@Schema()
export class CatalogCriteria {
  @Prop({ required: true, type: [String] })
  materials: string[];

  @Prop({ required: true, type: [String] })
  genders: string[];

  @Prop({ required: true, type: [String] })
  availability: string[];

  @Prop({ required: true, type: [String] })
  types: string[];
}

export const CatalogCriteriaSchema =
  SchemaFactory.createForClass(CatalogCriteria);
