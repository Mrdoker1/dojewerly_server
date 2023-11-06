import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Collection, CollectionDocument } from './collections.model';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from 'src/dto/collection.dto';
import { ProductsService } from '../products/product.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
    private productService: ProductsService,
  ) {}

  async findByIds(collectionIds: string[]): Promise<CollectionDocument[]> {
    const collections = await this.collectionModel
      .find({ _id: { $in: collectionIds } })
      .exec();
    console.log('Collections found for IDs:', collections);
    return collections;
  }

  async findById(id: string): Promise<CollectionDocument> {
    return this.collectionModel.findById(id).exec();
  }

  async findAll(): Promise<CollectionDocument[]> {
    return this.collectionModel.find().exec();
  }

  async create(
    createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionDocument> {
    const collection = new this.collectionModel(createCollectionDto);
    return collection.save();
  }

  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<void> {
    const { name, description, localization } = updateCollectionDto;
    await this.collectionModel
      .findByIdAndUpdate(id, { name, description, localization })
      .exec();
  }

  async delete(id: string): Promise<void> {
    await this.collectionModel.findByIdAndDelete(id).exec();
  }

  async addProduct(collectionId: string, productId: string): Promise<void> {
    const collection = await this.collectionModel.findById(collectionId).exec();
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const product = await this.productService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (collection.productIds.includes(productId)) {
      throw new BadRequestException('Product already exists in the collection');
    }

    collection.productIds.push(productId);
    await collection.save();
  }

  async removeProduct(collectionId: string, productId: string): Promise<void> {
    const collection = await this.collectionModel.findById(collectionId).exec();
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (!collection.productIds.includes(productId)) {
      throw new NotFoundException('Product does not exist in the collection');
    }

    collection.productIds = collection.productIds.filter(
      (id) => id !== productId,
    );
    await collection.save();
  }

  async removeProductFromAllCollections(productId: string): Promise<void> {
    // Найдем все коллекции, в которых есть этот продукт
    const collectionsContainingProduct = await this.collectionModel
      .find({ productIds: productId })
      .exec();

    if (collectionsContainingProduct.length === 0) {
      return; // Продукт не найден ни в одной коллекции, нет необходимости в дальнейших действиях
    }

    // Для каждой коллекции удалим продукт и обновим коллекцию
    for (const collection of collectionsContainingProduct) {
      collection.productIds = collection.productIds.filter(
        (id) => id !== productId,
      );
      await collection.save();
    }
  }
}
