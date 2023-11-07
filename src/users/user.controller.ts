import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  NotFoundException,
  Put,
  Req,
  Patch,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateProfileDto,
  UpdateUserDto,
} from '../dto/user.dto';
import { UserDocument } from './user.model';
import { UserRole } from '../enum/enums';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

import { Request, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { ResendService } from 'nestjs-resend';
import { TemplateService } from '../mail/template.service';
import { Response } from 'express';

@ApiTags('Users') // Первый добавленный тег будет вкладкой по умолчанию
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly resendService: ResendService,
    private readonly templateService: TemplateService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (only available to admin)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getUsers(): Promise<UserDocument[]> {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Get info about my account (if authorized)' })
  // @ApiHeader({
  //   name: 'Authorization',
  //   description: 'Bearer token',
  // })
  @ApiResponse({ status: 200, description: 'User information' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard) // Добавлено использование JwtAuthGuard
  @Get('me')
  getProfile(@Request() req) {
    const userId = req.user.id; // Извлекаем идентификатор пользователя из токена
    return this.userService.findById(userId); // Используем метод `findById` из `UserService`
  }

  @ApiOperation({
    summary: 'Get all info about user (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<UserDocument> {
    return this.userService.findById(id); // Используем метод `findById` из `UserService`
  }

  @ApiOperation({
    summary: 'Get public information about the user, such as favorites lists',
  })
  @Get(':id/public')
  async getUserPublicData(
    @Param('id') id: string,
  ): Promise<{ username: string; favorites: string[] }> {
    const user = await this.userService.findById(id);
    // Возвращаем публичные данные пользователя и список избранных товаров
    return {
      username: user.username,
      favorites: user.favorites.map((id) => id.toString()),
    };
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user, new public registration' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: Object,
  })
  @ApiBadRequestResponse({ description: 'Username is already taken' })
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDocument> {
    // Set the role to "user"
    createUserDto.role = UserRole.USER;
    createUserDto.role = UserRole.USER;

    // Check if the Email is already taken
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('Email is already taken!');
    }

    const server = process.env.SERVER_DOMAIN;
    const client = process.env.CLIENT_DOMAIN;

    // Создание пользователя
    const newUser = await this.userService.createUser(createUserDto);

    // Подготовка и отправка письма
    const confirmUrl = `https://${server}/users/confirm/${newUser.id}`; // Замените на вашу логику подтверждения
    const htmlContent = this.templateService.getConfirmationTemplate({
      username: newUser.username,
      activationLink: confirmUrl,
      unsubscribeLink: `https://${client}/dashboard/profile`,
    });

    await this.resendService.send({
      from: '"DoJewelry" <support@dojewerly.shop>',
      to: newUser.email,
      subject: 'Please confirm your DoJewerly email!',
      html: htmlContent,
    });

    return newUser;
  }

  @Post()
  @ApiOperation({
    summary: 'Create new user with role selector (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN) // Только администратор может создавать пользователей с выбором роли
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserDocument> {
    return this.userService.createUser(createUserDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete user by id (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteUser(@Param('id') id: string, @Req() req: any): Promise<void> {
    const currentUserId = req.user.id;
    await this.userService.deleteUser(id, currentUserId);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update own account information (if authorized)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async updateOwnAccount(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    const { username, email, password, settings } = updateProfileDto;

    if (!username && !email && !password && settings === undefined) {
      throw new BadRequestException('No fields to update');
    }

    const user = await this.userService.updateProfile(
      req.user.id,
      username,
      email,
      password,
      settings,
    );

    return user;
  }

  @Patch('me')
  @ApiOperation({
    summary: 'Partially update own account information (if authorized)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async patchOwnAccount(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserDocument> {
    return this.userService.patchProfile(req.user.id, updateProfileDto);
  }

  @Put(':id')
  @ApiOperation({
    summary:
      'Update information about a specific user (only available to admin)',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<void> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Обновление информации о пользователе
    await this.userService.updateUser(id, updateUserDto);
  }

  // Эндпойнт для активации аккаунта
  @Get('confirm/:userId')
  async confirmAccount(
    @Param('userId') userId: string,
    @Res() res: Response,
  ): Promise<any> {
    const user = await this.userService.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    if (user.isActivated) {
      return res.status(400).send('Account is already activated');
    }
    await this.userService.activateUser(userId);

    // Если аккаунт активирован, используйте новый шаблон
    const htmlContent = this.templateService.getActivationSuccessTemplate({
      username: user.username,
      loginLink: `https://${process.env.CLIENT_DOMAIN}/signin`,
    });

    res.send(htmlContent);

    // Или вы можете выполнить редирект:
    // res.redirect(`https://${process.env.CLIENT_DOMAIN}/login`);
  }
}
