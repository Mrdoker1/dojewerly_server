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
} from '@nestjs/swagger';

class EmailProductInfoDto {
  @ApiProperty({
    example: 'Here are some exciting new products!',
    description: 'The text to be included in the email.',
  })
  text: string;

  @ApiProperty({
    example: ['64e2876331dd055f5f494dd6', '64f90e534c52aabb13177793'],
    description: 'The array of product IDs to include in the email.',
    type: [String],
  })
  productIds: string[];
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
  @ApiResponse({ status: 200, description: 'Emails sent successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-admin users.' })
  async sendEmails(@Body() body: EmailProductInfoDto) {
    await this.emailService.sendEmailToUsersWithProductInfo(
      body.text,
      body.productIds,
    );
  }
}
