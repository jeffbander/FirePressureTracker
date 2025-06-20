import { User } from "../models/User";
import { DatabaseStorage } from "../storage";

export class AuthenticationService {
  private storage: DatabaseStorage;

  constructor(storage: DatabaseStorage) {
    this.storage = storage;
  }

  // Authenticate user with username and password
  public async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const userData = await this.storage.getUserByUsername(username);
      if (!userData) {
        return null;
      }

      const user = new User(userData);
      
      if (user.validatePassword(password)) {
        return user;
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  // Validate user session
  public async validateSession(userId: number): Promise<User | null> {
    try {
      const userData = await this.storage.getUser(userId);
      if (!userData) {
        return null;
      }

      return new User(userData);
    } catch (error) {
      console.error('Session validation error:', error);
      return null;
    }
  }

  // Check if user has required permission
  public hasPermission(user: User, action: string): boolean {
    switch (action) {
      case 'manage_patients':
        return user.canManagePatients();
      case 'create_tasks':
        return user.canCreateTasks();
      case 'view_all_communications':
        return user.isAdmin() || user.isNurse();
      case 'admin_access':
        return user.isAdmin();
      default:
        return false;
    }
  }
}