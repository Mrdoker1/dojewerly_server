import fs from 'fs';
import handlebars from 'handlebars';

function compileTemplate(templatePath, data) {
  const source = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(source);
  return template(data);
}

module.exports = { compileTemplate };
