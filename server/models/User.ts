import { User as UserType } from "@shared/schema";

export class User {
  public id: number;
  public username: string;
  public password: string;
  public name: string;
  public role: string;
  public email?: string;
  public phone?: string;
  public createdAt: Date;

  constructor(data: UserType) {
    this.id = data.id;
    this.username = data.username;
    this.password = data.password;
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.phone = data.phone;
    this.createdAt = data.createdAt;
  }

  // Check if user has admin privileges
  public isAdmin(): boolean {
    return this.role === 'admin';
  }

  // Check if user is a nurse
  public isNurse(): boolean {
    return this.role === 'nurse';
  }

  // Check if user is a health coach
  public isCoach(): boolean {
    return this.role === 'coach';
  }

  // Check if user can manage patients
  public canManagePatients(): boolean {
    return this.isAdmin() || this.isNurse();
  }

  // Check if user can create workflow tasks
  public canCreateTasks(): boolean {
    return this.isAdmin() || this.isNurse();
  }

  // Get user data without password for API responses
  public toPublicData(): Omit<UserType, 'password'> {
    const { password, ...publicData } = this;
    return publicData;
  }

  // Validate password
  public validatePassword(password: string): boolean {
    return this.password === password;
  }
}