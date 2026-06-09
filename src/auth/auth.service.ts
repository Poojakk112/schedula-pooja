import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, Role } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(name: string, email: string, password: string, role: Role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create(name, email, hashedPassword, role); // 👈 added await
    return { message: 'User created successfully', userId: user.id };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email); // 👈 added await
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}