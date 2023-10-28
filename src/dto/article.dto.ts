import { ApiProperty } from '@nestjs/swagger';

export class CreateArticleDto {
  @ApiProperty({
    description: 'The title of the article',
    example: 'Care Guide для хэнд мейд украшений из метала',
  })
  title: string;

  @ApiProperty({
    description: 'The content of the article',
    example: 'Detailed content...',
  })
  content: string;
}
