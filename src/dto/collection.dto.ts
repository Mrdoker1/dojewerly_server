import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LocalizedCollectionProps {
  @ApiPropertyOptional({ description: 'Localized collection name' })
  name?: string;

  @ApiPropertyOptional({ description: 'Localized collection description' })
  description?: string;
}

export class CreateCollectionDto {
  @ApiProperty({
    example: 'Summer Collection',
    description: 'Name of the collection',
  })
  name: string;

  @ApiProperty({
    example: 'Collection of summer dresses',
    description: 'Description of the collection',
  })
  description: string;

  @ApiProperty({ description: 'Localized collection properties' })
  localization: { [key: string]: LocalizedCollectionProps };
}

export class UpdateCollectionDto {
  @ApiProperty({
    example: 'Summer Collection',
    description: 'Name of the collection',
  })
  name: string;

  @ApiProperty({
    example: 'Collection of summer dresses',
    description: 'Description of the collection',
  })
  description: string;

  @ApiPropertyOptional({ description: 'Localized collection properties' })
  localization?: { [key: string]: LocalizedCollectionProps };
}
