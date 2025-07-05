import { useRef, useState } from "react";
import { FaFileUpload, FaEye, FaDownload } from "react-icons/fa";
import { Document, Employee } from "@/types/employee";

interface DocumentUploadProps {
  employee: Employee;
  onEmployeeChange: (employee: Employee) => void;
  docTypes: string[];
}

export default function DocumentUpload({ employee, onEmployeeChange, docTypes }: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState(docTypes[0]);

  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const doc: Document = { 
      type: docType, 
      name: file.name, 
      url: URL.createObjectURL(file) 
    };
    
    onEmployeeChange({
      ...employee,
      documents: [...(employee.documents || []), doc]
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-6">
      <h4 className="font-semibold mb-2 flex items-center">
        <FaFileUpload className="mr-2" />Upload Document
      </h4>
      <div className="flex items-center space-x-2 mb-2">
        <select 
          value={docType} 
          onChange={e => setDocType(e.target.value)} 
          className="p-2 border rounded"
        >
          {docTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input 
          ref={fileInputRef}
          type="file" 
          onChange={handleUploadDoc} 
          className="p-2 border rounded" 
        />
      </div>
      <div className="mt-2">
        <h5 className="font-medium mb-1">Uploaded Documents:</h5>
        <ul className="space-y-1">
          {(employee.documents || []).map((doc, idx) => (
            <li key={idx} className="flex items-center text-sm">
              <FaEye className="mr-2 text-blue-500" />
              <span className="mr-2">{doc.type}:</span>
              <span className="mr-2 font-medium">{doc.name}</span>
              <a 
                href={doc.url} 
                download={doc.name} 
                className="text-blue-600 hover:underline flex items-center"
              >
                <FaDownload className="mr-1" />Download
              </a>
            </li>
          ))}
          {(!employee.documents || employee.documents.length === 0) && (
            <li className="text-gray-500">No documents uploaded.</li>
          )}
        </ul>
      </div>
    </div>
  );
} 