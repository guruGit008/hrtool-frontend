import { X } from 'lucide-react';
import { ReactNode } from 'react';

export interface ViewField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'status';
}



interface DataViewProps<T> {
  isOpen: boolean;
  onClose: () => void;
  data: T;
  fields: ViewField[];
  title: string;
}

export default function DataView<T>({ 
  isOpen, 
  onClose, 
  data, 
  fields,
  title 
}: DataViewProps<T>) {
  if (!isOpen) return null;

  const formatValue = (value: unknown, type: ViewField['type']): ReactNode => {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'date':
        return new Date(value as string).toLocaleDateString();
      case 'currency':
        return typeof value === 'number' ? `$${value.toLocaleString()}` : String(value);
      case 'percentage':
        return typeof value === 'number' ? `${value}%` : String(value);
      case 'status':
        const statusValue = String(value).toLowerCase();
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusValue === 'paid' || statusValue === 'valid' ? 'bg-green-100 text-green-800' :
            statusValue === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            statusValue === 'overdue' || statusValue === 'expired' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {String(value)}
          </span>
        );
      default:
        return String(value);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                {field.label}
              </label>
              <div className="text-gray-900">
                {formatValue((data as Record<string, unknown>)[field.name], field.type)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 