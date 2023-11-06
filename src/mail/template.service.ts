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

    handlebars.registerHelper('newRow', function (index, options) {
      const total = options.data.root.products.length;
      let result = '';
      if (index % 2 === 0) {
        // If it's the start of a new row
        result += '<div class="product-row">'; // Open a new row
      }

      result += options.fn(this); // Generate the product HTML

      if (index % 2 === 1 || index === total - 1) {
        // If it's the end of a row or the last product
        result += '</div>'; // Close the row
      }
      return new handlebars.SafeString(result);
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
    products: Array<{
      name: string;
      price: number;
      imageURL: string;
      link: string;
    }>;
    unsubscribeLink: string;
  }): string {
    return this.compileTemplate('new-products', data);
  }

  public getNewCollectionsEmailTemplate(data: {
    username: string;
    text: string;
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
