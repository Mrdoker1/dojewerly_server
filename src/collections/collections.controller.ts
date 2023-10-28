import {
  Controller,
  Get,
  Param,
  Post,
  Delete,
  Body,
  Put,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CollectionDocument } from './collections.model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../enum/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
} from '../dto/collection.dto';

@ApiTags('Collections')
@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all collections' })
  async getCollections(): Promise<CollectionDocument[]> {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by id' })
  async getCollection(@Param('id') id: string): Promise<CollectionDocument> {
    const collection = await this.collectionsService.findById(id);
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new collection (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async createCollection(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionDocument> {
    return this.collectionsService.create(createCollectionDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update collection by id (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateCollection(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionDocument[]> {
    const collection = await this.collectionsService.findById(id);
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    await this.collectionsService.update(id, updateCollectionDto);
    return this.collectionsService.findAll();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete collection by id (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteCollection(
    @Param('id') id: string,
  ): Promise<CollectionDocument[]> {
    await this.collectionsService.delete(id);
    return this.collectionsService.findAll();
  }

  @Post(':id/products/:productId')
  @ApiOperation({
    summary: 'Add a product to a collection (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async addProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.collectionsService.addProduct(id, productId);
  }

  @Delete(':id/products/:productId')
  @ApiOperation({
    summary: 'Remove a product from a collection (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async removeProduct(
    @Param('id') id: string,
    @Param('productId') productId: string,
  ): Promise<void> {
    await this.collectionsService.removeProduct(id, productId);
  }
}
