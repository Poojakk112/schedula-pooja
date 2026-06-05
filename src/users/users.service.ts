import { Injectable } from '@nestjs/common';

export type Role = 'DOCTOR' | 'PATIENT';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(name: string, email: string, password: string, role: Role): User {
    const user: User = {
      id: this.idCounter++,
      name,
      email,
      password,
      role,
    };
    this.users.push(user);
    return user;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }
}