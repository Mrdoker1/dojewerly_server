import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email',
  })
  email: string;
  @ApiPropertyOptional({ example: 'john_doe', description: 'Username' })
  username: string;
  @ApiPropertyOptional({ example: 'pa$$w0rd', description: 'Password' })
  password: string;
  @ApiPropertyOptional({
    example: 'user',
    description: 'User role',
    enum: ['admin', 'user'],
  })
  role: string;
  @ApiPropertyOptional({
    example: { email: true, language: 'EN' },
    description: 'User settings',
    type: Object,
  })
  settings?: { email?: boolean; language?: string };
}

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'john.doe@example.com',
    description: 'Email',
  })
  email: string;

  @ApiPropertyOptional({ example: 'john_doe', description: 'Username' })
  username: string;

  @ApiPropertyOptional({ example: 'pa$$w0rd', description: 'Password' })
  password: string;

  @ApiPropertyOptional({
    example: { email: true, language: 'EN' },
    description: 'Settings object',
    type: 'object',
    additionalProperties: true,
  })
  settings: { email: boolean; language: string };
}

export class CreateUserDto {
  @ApiProperty({ example: 'user', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'pa$$w0rd', description: 'Password' })
  password: string;

  @ApiProperty({
    example: false,
    description: 'Whether the user account is activated or not',
    default: false,
  })
  isActivated: boolean;

  @ApiProperty({
    example: 'user',
    description: 'User role',
    enum: ['admin', 'user'],
  })
  role: string;
  @ApiProperty({
    example: { email: true, language: 'EN' },
    description: 'User settings',
    type: Object,
  })
  settings: { email: boolean; language: string };
}
