import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { ProductsService } from '../products/product.service';
import { Types } from 'mongoose';

@Injectable()
export class FavouritesService {
  constructor(
    private userService: UserService,
    private productService: ProductsService,
  ) {}

  async findUserFavorites(userId: string) {
    const user = await this.userService.findById(userId);
    const productIds = user.favorites.map((id) => id.toString());
    console.log("User's favorite product IDs:", productIds);
    return this.productService.findByIds(productIds);
  }

  async addToFavorites(userId: string, productId: string) {
    const user = await this.userService.findById(userId);
    const product = await this.productService.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (user.favorites.includes(new Types.ObjectId(productId))) {
      throw new BadRequestException('Product already in favorites');
    }
    user.favorites.push(new Types.ObjectId(productId));
    await this.userService.updateUser(userId, user);
  }

  async removeFromFavorites(userId: string, productId: string) {
    const user = await this.userService.findById(userId);
    if (!user.favorites.includes(new Types.ObjectId(productId))) {
      throw new NotFoundException('Product not in favorites');
    }
    user.favorites = user.favorites.filter((id) => id.toString() !== productId);
    await this.userService.updateUser(userId, user);
  }
}
