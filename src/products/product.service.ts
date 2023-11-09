import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from '../users/user.service';
import { Product, ProductDocument } from './product.model';
import {
  CreateProductWithImagesDto,
  UpdateProductDto,
  UpdateProductWithImagesDto,
} from '../dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly userService: UserService,
  ) {}

  private filterQuery(params) {
    let query = this.productModel.find();
    // Search by keyword
    // if (params.q) {
    //   query = query.find({ name: { $regex: params.q, $options: 'i' } });
    // }
    // if (params.q) {
    //   query = query.find({
    //     $or: [
    //       { name: { $regex: params.q, $options: 'i' } },
    //       { 'props.description': { $regex: params.q, $options: 'i' } },
    //       { 'props.info': { $regex: params.q, $options: 'i' } },
    //     ],
    //   });
    // }

    if (params.q) {
      query = query.find({
        $or: [
          { name: { $regex: params.q, $options: 'i' } },
          { 'props.description': { $regex: params.q, $options: 'i' } },
          { 'props.info': { $regex: params.q, $options: 'i' } },
          { 'localization.RU.name': { $regex: params.q, $options: 'i' } },
          { 'localization.RU.info': { $regex: params.q, $options: 'i' } },
          {
            'localization.RU.description': { $regex: params.q, $options: 'i' },
          },
          { 'localization.PL.name': { $regex: params.q, $options: 'i' } },
          { 'localization.PL.info': { $regex: params.q, $options: 'i' } },
          {
            'localization.PL.description': { $regex: params.q, $options: 'i' },
          },
        ],
      });
    }

    // Sorting
    if (params.sort && params.order) {
      query = query.sort({ [params.sort]: params.order === 'asc' ? 1 : -1 });
    }
    // Pagination
    if (params.page && params.limit) {
      query = query.skip((params.page - 1) * params.limit).limit(params.limit);
    }
    if (params.material) {
      query = query.find({ 'props.material': params.material });
    }
    if (params.gender) {
      query = query.find({ 'props.gender': params.gender });
    }
    if (params.availability) {
      query = query.find({ 'props.availability': params.availability });
    }
    if (params.stock !== undefined) {
      query = query.find({ stock: params.stock });
    }
    if (params.type) {
      query = query.find({ 'props.type': params.type });
    }
    if (params.minPrice !== undefined && params.maxPrice !== undefined) {
      query = query.find({
        price: { $gte: params.minPrice, $lte: params.maxPrice },
      });
    } else if (params.minPrice !== undefined) {
      query = query.find({ price: { $gte: params.minPrice } });
    } else if (params.maxPrice !== undefined) {
      query = query.find({ price: { $lte: params.maxPrice } });
    }

    return query;
  }

  async findByPropsId(propsId: number): Promise<ProductDocument[]> {
    return this.productModel.find({ 'props.id': propsId }).exec();
  }

  async findByIds(productIds: string[]): Promise<ProductDocument[]> {
    const products = await this.productModel
      .find({ _id: { $in: productIds } })
      .exec();
    return products;
  }

  async findById(id: string): Promise<ProductDocument> {
    return this.productModel.findById(id).exec();
  }

  async findAll(params: {
    sort?: string;
    order?: 'asc' | 'desc';
    q?: string;
    page?: number;
    limit?: number;
    material?: string;
    gender?: string;
    availability?: string;
    stock?: number;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<ProductDocument[]> {
    return this.filterQuery(params).exec();
  }

  async createProduct(
    createProductDto: CreateProductWithImagesDto,
  ): Promise<Product> {
    console.log('Saving product to MongoDB:', createProductDto);
    const product = new this.productModel(createProductDto);
    const savedProduct = await product.save();
    console.log('Saved product:', savedProduct);
    return savedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    // Удалите продукт из избранного всех пользователей
    await this.userService.removeProductFromFavorites(id);
    // Удалите сам продукт
    await this.productModel.findByIdAndDelete(id);
  }

  async updateProduct(
    id: string,
    updateProductDto: Partial<UpdateProductWithImagesDto>,
  ): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, updateProductDto).exec();
  }

  async updateProductImagesOrder(
    id: string,
    imageURLs: string[],
  ): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, { imageURLs }).exec();
  }

  async partialUpdate(
    id: string,
    partialUpdateProductDto: Partial<UpdateProductDto>,
  ): Promise<Product> {
    await this.productModel
      .findByIdAndUpdate(id, partialUpdateProductDto)
      .exec();
    return this.productModel.findById(id).exec();
  }

  async countAll(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }

  async countFiltered(params): Promise<number> {
    return this.filterQuery(params).countDocuments().exec();
  }
}
