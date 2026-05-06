import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Реєстрація нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувача створено', type: Object })
  @ApiResponse({ status: 409, description: 'Email вже використовується' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Логін користувача', description: 'Повертає JWT токен' })
  @ApiResponse({ status: 200, description: 'Успішний логін', schema: { example: { accessToken: 'eyJhbGciOiJIUzI1NiIs...' } } })
  @ApiResponse({ status: 401, description: 'Невірні облікові дані' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}