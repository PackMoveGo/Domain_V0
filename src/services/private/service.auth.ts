// Temporarily disabled for Next.js build
export class AuthService {
  static async login(_email: string, _password: string) { // Reserved for future use
    throw new Error('AuthService temporarily disabled');
  }
  
  static async register(_userData: any) { // Reserved for future use
    throw new Error('AuthService temporarily disabled');
  }
  
  static async logout() {
    throw new Error('AuthService temporarily disabled');
  }
}