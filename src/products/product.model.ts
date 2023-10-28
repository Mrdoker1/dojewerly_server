import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ProductDocument = Product & Document;

export interface LocalizedProductProps {
  name?: string;
  price?: number;
  info?: string;
  stock?: number;
  description?: string;
}

export interface ProductProps {
  id: number;
  info: string;
  description: string;
  availability: string;
  material: string;
  gender: string;
  type: string;
}

export interface Product extends Document {
  name: string;
  price: number;
  stock: number;
  props: ProductProps;
  imageURLs: string[];
  localization: { [key: string]: Partial<LocalizedProductProps> };
}

@Schema()
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: true, type: Object })
  props: ProductProps;

  @Prop({ type: [String] })
  imageURLs: string[];

  @Prop({ type: Object, default: {} })
  localization: { [key: string]: Partial<LocalizedProductProps> };
}

export const ProductSchema = SchemaFactory.createForClass(Product);
