import {
  Controller,
  Get,
  Post,
  Delete,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { FavouritesService } from './favourites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Favourites')
@Controller('users/me/favorites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get(':userId/favorites')
  @ApiOperation({
    summary: "Get a list of a specific user's favorite products",
  })
  async getUserFavorites(@Param('userId') userId: string) {
    return await this.favouritesService.findUserFavorites(userId);
  }

  @Get()
  @ApiOperation({
    summary: "Get a list of the current user's favorite products",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Request() req) {
    return await this.favouritesService.findUserFavorites(req.user.id);
  }

  @Post(':productId')
  @ApiOperation({ summary: "Add a product to the current user's favorites" })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async addToFavorites(@Request() req, @Param('productId') productId: string) {
    return await this.favouritesService.addToFavorites(req.user.id, productId);
  }

  @Delete(':productId')
  @ApiOperation({
    summary: "Remove a product from the current user's favorites",
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(
    @Request() req,
    @Param('productId') productId: string,
  ) {
    return await this.favouritesService.removeFromFavorites(
      req.user.id,
      productId,
    );
  }
}
