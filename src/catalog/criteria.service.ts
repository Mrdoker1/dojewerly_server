import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CatalogCriteria, CatalogCriteriaDocument } from './criteria.model';

@Injectable()
export class CatalogCriteriaService {
  constructor(
    @InjectModel(CatalogCriteria.name)
    private catalogCriteriaModel: Model<CatalogCriteriaDocument>,
  ) {}

  async getCriteria(): Promise<CatalogCriteriaDocument> {
    return this.catalogCriteriaModel.findOne().exec();
  }

  async updateCriteria(criteria: CatalogCriteria): Promise<CatalogCriteria> {
    await this.catalogCriteriaModel.findOneAndUpdate({}, criteria, {
      upsert: true,
    });
    return this.getCriteria();
  }
}
