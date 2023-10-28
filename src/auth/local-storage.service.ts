import { Injectable } from '@nestjs/common';

@Injectable()
export class LocalStorageService {
  private readonly TOKEN_KEY = 'jwt_token';

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
