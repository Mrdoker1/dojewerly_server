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
import { LocalizedProps } from 'src/mail/mail.controller';
import { I18nService } from 'nestjs-i18n';

const client = process.env.CLIENT_DOMAIN;
const server = process.env.SERVER_DOMAIN;

// const client = 'dojewerly.shop';
// const server = 'dojewerlyserver-production.up.railway.app';

@Injectable()
export class EmailService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly productService: ProductsService, // Инжектируем ProductService
    private readonly resendService: ResendService,
    private readonly templateService: TemplateService,
    private readonly collectionsService: CollectionsService, // Инжектируем CollectionsService
    private readonly i18n: I18nService, // добавление I18nService в сервис
  ) {}

  async sendEmailToUsersWithProductInfo(
    emailText: string,
    emailSubject: string,
    productIds: string[],
    localization: { [key: string]: LocalizedProps },
  ): Promise<User[]> {
    // Получение пользователей, которые согласились получать письма
    const users = await this.userModel.find({ 'settings.email': true }).exec();

    // Получение деталей продуктов
    const products = await this.getProductDetails(productIds);

    // Отправка письма каждому пользователю
    for (const user of users) {
      const userLanguage = user.settings.language || 'EN'; // Получаем предпочтительный язык пользователя, или используем 'en' как язык по умолчанию

      // Формируем текст и тему письма на предпочтительном языке пользователя
      const localizedText = localization[userLanguage]?.text || emailText;
      const localizedSubject =
        localization[userLanguage]?.subject || emailSubject;
      const tLanguage = userLanguage.toLowerCase();

      // Формирование данных о продуктах для шаблона
      const productsForTemplate = products.map((product) => {
        const localizedProduct =
          product.localization && product.localization[userLanguage]
            ? product.localization[userLanguage]
            : {};
        return {
          name: localizedProduct.name || product.name,
          price: product.price,
          imageURL: `https://${server}/uploads/${product.imageURLs[0]}`,
          link: `https://${client}/product/${product._id}`,
          CTA: this.i18n.t('translation.ViewProduct', {
            lang: tLanguage,
          }),
        };
      });

      // Создаем HTML-содержимое письма
      const emailHtmlContent = this.templateService.getNewProductsEmailTemplate(
        {
          greatings: this.i18n.t('translation.Hello', { lang: tLanguage }),
          footer: {
            header: this.i18n.t('translation.EmailFooter.header', {
              lang: tLanguage,
            }),
            subheader: this.i18n.t('translation.EmailFooter.subheader', {
              lang: tLanguage,
            }),
            link: this.i18n.t('translation.EmailFooter.link', {
              lang: tLanguage,
            }),
          },
          username: user.username,
          text: localizedText,
          products: productsForTemplate,
          unsubscribeLink: `https://${client}/dashboard/profile`,
        },
      );

      console.log(
        `Sending email to user: ${user.email}, preferred language: ${userLanguage}`,
      ); // Логируем язык пользователя

      // Используйте ваш механизм отправки
      await this.resendService.send({
        from: '"Катя DoJewelry" <marketing@dojewerly.shop>',
        to: user.email,
        subject: localizedSubject,
        html: emailHtmlContent,
      });
    }
    return users;
  }

  async sendEmailToUsersWithCollectionInfo(
    emailText: string,
    emailSubject: string,
    collectionIds: string[],
    localization: { [key: string]: LocalizedProps },
  ): Promise<User[]> {
    // Получаем пользователей, которые согласились на получение рассылки
    const users = await this.userModel.find({ 'settings.email': true }).exec();

    // Получаем детали коллекций
    const collections = await this.collectionsService.findByIds(collectionIds);

    // Отправляем письма каждому пользователю
    for (const user of users) {
      // Получаем предпочтительный язык пользователя, или используем 'en' как язык по умолчанию
      const userLanguage = user.settings.language || 'en';

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
            name:
              collection.localization?.[userLanguage]?.name || collection.name,
            description:
              collection.localization?.[userLanguage]?.description ||
              collection.description,
            products: productsForTemplate,
            link: `https://${client}/collections/${collection._id}`, // Ссылка на коллекцию
          };
        }),
      );

      // Формируем текст и тему письма на предпочтительном языке пользователя
      const localizedText = localization[userLanguage]?.text || emailText;
      const localizedSubject =
        localization[userLanguage]?.subject || emailSubject;

      const tLanguage = userLanguage.toLowerCase();

      // Создаём HTML-содержимое письма с учётом локализации
      const emailHtmlContent =
        this.templateService.getNewCollectionsEmailTemplate({
          username: user.username,
          text: localizedText,
          greatings: this.i18n.t('translation.Hello', { lang: tLanguage }),
          footer: {
            header: this.i18n.t('translation.EmailFooter.header', {
              lang: tLanguage,
            }),
            subheader: this.i18n.t('translation.EmailFooter.subheader', {
              lang: tLanguage,
            }),
            link: this.i18n.t('translation.EmailFooter.link', {
              lang: tLanguage,
            }),
          },
          collections: collectionsForTemplate,
          unsubscribeLink: `https://${client}/dashboard/profile`,
        });

      // Отправляем электронное письмо
      await this.resendService.send({
        from: '"Катя DoJewelry" <marketing@dojewerly.shop>',
        to: user.email,
        subject: localizedSubject,
        html: emailHtmlContent,
      });
    }
    return users;
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
