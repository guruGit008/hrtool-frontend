import { Employee } from "@/types/employee";

interface EmployeeFormProps {
  employee: Employee;
  onEmployeeChange: (employee: Employee) => void;
  onSubmit: () => void;
  onCancel: () => void;
  error?: string;
  isEdit?: boolean;
}

export default function EmployeeForm({ 
  employee, 
  onEmployeeChange, 
  onSubmit, 
  onCancel, 
  error,
  isEdit = false 
}: EmployeeFormProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative animate-fade-in">
        <h3 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Employee' : 'Add Employee'}</h3>
        {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" 
            placeholder="Name*" 
            value={employee.name} 
            onChange={e => onEmployeeChange({ ...employee, name: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="text" 
            placeholder="Position*" 
            value={employee.position} 
            onChange={e => onEmployeeChange({ ...employee, position: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="text" 
            placeholder="Department" 
            value={employee.department} 
            onChange={e => onEmployeeChange({ ...employee, department: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="email" 
            placeholder="Email*" 
            value={employee.email} 
            onChange={e => onEmployeeChange({ ...employee, email: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="text" 
            placeholder="Phone" 
            value={employee.phone} 
            onChange={e => onEmployeeChange({ ...employee, phone: e.target.value })} 
            className="p-2 border rounded" 
          />
          <input 
            type="date" 
            placeholder="Join Date" 
            value={employee.joinDate} 
            onChange={e => onEmployeeChange({ ...employee, joinDate: e.target.value })} 
            className="p-2 border rounded" 
          />
          <select 
            value={employee.status} 
            onChange={e => onEmployeeChange({ ...employee, status: e.target.value })} 
            className="p-2 border rounded"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button 
            onClick={onSubmit} 
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {isEdit ? 'Save' : 'Add'}
          </button>
          <button 
            onClick={onCancel} 
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 