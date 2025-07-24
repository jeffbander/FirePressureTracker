// AppSheet API service for bidirectional data synchronization

interface AppSheetConfig {
  appId: string;
  accessToken: string;
  baseUrl: string;
}

interface AppSheetTableAction {
  Action: 'Add' | 'Edit' | 'Delete';
  Properties?: Record<string, any>;
  Rows: Array<Record<string, any>>;
}

class AppSheetAPI {
  private config: AppSheetConfig;

  constructor() {
    this.config = {
      appId: process.env.APPSHEET_APP_ID || '',
      accessToken: process.env.APPSHEET_ACCESS_TOKEN || '',
      baseUrl: process.env.APPSHEET_BASE_URL || 'https://api.appsheet.com/api/v2/apps'
    };
  }

  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const url = `${this.config.baseUrl}/${this.config.appId}${endpoint}`;
    
    const headers: Record<string, string> = {
      'ApplicationAccessKey': this.config.accessToken,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data && method === 'POST') {
      options.body = JSON.stringify(data);
    }

    try {
      console.log(`AppSheet API ${method} ${url}`);
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AppSheet API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AppSheet API request failed:', error);
      throw error;
    }
  }

  // Sync member data to AppSheet
  async syncMemberToAppSheet(memberData: any) {
    try {
      const payload: AppSheetTableAction = {
        Action: 'Add',
        Properties: {
          Locale: 'en-US',
          Location: '47.623098, -122.330184',
          Timezone: 'Pacific Standard Time'
        },
        Rows: [{
          id: memberData.id,
          fullName: memberData.fullName,
          dateOfBirth: memberData.dateOfBirth,
          email: memberData.email,
          mobilePhone: memberData.mobilePhone,
          unionId: memberData.unionId,
          unionMemberId: memberData.unionMemberId,
          height: memberData.height,
          weight: memberData.weight,
          statusId: memberData.statusId,
          createdAt: memberData.createdAt,
          lastActiveAt: memberData.lastActiveAt
        }]
      };

      return await this.makeRequest('/tables/Members/Action', 'POST', payload);
    } catch (error) {
      console.error('Failed to sync member to AppSheet:', error);
      throw error;
    }
  }

  // Update member data in AppSheet
  async updateMemberInAppSheet(memberData: any) {
    try {
      const payload: AppSheetTableAction = {
        Action: 'Edit',
        Properties: {
          Locale: 'en-US'
        },
        Rows: [{
          id: memberData.id,
          fullName: memberData.fullName,
          email: memberData.email,
          mobilePhone: memberData.mobilePhone,
          height: memberData.height,
          weight: memberData.weight,
          statusId: memberData.statusId,
          lastActiveAt: memberData.lastActiveAt
        }]
      };

      return await this.makeRequest('/tables/Members/Action', 'POST', payload);
    } catch (error) {
      console.error('Failed to update member in AppSheet:', error);
      throw error;
    }
  }

  // Sync BP reading to AppSheet
  async syncBpReadingToAppSheet(readingData: any) {
    try {
      const payload: AppSheetTableAction = {
        Action: 'Add',
        Properties: {
          Locale: 'en-US'
        },
        Rows: [{
          id: readingData.id,
          memberId: readingData.memberId,
          systolic: readingData.systolic,
          diastolic: readingData.diastolic,
          heartRate: readingData.heartRate,
          categoryId: readingData.categoryId,
          notes: readingData.notes,
          recordedAt: readingData.recordedAt,
          isAbnormal: readingData.isAbnormal,
          createdAt: readingData.createdAt
        }]
      };

      return await this.makeRequest('/tables/BpReadings/Action', 'POST', payload);
    } catch (error) {
      console.error('Failed to sync BP reading to AppSheet:', error);
      throw error;
    }
  }

  // Sync task to AppSheet
  async syncTaskToAppSheet(taskData: any) {
    try {
      const payload: AppSheetTableAction = {
        Action: 'Add',
        Properties: {
          Locale: 'en-US'
        },
        Rows: [{
          id: taskData.id,
          memberId: taskData.memberId,
          assignedTo: taskData.assignedTo,
          title: taskData.title,
          description: taskData.description,
          typeId: taskData.typeId,
          priorityId: taskData.priorityId,
          statusId: taskData.statusId,
          createdByAi: taskData.createdByAi,
          aiReasoning: taskData.aiReasoning,
          dueDate: taskData.dueDate,
          completedAt: taskData.completedAt,
          createdAt: taskData.createdAt,
          updatedAt: taskData.updatedAt
        }]
      };

      return await this.makeRequest('/tables/Tasks/Action', 'POST', payload);
    } catch (error) {
      console.error('Failed to sync task to AppSheet:', error);
      throw error;
    }
  }

  // Update task in AppSheet
  async updateTaskInAppSheet(taskData: any) {
    try {
      const payload: AppSheetTableAction = {
        Action: 'Edit',
        Properties: {
          Locale: 'en-US'
        },
        Rows: [{
          id: taskData.id,
          assignedTo: taskData.assignedTo,
          title: taskData.title,
          description: taskData.description,
          statusId: taskData.statusId,
          dueDate: taskData.dueDate,
          completedAt: taskData.completedAt,
          updatedAt: taskData.updatedAt
        }]
      };

      return await this.makeRequest('/tables/Tasks/Action', 'POST', payload);
    } catch (error) {
      console.error('Failed to update task in AppSheet:', error);
      throw error;
    }
  }

  // Get data from AppSheet table
  async getTableData(tableName: string, selector?: string) {
    try {
      let endpoint = `/tables/${tableName}/Action`;
      
      const payload = {
        Action: 'Find',
        Properties: {
          Locale: 'en-US',
          Selector: selector || 'SELECT(Members[id], TRUE)'
        }
      };

      return await this.makeRequest(endpoint, 'POST', payload);
    } catch (error) {
      console.error(`Failed to get ${tableName} data from AppSheet:`, error);
      throw error;
    }
  }

  // Test AppSheet connection
  async testConnection() {
    try {
      const response = await this.makeRequest('/tables');
      console.log('AppSheet connection successful:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('AppSheet connection failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Check if AppSheet is properly configured
  isConfigured(): boolean {
    return !!(this.config.appId && this.config.accessToken && this.config.baseUrl);
  }
}

// Create singleton instance
export const appSheetAPI = new AppSheetAPI();

// Helper function to safely call AppSheet API
export async function safeAppSheetCall(operation: () => Promise<any>, fallback?: any) {
  if (!appSheetAPI.isConfigured()) {
    console.warn('AppSheet not configured, skipping API call');
    return fallback;
  }

  try {
    return await operation();
  } catch (error) {
    console.error('AppSheet API call failed:', error);
    return fallback;
  }
}