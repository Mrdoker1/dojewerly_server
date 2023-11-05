import { Injectable, Inject } from '@nestjs/common';
import { Product, ProductDocument } from '../products/product.model'; // Обновите путь
import { ProductsService } from '../products/product.service'; // Обновите путь
import { User, UserDocument } from '../users/user.model'; // Обновите путь к User
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResendService } from 'nestjs-resend';
import { TemplateService } from 'src/mail/template.service';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly productService: ProductsService, // Инжектируем ProductService
    private readonly resendService: ResendService,
    private readonly templateService: TemplateService,
  ) {}

  async sendEmailToUsersWithProductInfo(
    emailText: string,
    productIds: string[],
  ): Promise<void> {
    const client = process.env.CLIENT_DOMAIN;
    const server = process.env.SERVER_DOMAIN;
    // Получение пользователей, которые согласились получать письма
    const users = await this.userModel.find({ 'settings.email': true }).exec();
    // Получение деталей продуктов
    const products = await this.getProductDetails(productIds);
    // Формирование данных о продуктах для шаблона
    const productsForTemplate = products.map((product) => ({
      name: product.localization['en']?.name || product.name,
      price: product.price,
      imageURL: `https://${server}/uploads/${product.imageURLs[0]}`, // предполагаем, что у продуктов есть изображения
      link: `https://${client}/product/${product._id}`,
    }));

    // Отправка письма каждому пользователю
    for (const user of users) {
      const emailHtmlContent = this.templateService.getNewProductsEmailTemplate(
        {
          username: user.username,
          text: emailText,
          products: productsForTemplate,
          unsubscribeLink: `https://${client}/dashboard/profile`, // Ссылка для отписки
        },
      );

      // Используйте ваш механизм отправки
      await this.resendService.send({
        from: 'support@dojewerly.shop',
        to: user.email,
        subject: 'Check out the new products!',
        html: emailHtmlContent,
      });
    }
  }

  private async getProductDetails(
    productIds: string[],
  ): Promise<ProductDocument[]> {
    return this.productService.findByIds(productIds);
  }
}
