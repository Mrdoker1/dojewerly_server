import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './article.model';
import { CreateArticleDto } from '../dto/article.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enum/enums';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @ApiOperation({ summary: 'Create article' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard) // Убедитесь, что стражи реализованы и работают правильно
  @Roles(UserRole.ADMIN) // Только администраторы могут создавать статьи
  async create(@Body() createArticleDto: CreateArticleDto): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all articles' })
  async findAll(): Promise<Article[]> {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an article by id' })
  async findOne(@Param('id') id: string): Promise<Article> {
    return this.articlesService.findOne(id);
  }

  // ... любые другие методы ...
}
