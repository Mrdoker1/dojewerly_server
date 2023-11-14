import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateService {
  constructor() {
    this.registerHelpers();
  }

  // Метод для регистрации хелперов
  private registerHelpers(): void {
    handlebars.registerHelper('divisible', (index, num, options) => {
      if ((index + 1) % num === 0) {
        // Добавляем 1, потому что индексация начинается с 0
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    });
    handlebars.registerHelper('or', function (...args) {
      args.pop();
      return args.some(Boolean);
    });

    handlebars.registerHelper('length', (array) => {
      return array.length;
    });

    handlebars.registerHelper('isStartOfNewRow', function (index) {
      return index % 2 === 0;
    });

    handlebars.registerHelper('isEndOfNewRow', function (index, options) {
      const total = options.data.root.products.length;
      return index % 2 === 1 || index === total - 1;
    });

    handlebars.registerHelper('newRow', function (index, options) {
      const products = options.data.root.products;
      let result = '';
      if (index % 2 === 0) {
        if (index > 0) {
          // Закрываем предыдущую строку, если это не первый продукт
          result += '</tr>';
        }
        // Начинаем новую строку для каждого четного индекса продукта
        result += '<tr>';
      }
      result += options.fn(products[index]);
      if (index === products.length - 1) {
        // Закрываем последнюю строку, если это последний продукт
        result += '</tr>';
      }
      return result;
    });

    handlebars.registerHelper('isEven', function (value, options) {
      return value % 2 == 0;
    });
  }

  private compileTemplate(templateName: string, context: any): string {
    const filePath = path.join(
      __dirname,
      '..',
      'mail/templates',
      `${templateName}.hbs`,
    );
    const source = fs.readFileSync(filePath, 'utf-8');
    const template = handlebars.compile(source);
    return template(context);
  }

  public getConfirmationTemplate(data: {
    username: string;
    greatings: string;
    confirmAccountEmail: {
      textA: string;
      textB: string;
      textC: string;
      textD: string;
      textE: string;
      textF: string;
      textG: string;
    };
    unsubscribeLink: string;
    activationLink: string;
  }): string {
    return this.compileTemplate('confirmation', data);
  }

  public getActivationSuccessTemplate(data: {
    username: string;
    loginLink: string;
  }): string {
    return this.compileTemplate('activation-success', data);
  }

  public getNewProductsEmailTemplate(data: {
    username: string;
    text: string;
    greatings: string;
    footer: {
      header: string;
      subheader: string;
      link: string;
    };
    products: Array<{
      name: string;
      price: number;
      imageURL: string;
      link: string;
      CTA: string;
    }>;
    unsubscribeLink: string;
  }): string {
    return this.compileTemplate('new-products', data);
  }

  public getNewCollectionsEmailTemplate(data: {
    username: string;
    text: string;
    greatings: string;
    footer: {
      header: string;
      subheader: string;
      link: string;
    };
    collections: Array<{
      name: string;
      description: string;
      products: Array<{
        imageURL: string;
      }>;
    }>;
    unsubscribeLink: string;
  }): string {
    return this.compileTemplate('new-collections', data); // Убедитесь, что у вас есть шаблон с именем 'new-collections'
  }
}
