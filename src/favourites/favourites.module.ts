import { Module } from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { FavouritesController } from './favourites.controller';
import { UserModule } from '../users/user.module';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [UserModule, ProductModule],
  controllers: [FavouritesController],
  providers: [FavouritesService],
})
export class FavouritesModule {}
