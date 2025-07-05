import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  options?: string[];
  required?: boolean;
}

interface DataFormProps<T> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<T, 'id'>) => void;
  title: string;
  fields: FormField[];
  initialData?: T | null;
}

export default function DataForm<T extends { id: number | string }>({ 
  isOpen, 
  onClose, 
  onSubmit, 
  title, 
  fields, 
  initialData 
}: DataFormProps<T>) {
  const [formData, setFormData] = useState<Partial<T>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const emptyData: Partial<T> = {};
      fields.forEach(field => {
        emptyData[field.name as keyof T] = (field.type === 'number' ? 0 : '') as T[keyof T];
      });
      setFormData(emptyData);
    }
  }, [initialData, fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Omit<T, 'id'>);
  };

  if (!isOpen) return null;

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name as keyof T] as string || ''}
                  onChange={handleChange}
                  required={field.required}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name as keyof T] as string || ''}
                  onChange={handleChange}
                  required={field.required}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={
                    field.type === 'date'
                      ? (() => {
                          const val = formData[field.name as keyof T];
                          if (!val) return '';
                          if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
                          const d = new Date(val as string);
                          if (!isNaN(d.getTime())) {
                            const year = d.getFullYear();
                            const month = String(d.getMonth() + 1).padStart(2, '0');
                            const day = String(d.getDate()).padStart(2, '0');
                            return `${year}-${month}-${day}`;
                          }
                          return '';
                        })()
                      : field.type === 'number'
                        ? (formData[field.name as keyof T] !== undefined && formData[field.name as keyof T] !== null
                            ? formData[field.name as keyof T]!.toString()
                            : '')
                        : (formData[field.name as keyof T] as string || '')
                  }
                  onChange={handleChange}
                  required={field.required}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 