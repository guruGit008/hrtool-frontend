export interface Document {
  type: string;
  name: string;
  url: string;
}

export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  joinDate: string;
  status: string;
  documents: Document[];
} 