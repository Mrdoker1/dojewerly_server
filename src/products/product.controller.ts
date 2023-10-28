import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  NotFoundException,
  Put,
  UseGuards,
  Query,
  UploadedFiles,
  InternalServerErrorException,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import * as fs from 'fs';
import { extname, join } from 'path';
import { UseInterceptors } from '@nestjs/common';
import { ProductsService } from './product.service';
import {
  CreateProductWithImagesDto,
  UpdateImagesOrderDto,
  UpdateProductDto,
  UpdateProductWithImagesDto,
} from '../dto/product.dto';
import { Product, ProductDocument } from './product.model';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../enum/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CollectionsService } from '../collections/collections.service';

const uploadFolder = './uploads';

// Создайте папку, если она не существует
if (!existsSync(uploadFolder)) {
  mkdirSync(uploadFolder);
}

const storage = diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    return cb(null, `${randomName}${extname(file.originalname)}`);
  },
});

@ApiTags('Catalog')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly collectionsService: CollectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'material', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'availability', required: false })
  @ApiQuery({ name: 'stock', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  async getProducts(
    @Query('sort') sort: string,
    @Query('order') order: 'asc' | 'desc',
    @Query('q') q: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('material') material: string,
    @Query('gender') gender: string,
    @Query('availability') availability: string,
    @Query('stock') stock: number,
    @Query('type') type: string,
    @Query('minPrice') minPrice: number,
    @Query('maxPrice') maxPrice: number,
  ): Promise<ProductDocument[]> {
    return this.productsService.findAll({
      sort,
      order,
      q,
      page,
      limit,
      material,
      gender,
      availability,
      stock,
      type,
      minPrice,
      maxPrice,
    });
  }

  @Get('/total')
  @ApiOperation({ summary: 'Get total number of products based on filters' })
  @ApiQuery({ name: 'sort', required: false })
  @ApiQuery({ name: 'order', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'material', required: false })
  @ApiQuery({ name: 'gender', required: false })
  @ApiQuery({ name: 'availability', required: false })
  @ApiQuery({ name: 'stock', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  async getTotalProductsCount(@Query() queryParams): Promise<number> {
    return this.productsService.countFiltered(queryParams);
  }

  @ApiOperation({ summary: 'Get product by id' })
  @Get(':id')
  async getProductById(@Param('id') id: string): Promise<ProductDocument> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productsService.findById(id);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProductWithImagesDto })
  @ApiOperation({
    summary: 'Create a new product (only available to the administrator)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 20, { storage }))
  async createProduct(
    @UploadedFiles() images,
    @Body() createProductDto: CreateProductWithImagesDto,
  ): Promise<ProductDocument> {
    // Преобразуем строку в объект, если она представлена в виде строки
    if (typeof createProductDto.props === 'string') {
      createProductDto.props = JSON.parse(createProductDto.props);
    }
    const imageURLs = images ? images.map((file) => file.filename) : [];
    const productDtoWithImages = { ...createProductDto, imageURLs };
    return this.productsService.createProduct(productDtoWithImages);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete product by id (only available to admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Param('id') id: string): Promise<void> {
    const product = await this.productsService.findById(id);
    if (product) {
      // Удаляем все изображения, связанные с этим продуктом
      product.imageURLs.forEach((imageUrl) => {
        const imagePath = join(uploadFolder, imageUrl);
        try {
          if (existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        } catch (err) {
          console.error(
            `Error while deleting image at ${imagePath}: ${err.message}`,
          );
          // Здесь можно дополнительно обработать ошибку, если это необходимо
        }
      });
      // Удалите продукт из всех коллекций
      await this.collectionsService.removeProductFromAllCollections(id);
    }
    await this.productsService.deleteProduct(id);
  }

  @Put(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProductWithImagesDto })
  @ApiOperation({
    summary: 'Product update by id (only available to the administrator)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 20, { storage }))
  async updateProduct(
    @Param('id') id: string,
    @UploadedFiles() images,
    @Body() updateProductDto: UpdateProductWithImagesDto,
  ): Promise<void> {
    const product = await this.productsService.findById(id);
    // Преобразуем строку в объект, если она представлена в виде строки
    if (typeof updateProductDto.props === 'string') {
      updateProductDto.props = JSON.parse(updateProductDto.props);
    }
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const imageURLs = images.map((file) => file.filename);

    const productDtoWithImages = { ...updateProductDto, imageURLs };
    await this.productsService.updateProduct(id, productDtoWithImages);
  }

  @Put(':id/images')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of product images',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiOperation({ summary: 'Adding Images to a Product' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FilesInterceptor('images', 20, { storage }))
  async addImagesToProduct(
    @Param('id') id: string,
    @UploadedFiles() images,
  ): Promise<{ imageURLs: string[] }> {
    // обновляем тип возвращаемого значения
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const imageURLs = images.map((file) => file.filename);

    // Добавляем новые URL-ы изображений к существующим
    const productData = product as unknown as { imageURLs: string[] };
    const updatedProductDto = {
      name: product.name,
      price: product.price,
      stock: product.stock,
      props: product.props,
      imageURLs: [...productData.imageURLs, ...imageURLs],
    };
    await this.productsService.updateProduct(id, updatedProductDto);

    return { imageURLs: updatedProductDto.imageURLs }; // возвращаем обновленные URL-адреса изображений
  }

  @Delete(':id/images')
  @ApiOperation({ summary: 'Remove product image' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imageUrl: {
          type: 'string',
        },
      },
    },
  })
  async deleteProductImage(
    @Param('id') id: string,
    @Body() deleteImageDto: { imageUrl: string },
  ): Promise<void> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Удаляем URL изображения из списка
    const updatedProductDto = {
      name: product.name,
      price: product.price,
      stock: product.stock,
      props: product.props,
      imageURLs: product.imageURLs.filter(
        (url) => url !== deleteImageDto.imageUrl,
      ),
    };
    await this.productsService.updateProduct(id, updatedProductDto);

    // Обработка пути к файлу с использованием функции normalize
    const filePath = join(uploadFolder, deleteImageDto.imageUrl);
    console.log(filePath);

    // Удаляем файл изображения с сервера
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error(`Error while deleting file: ${err.message}`);
      throw new InternalServerErrorException('Error when deleting a file');
    }
  }

  @Get(':id/images')
  @ApiOperation({ summary: 'Get all product images' })
  async getProductImages(@Param('id') id: string): Promise<string[]> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.imageURLs;
  }

  @Patch(':id/updateImagesOrder')
  @ApiOperation({ summary: 'Update product images order' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateProductImagesOrder(
    @Param('id') id: string,
    @Body() updateImagesOrderDto: UpdateImagesOrderDto,
  ): Promise<void> {
    const product = await this.productsService.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const originalImageURLs = product.imageURLs;
    const updatedImageURLs = updateImagesOrderDto.imageURLs;

    // Проверяем, что длины массивов совпадают
    if (originalImageURLs.length !== updatedImageURLs.length) {
      throw new BadRequestException(
        'Number of images does not match the original',
      );
    }

    // Проверяем, что все элементы из обновленного массива присутствуют в оригинальном массиве
    for (const imageUrl of updatedImageURLs) {
      if (!originalImageURLs.includes(imageUrl)) {
        throw new BadRequestException(
          `Image ${imageUrl} not found in original images`,
        );
      }
    }

    await this.productsService.updateProductImagesOrder(id, updatedImageURLs);
  }

  @Patch(':id')
  async partialUpdateProduct(
    @Param('id') id: string,
    @Body() partialUpdateProductDto: Partial<UpdateProductDto>,
  ): Promise<Product> {
    return await this.productsService.partialUpdate(
      id,
      partialUpdateProductDto,
    );
  }
}
