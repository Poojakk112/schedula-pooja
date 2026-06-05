import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import type { Role } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register as Doctor or Patient' })
  @ApiBody({
    schema: {
      example: {
        name: 'Dr. Pooja',
        email: 'doctor@test.com',
        password: '123456',
        role: 'DOCTOR',
      },
    },
  })
  signup(
    @Body('name') name: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('role') role: Role,
  ) {
    return this.authService.signup(name, email, password, role);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get token' })
  @ApiBody({
    schema: {
      example: {
        email: 'doctor@test.com',
        password: '123456',
      },
    },
  })
  login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.login(email, password);
  }
}