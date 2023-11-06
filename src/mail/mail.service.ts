import { Injectable } from '@nestjs/common';
import { ProductDocument } from '../products/product.model'; // Обновите путь
import { ProductsService } from '../products/product.service'; // Обновите путь
import { User, UserDocument } from '../users/user.model'; // Обновите путь к User
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ResendService } from 'nestjs-resend';
import { TemplateService } from './template.service';
import { CollectionsService } from '../collections/collections.service';
import { CollectionDocument } from '../collections/collections.model';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly productService: ProductsService, // Инжектируем ProductService
    private readonly resendService: ResendService,
    private readonly templateService: TemplateService,
    private readonly collectionsService: CollectionsService, // Инжектируем CollectionsService
  ) {}

  async sendEmailToUsersWithProductInfo(
    emailText: string,
    emailSubject: string,
    productIds: string[],
  ): Promise<void> {
    // const client = process.env.CLIENT_DOMAIN;
    const client = 'dojewerly.shop';
    // const server = process.env.SERVER_DOMAIN;
    const server = 'dojewerlyserver-production.up.railway.app';
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
        from: '"Катя DoJewelry" <marketing@dojewerly.shop>',
        to: user.email,
        subject: emailSubject,
        html: emailHtmlContent,
      });
    }
  }

  async sendEmailToUsersWithCollectionInfo(
    emailText: string,
    emailSubject: string,
    collectionIds: string[],
  ): Promise<void> {
    const client = 'dojewerly.shop';
    const server = 'dojewerlyserver-production.up.railway.app';

    // Получаем пользователей, которые согласились на получение рассылки
    const users = await this.userModel.find({ 'settings.email': true }).exec();

    // Получаем детали коллекций
    const collections = await this.collectionsService.findByIds(collectionIds);

    // Собираем информацию о продуктах каждой коллекции для шаблона
    const collectionsForTemplate = await Promise.all(
      collections.map(async (collection) => {
        const products = await this.productService.findByIds(
          collection.productIds,
        );
        const productsForTemplate = products.map((product) => ({
          imageURL: `https://${server}/uploads/${product.imageURLs[0]}`,
          // Добавьте другие поля, если они нужны в шаблоне
        }));

        return {
          name: collection.localization['en']?.name || collection.name,
          description:
            collection.localization['en']?.description ||
            collection.description,
          products: productsForTemplate,
          link: `https://${client}/collections/${collection._id}`, // Ссылка на коллекцию
        };
      }),
    );

    // Отправляем письма каждому пользователю
    for (const user of users) {
      const emailHtmlContent =
        this.templateService.getNewCollectionsEmailTemplate({
          username: user.username, // Подставляем имя пользователя
          text: emailText,
          collections: collectionsForTemplate, // Здесь передаем массив коллекций
          unsubscribeLink: `https://${client}/dashboard/profile`,
        });

      // Отправляем электронное письмо
      await this.resendService.send({
        from: '"Катя DoJewelry" <marketing@dojewerly.shop>',
        to: user.email,
        subject: emailSubject,
        html: emailHtmlContent,
      });
    }
  }

  private async getProductDetails(
    productIds: string[],
  ): Promise<ProductDocument[]> {
    return this.productService.findByIds(productIds);
  }

  private async getCollectionDetails(
    collectionIds: string[],
  ): Promise<CollectionDocument[]> {
    return this.collectionsService.findByIds(collectionIds);
  }
}
