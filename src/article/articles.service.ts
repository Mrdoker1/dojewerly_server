import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from './article.model';
import { CreateArticleDto } from '../dto/article.dto';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectModel(Article.name)
    private articleModel: Model<ArticleDocument>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const createdArticle = new this.articleModel(createArticleDto);
    return createdArticle.save();
  }

  async findAll(): Promise<Article[]> {
    return this.articleModel.find().exec();
  }

  async findOne(articleId: string): Promise<Article> {
    try {
      const article = await this.articleModel.findById(articleId).exec();
      if (!article) {
        throw new NotFoundException(`Article #${articleId} not found`);
      }
      return article;
    } catch (error) {
      throw new NotFoundException(`Article #${articleId} not found`);
    }
  }

  // Добавьте другие необходимые методы (например, поиск по id, удаление, обновление)
}
