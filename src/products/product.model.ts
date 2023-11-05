import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

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

// Обратите внимание, что мы используем 'Document' из 'mongoose' здесь
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

// Это создает тип ProductDocument с _id, который уже включен в Document
export const ProductSchema = SchemaFactory.createForClass(Product);
// И экспорт типа ProductDocument после этого
export type ProductDocument = Product & Document;
