import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatalogCriteriaService } from './criteria.service';
import { CatalogCriteriaController } from './criteria.controller';
import { CatalogCriteria, CatalogCriteriaSchema } from './criteria.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogCriteria.name, schema: CatalogCriteriaSchema },
    ]),
  ],
  providers: [CatalogCriteriaService],
  controllers: [CatalogCriteriaController],
  exports: [CatalogCriteriaService], // Экспорт, если вы планируете использовать этот сервис в других модулях
})
export class CriteriaModule {}
