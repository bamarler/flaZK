export interface UserDocument {
    id: string;
    type: string;
    name: string;
    uploadedAt: Date;
    fields: Record<string, any>;
  }
  
  export interface User {
    userId: string;
    phone: string;
  }