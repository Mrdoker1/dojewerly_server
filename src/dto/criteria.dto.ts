import { ApiProperty } from '@nestjs/swagger';

export class CatalogCriteriaDto {
  @ApiProperty({
    type: [String],
    example: ['Silver', 'Gold', 'Steel'],
    description: 'List of materials',
  })
  materials: string[];

  @ApiProperty({
    type: [String],
    example: ['Man', 'Woman', 'Unisex'],
    description: 'List of genders',
  })
  genders: string[];

  @ApiProperty({
    type: [String],
    example: ['Available', 'Preorder', 'Unavailable'],
    description: 'List of availability statuses',
  })
  availability: string[];

  @ApiProperty({
    type: [String],
    example: ['Any Type', 'Barrette', 'Ring', 'Earring', 'Brooch'],
    description: 'List of product types',
  })
  types: string[];
}
