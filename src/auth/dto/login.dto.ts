import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@test.com', description: 'Електронна пошта' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'Пароль' })
  @IsString()
  password!: string;
}