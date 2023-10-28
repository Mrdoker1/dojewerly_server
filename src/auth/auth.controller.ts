import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiProperty,
} from '@nestjs/swagger';

class LoginDto {
  @ApiProperty({ example: 'admin@email.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'admin', description: 'Password' })
  password: string;
}

class TokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    description: 'Access token',
  })
  token: string;
}

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Successful login', type: TokenDto })
  @UseGuards(LocalAuthGuard)
  async login(@Request() req): Promise<TokenDto> {
    console.log('Attempting to login user', req.user);
    const { token } = await this.authService.login(req.user);
    return { token };
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and invalidate JWT token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req): Promise<void> {
    await this.authService.logout(req.headers.authorization.split(' ')[1]);
  }

  @Get('validate')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async validate(@Request() req): Promise<{ status: string }> {
    await this.authService.validateToken(
      req.headers.authorization.split(' ')[1],
    );
    return { status: 'Token is valid' };
  }
}
