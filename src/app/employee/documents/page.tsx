'use client';
import React, { useState, useEffect } from 'react';
import { FileText, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  status: 'verified' | 'pending' | 'rejected';
}

interface ApiDocument {
  id: number;
  employeeId: string;
  documentType: string;
  originalFileName: string;
  fileDownloadUri: string; // This URL is provided by the backend but is a direct link to the file
  fileType: string;
  size: number;
}

function mapApiDocumentToDocument(api: ApiDocument): Document {
  return {
    id: api.id,
    name: api.originalFileName,
    type: api.documentType,
    uploadDate: '', // Not provided by API
    status: 'verified', // Default or map if available
  };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [apiDocuments, setApiDocuments] = useState<ApiDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiBaseUrl, setApiBaseUrl] = useState<string | null>(null);
  const [downloadingId] = useState<number | null>(null);

  useEffect(() => {
    const employeeId = sessionStorage.getItem('employeeId') || localStorage.getItem('employeeId');
    if (!employeeId) {
      setError('Employee ID not found. Please log in again.');
      setLoading(false);
      return;
    }
    setApiBaseUrl(APIURL + '/api/hr/documents/employee/' + employeeId);
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) return;
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiDocument[]>(apiBaseUrl);
        setApiDocuments(response.data);
        setDocuments(response.data.map(mapApiDocumentToDocument));
        setError(null);
      } catch {
        setError('Failed to fetch documents. Make sure backend is running.');
        setDocuments([]);
        setApiDocuments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [apiBaseUrl]);

  const handleDownload = async (document: Document) => {
    try {
      // Find the matching API document
      const apiDoc = apiDocuments.find(doc => doc.originalFileName === document.name);
      if (!apiDoc) throw new Error('Download info not found for this document.');

      // Construct the download URL using the correct format
      const downloadUrl = APIURL +`/api/hr/download/${apiDoc.employeeId}/${apiDoc.documentType.toUpperCase()}`;

      // Fetch the file from the backend
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error('Failed to download document');
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element
      const link = window.document.createElement('a');
      link.href = url;
      link.download = apiDoc.originalFileName;

      // Append to body, click and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'resume':
        return <FileText className="w-6 h-6 text-blue-600" />;
      case 'marksCard':
        return <FileText className="w-6 h-6 text-green-600" />;
      case 'idProof':
        return <FileText className="w-6 h-6 text-purple-600" />;
      case 'offerLetter':
        return <FileText className="w-6 h-6 text-orange-600" />;
      default:
        return <FileText className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="mb-6">
        <Link
          href="/employee"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="mt-2 text-gray-600">Manage and view your important documents</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {['resume', 'marksCard', 'idProof', 'offerLetter'].map((type) => (
            <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                {getDocumentIcon(type)}
              </div>
              <h3 className="font-medium text-gray-900 capitalize">
                {type.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload or update your {type.toLowerCase().replace(/([A-Z])/g, ' $1').trim()}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document List</h2>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <p className="text-gray-600 text-center">No documents found.</p>
          ) : (
            <div className="space-y-4">
              {documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getDocumentIcon(document.type)}
                    <div>
                      <p className="font-medium">{document.name}</p>
                      <p className="text-sm text-gray-600">
                        Uploaded: {document.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                    <button
                      onClick={() => handleDownload(document)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      disabled={downloadingId === document.id}
                    >
                      {downloadingId === document.id ? (
                        <span className="animate-spin h-5 w-5 border-b-2 border-blue-600 rounded-full inline-block"></span>
                      ) : (
                        <Download className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}