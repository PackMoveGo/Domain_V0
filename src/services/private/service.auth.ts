// Temporarily disabled for Next.js build
export class AuthService {
  static async login(email: string, password: string) {
    throw new Error('AuthService temporarily disabled');
  }
  
  static async register(userData: any) {
    throw new Error('AuthService temporarily disabled');
  }
  
  static async logout() {
    throw new Error('AuthService temporarily disabled');
  }
}