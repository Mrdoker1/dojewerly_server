import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { CatalogCriteriaService } from './criteria.service';
import { CatalogCriteria } from './criteria.model';
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CatalogCriteriaDto } from '../dto/criteria.dto'; // Импортируйте DTO
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enum/enums';

@ApiTags('Catalog Criteria')
@Controller('catalog-criteria')
export class CatalogCriteriaController {
  constructor(
    private readonly catalogCriteriaService: CatalogCriteriaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get catalog criteria' })
  async getCriteria(): Promise<CatalogCriteria> {
    return this.catalogCriteriaService.getCriteria();
  }

  @Put()
  @ApiOperation({ summary: 'Update catalog criteria' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBody({ type: CatalogCriteriaDto })
  async updateCriteria(
    @Body() criteria: CatalogCriteriaDto,
  ): Promise<CatalogCriteria> {
    return this.catalogCriteriaService.updateCriteria(criteria);
  }
}
