export interface Employee {
  id: number;
  name: string;
  position: string;
  email: string;
  phone: string;
  joinDate: string;
  status: 'Active' | 'Inactive';
  assets: string[];
  leaves: {
    approved: number;
    pending: number;
    remaining: number;
  };
  performance: {
    rating: number;
    lastReview: string;
  };
}

export interface Leave {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reason: string;
}

export interface Asset {
  id: number;
  type: string;
  model: string;
  serialNo: string;
  assignedTo: number | null;
  status: 'Assigned' | 'Available';
}

export interface Document {
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export type ModalType = 'addEmployee' | 'addAsset' | 'addLeave' | 'addReview' | 'uploadDocument'; 