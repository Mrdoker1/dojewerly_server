import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../enum/enums';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiProperty,
  ApiBearerAuth,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class LocalizedProps {
  @ApiPropertyOptional({ description: 'Localized text' })
  text?: string;

  @ApiPropertyOptional({ description: 'Localized subject' })
  subject?: string;
}

class EmailProductInfoDto {
  @ApiProperty({
    example: 'Here are some exciting new products!',
    description: 'The text to be included in the email.',
  })
  text: string;

  @ApiProperty({
    example: 'Check our new products!',
    description: 'Subject text for the email.',
  })
  subject: string;

  @ApiProperty({
    example: [
      '64e2876331dd055f5f494dd6',
      '64f90e534c52aabb13177793',
      '64f90ed74c52aabb131777c7',
      '64f90f104c52aabb131777d2',
    ],
    description: 'The array of product IDs to include in the email.',
    type: [String],
  })
  productIds: string[];
  @ApiProperty({
    example: {
      RU: {
        text: 'Вот несколько интересных новинок!',
        subject: 'Проверьте наши новинки!',
      },
    },
    description: 'Localized content for the email.',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        subject: { type: 'string' },
      },
    },
  })
  localization: { [key: string]: LocalizedProps };
}

class EmailCollectionInfoDto {
  @ApiProperty({
    example: 'У меня вышла новая крутая коллекция, посмотри что тут есть!',
    description: 'Новая весенняя коллекция!',
  })
  text: string;

  @ApiProperty({
    example: 'Check our new collections!',
    description: 'Subject text for the email.',
  })
  subject: string;

  @ApiProperty({
    example: [
      '64b3bfd3a4508f0e8461cadc',
      '64fa39eb7e670e2c5163ee88',
      '6504e78d914803215641e662',
    ],
    description: 'The array of collection IDs to include in the email.',
    type: [String],
  })
  collectionIds: string[];
  @ApiProperty({
    example: {
      RU: {
        text: 'У меня вышла новая крутая коллекция, посмотри что тут есть!',
        subject: 'Новая весенняя коллекция!',
      },
    },
    description: 'Localized content for the email.',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        subject: { type: 'string' },
      },
    },
  })
  localization: { [key: string]: LocalizedProps };
}

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send-product-info')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send email with product info to users' })
  @ApiBody({ type: EmailProductInfoDto })
  async sendEmails(@Body() body: EmailProductInfoDto) {
    return await this.emailService.sendEmailToUsersWithProductInfo(
      body.text,
      body.subject,
      body.productIds,
      body.localization,
    );
  }

  @Post('send-collection-info')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Send email with collection info to users' })
  @ApiBody({ type: EmailCollectionInfoDto })
  @ApiResponse({ status: 200, description: 'Emails sent successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admin users.' })
  async sendCollectionEmails(@Body() body: EmailCollectionInfoDto) {
    return await this.emailService.sendEmailToUsersWithCollectionInfo(
      body.text,
      body.subject,
      body.collectionIds,
      body.localization,
    );
  }
}
