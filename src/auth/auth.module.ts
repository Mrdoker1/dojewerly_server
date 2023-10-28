import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../users/user.module';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { StorageService } from './storage.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TOKEN_LIVE_TIME, Token, TokenSchema } from './token.model';
import { TokenService } from './token.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    JwtModule.registerAsync({
      imports: [
        ConfigModule,
        MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
      ],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get('JWT_SECRET');
        console.log('JWT_SECRET:', secret);
        return {
          secret,
          signOptions: { expiresIn: TOKEN_LIVE_TIME },
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]), // Add this line
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    StorageService,
    TokenService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
