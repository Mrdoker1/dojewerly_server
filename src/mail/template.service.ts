import { Injectable } from '@nestjs/common';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TemplateService {
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
    activationLink: string;
  }): string {
    return this.compileTemplate('confirmation', data);
  }
}
