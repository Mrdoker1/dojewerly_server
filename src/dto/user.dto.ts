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
    example: { email: true },
    description: 'Settings object',
    type: 'object',
    additionalProperties: true,
  })
  settings: { email: boolean };
}

export class CreateUserDto {
  @ApiProperty({ example: 'user', description: 'Username' })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email' })
  email: string;

  @ApiProperty({ example: 'pa$$w0rd', description: 'Password' })
  password: string;

  @ApiProperty({
    example: 'user',
    description: 'User role',
    enum: ['admin', 'user'],
  })
  role: string;
}
