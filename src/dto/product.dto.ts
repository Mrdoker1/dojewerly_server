import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocalizedProductProps {
  @ApiPropertyOptional({ description: 'Localized product name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Localized product price' })
  price?: number;

  @ApiPropertyOptional({ description: 'Localized product info' })
  info?: string;

  @ApiPropertyOptional({ description: 'Localized product stock' })
  stock?: number;

  @ApiPropertyOptional({ description: 'Localized product description' })
  description?: string;
}

export class CreateProductDto {
  @ApiProperty({ example: 'Bird Earrings', description: 'Name' })
  name: string;

  @ApiProperty({ example: 570, description: 'Price' })
  price: number;

  @ApiProperty({ example: 3, description: 'Stock' })
  stock: number;

  @ApiProperty({
    example: {
      id: 2,
      info: 'It is engraved with a wrapped candy',
      description:
        'Dynamic and elusive abstraction and texture. Plays between the lines of chaos and serenity. Perfect fit for modern and contemporary styled interiors.',
      availability: 'Availiable',
      material: 'Silver',
      gender: 'Unisex',
      type: 'Earring',
    },
    description: 'Props',
  })
  props: {
    id: number;
    info: string;
    description: string;
    availability: string;
    material: string;
    gender: string;
    type: string;
  };

  @ApiProperty({ description: 'Localized product properties' })
  localization: { [key: string]: LocalizedProductProps };
}

export class CreateProductWithImagesDto extends CreateProductDto {
  @ApiProperty({ type: 'string', format: 'binary', isArray: true })
  images: any[];
}

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Bird Earrings', description: 'Name' })
  name: string;

  @ApiPropertyOptional({ example: 570, description: 'Price' })
  price: number;

  @ApiPropertyOptional({ example: 3, description: 'Stock' })
  stock: number;

  @ApiPropertyOptional({
    example: {
      id: 2,
      info: 'It is engraved with a wrapped candy',
      description:
        'Dynamic and elusive abstraction and texture. Plays between the lines of chaos and serenity. Perfect fit for modern and contemporary styled interiors.',
      availability: 'Availiable',
      material: 'Silver',
      gender: 'Unisex',
      type: 'Earring',
    },
    description: 'Props',
  })
  props: {
    id: number;
    info: string;
    description: string;
    availability: string;
    material: string;
    gender: string;
    type: string;
  };

  @ApiPropertyOptional({ description: 'Localized product properties' })
  localization?: { [key: string]: LocalizedProductProps };
}

export class UpdateProductWithImagesDto extends UpdateProductDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary', isArray: true })
  images: any[];
}

export class UpdateImagesOrderDto {
  @ApiProperty({ type: 'string', isArray: true })
  imageURLs: string[];
}
