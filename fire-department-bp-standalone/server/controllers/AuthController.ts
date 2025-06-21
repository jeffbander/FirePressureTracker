import { Request, Response } from "express";
import { AuthenticationService } from "../services/AuthenticationService";
import { MemStorage } from "../storage";

export class AuthController {
  private authService: AuthenticationService;

  constructor() {
    const storage = new MemStorage();
    this.authService = new AuthenticationService(storage);
  }

  // Handle user login
  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ 
          success: false, 
          message: "Username and password are required" 
        });
        return;
      }

      const user = await this.authService.authenticateUser(username, password);

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
        return;
      }

      // In a real application, you would generate a JWT token here
      const userResponse = user.toPublicData();
      
      res.json({ 
        success: true, 
        user: userResponse,
        message: "Login successful" 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // Handle user logout
  public async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a real application, you would invalidate the JWT token here
      res.json({ 
        success: true, 
        message: "Logout successful" 
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // Validate current session
  public async validateSession(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({ 
          success: false, 
          message: "User ID is required" 
        });
        return;
      }

      const user = await this.authService.validateSession(userId);

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: "Invalid session" 
        });
        return;
      }

      res.json({ 
        success: true, 
        user: user.toPublicData() 
      });
    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }

  // Check user permissions
  public async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { userId, action } = req.body;

      if (!userId || !action) {
        res.status(400).json({ 
          success: false, 
          message: "User ID and action are required" 
        });
        return;
      }

      const user = await this.authService.validateSession(userId);

      if (!user) {
        res.status(401).json({ 
          success: false, 
          message: "Invalid session" 
        });
        return;
      }

      const hasPermission = this.authService.hasPermission(user, action);

      res.json({ 
        success: true, 
        hasPermission,
        user: user.toPublicData() 
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  }
}