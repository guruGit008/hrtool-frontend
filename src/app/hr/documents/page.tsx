'use client';
import React, { useState, useEffect } from 'react';
import { File, Upload, Search, Filter,  Download,  X,  User, FileText, CreditCard, Briefcase, GraduationCap, LucideIcon } from 'lucide-react';
import { APIURL } from '@/constants/api';
import toast, { Toaster } from 'react-hot-toast';

interface Document {
  id: number;
  employeeId: string;
  documentType: string;
  fileName: string;
  fileDownloadUri: string;
  fileType: string;
  size: number;
  originalFileName?: string;
}

interface DocumentType {
  id: string;
  name: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

interface ApiDocument {
  id: number;
  employeeId: string;
  documentType?: string;
  fileName?: string;
  fileDownloadUri?: string;
  fileType?: string;
  size?: number;
  originalFileName?: string;
}

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingDocument, ] = useState<Document | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    fileName: '',
    originalFileName: '',
    employeeId: '',
    documentType: '',
  });
 

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(APIURL +'/api/hr/documents');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      
      // Transform API response to match our Document interface
      const transformedDocuments: Document[] = (data as ApiDocument[]).map((doc) => ({
        id: doc.id,
        employeeId: doc.employeeId,
        documentType: doc.documentType ? doc.documentType.toLowerCase() : '',
        fileName: doc.fileName || '',
        fileDownloadUri: doc.fileDownloadUri || '',
        fileType: doc.fileType || '',
        size: doc.size || 0,
        status: 'approved', // Default status since it's not provided by API
        originalFileName: doc.originalFileName,
      }));

      setDocuments(transformedDocuments);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch documents');
    } finally {
      setIsLoading(false);
    }
  };

  const documentTypes: DocumentType[] = [
    { id: 'resume', name: 'Resume', icon: FileText, color: 'blue' },
    { id: 'marks', name: 'Marks Card', icon: GraduationCap, color: 'green' },
    { id: 'id', name: 'ID Proof', icon: CreditCard, color: 'purple' },
    { id: 'offer', name: 'Offer Letter', icon: Briefcase, color: 'orange' }
  ];

  const getDocumentIcon = (type: string): LucideIcon => {
    if (!type) return File;
    const docType = documentTypes.find(dt => dt.id === type.toLowerCase());
    return docType ? docType.icon : File;
  };

  const getDocumentColorClasses = (type: string) => {
    if (!type) return { bg: 'bg-gray-100', text: 'text-gray-600' };
    const docType = documentTypes.find(dt => dt.id === type.toLowerCase());
    if (!docType) return { bg: 'bg-gray-100', text: 'text-gray-600' };
    
    const colorMap: Record<DocumentType['color'], { bg: string; text: string }> = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' }
    };
    
    return colorMap[docType.color] || { bg: 'bg-gray-100', text: 'text-gray-600' };
  };



  const filteredDocuments = documents.filter(doc => {
    if (!doc) return false;
    const matchesCategory = selectedCategory === 'all' || 
      (doc.documentType && doc.documentType.toLowerCase() === selectedCategory);
    const matchesSearch = 
      (doc.fileName && doc.fileName.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (doc.employeeId && doc.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    setSelectedFiles(files && files.length > 0 ? files : null);
  };

  const handleUploadSubmit = async () => {
    setUploadError(null);
    if (!selectedFiles || selectedFiles.length === 0 || !selectedDocType || !employeeId) {
      setUploadError('All fields are required.');
      return;
    }
    setIsUploading(true);
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const formData = new FormData();
        formData.append('file', selectedFiles[i]);
        const response = await fetch(APIURL +`/api/hr/upload/${selectedDocType.toUpperCase()}/${employeeId}`, {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) {
          throw new Error('Failed to upload document: ' + selectedFiles[i].name);
        }
      }
      await fetchDocuments();
      setShowUploadModal(false);
      setSelectedDocType('');
      setEmployeeId('');
      setSelectedFiles(null);
      toast.success('Documents uploaded successfully');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload document');
      toast.error(error instanceof Error ? error.message : 'Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadDocument = async (document: Document) => {
    try {
      // Construct the download URL using the correct format
      const downloadUrl = APIURL +`/api/hr/download/${document.employeeId}/${document.documentType.toUpperCase()}`;
      
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
      link.download = document.fileName;
      
      // Append to body, click and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      try {
        const response = await fetch(APIURL +`/api/hr/documents/${documentToDelete.id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete document');
        }

        await fetchDocuments(); // Refresh the documents list
        setShowDeleteModal(false);
        setDocumentToDelete(null);
        toast.success('Document deleted successfully');
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete document');
        toast.error(error instanceof Error ? error.message : 'Failed to delete document');
      }
    }
  };

  const handleEditFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setEditFile(file);
  };

  const openEditModal = (doc: Document) => {
    setEditingDocument(doc);
    setEditFile(null);
    setEditError(null);
    setEditForm({
      fileName: doc.fileName,
      originalFileName: doc.originalFileName || '',
      employeeId: doc.employeeId,
      documentType: doc.documentType,
    });
    setShowEditModal(true);
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async () => {
    setEditError(null);
    if (!editingDocument || !editForm.fileName || !editForm.employeeId || !editForm.documentType) {
      setEditError('All fields are required.');
      return;
    }
    setIsEditing(true);
    try {
      const formData = new FormData();
      if (editFile) formData.append('file', editFile);
      formData.append('fileName', editForm.fileName);
      formData.append('originalFileName', editForm.originalFileName);
      const response = await fetch(
        APIURL + `/api/hr/upload/${editingDocument.documentType.toUpperCase()}/${editingDocument.employeeId}`,
        {
          method: 'PUT',
          body: formData,
        }
      );
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      await fetchDocuments();
      setShowEditModal(false);
      setEditingDocument(null);
      setEditFile(null);
      toast.success('Document updated successfully');
    } catch (error) {
      setEditError(error instanceof Error ? error.message : 'Failed to update document');
      toast.error(error instanceof Error ? error.message : 'Failed to update document');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toaster position="top-right" />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">HR Document Management</h1>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Document</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Document Type Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Documents ({documents.length})
            </button>
            {documentTypes.map((type) => {
              const Icon = type.icon;
              const count = documents.filter(doc => doc.documentType === type.id).length;
              const colorClasses = getDocumentColorClasses(type.id);
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedCategory(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === type.id 
                      ? `${colorClasses.bg} ${colorClasses.text}` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{type.name} ({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search documents or employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Documents Grid */}
          <div className="p-4">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map((doc) => {
                  if (!doc) return null;
                  const IconComponent = getDocumentIcon(doc.documentType || '');
                  const colorClasses = getDocumentColorClasses(doc.documentType || '');
                  
                  return (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
                          <IconComponent className={`w-6 h-6 ${colorClasses.text}`} />
                        </div>
                      
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium text-gray-900 truncate">{
                          doc.originalFileName && doc.originalFileName.trim()
                            ? doc.originalFileName
                            : (doc.fileName && doc.fileName.trim() ? doc.fileName : 'Unnamed Document')
                        }</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{doc.employeeId || 'Unknown Employee'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <File className="w-4 h-4" />
                          <span>{doc.fileType || 'Unknown Type'} • {(doc.size / 1024).toFixed(1)} KB</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mt-4">
                     
                        <button 
                          onClick={() => handleDownloadDocument(doc)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download</span>
                        </button>
                        <button 
                          onClick={() => openEditModal(doc)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteDocument(doc)}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter employee ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUploading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isUploading}
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Choose File
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="upload-file-input"
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFileChange}
                      disabled={!selectedDocType || !employeeId || isUploading}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('upload-file-input')?.click()}
                      disabled={!selectedDocType || !employeeId || isUploading}
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      <span>Select File(s)</span>
                    </button>
                  </div>
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="text-xs text-gray-700 mt-1">
                      Selected: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>

                {uploadError && (
                  <div className="text-red-600 text-sm mt-2">
                    {uploadError}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedDocType('');
                    setEmployeeId('');
                    setSelectedFiles(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isUploading || !selectedFiles || selectedFiles.length === 0 || !selectedDocType || !employeeId}
                >
                  {isUploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Document Modal */}
        {showViewModal && viewingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">View Document</h2>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Document Preview</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span> {viewingDocument.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Type:</span> {documentTypes.find(t => t.id === viewingDocument.documentType)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Size:</span> {(viewingDocument.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Uploaded by:</span> {viewingDocument.employeeId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(viewingDocument.fileDownloadUri.split('/')[4]).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => handleDownloadDocument(viewingDocument)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {showEditModal && editingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Edit Document</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    value={editForm.employeeId}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <select
                    name="documentType"
                    value={editForm.documentType}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isEditing}
                  >
                    <option value="">Select document type</option>
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original File Name
                  </label>
                  <input
                    type="text"
                    name="originalFileName"
                    value={editForm.originalFileName}
                    onChange={handleEditFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    disabled={isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New File (optional)
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      id="edit-file-input"
                      type="file"
                      onChange={handleEditFileChange}
                      className="hidden"
                      disabled={isEditing}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('edit-file-input')?.click()}
                      disabled={isEditing}
                      className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      <span>Select File</span>
                    </button>
                  </div>
                  {editFile && (
                    <div className="text-xs text-gray-700 mt-1">
                      Selected: {editFile.name}
                    </div>
                  )}
                </div>
                {editError && <div className="text-red-600 text-sm">{editError}</div>}
                <button
                  onClick={handleEditSubmit}
                  className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                  disabled={isEditing || !editForm.fileName || !editForm.employeeId || !editForm.documentType}
                >
                  {isEditing ? 'Updating...' : 'Update Document'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && documentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Document</h3>
              <p className="text-gray-600 mb-6">
Are you sure you want to delete &quot;{documentToDelete.fileName}&quot;? This action cannot be undone.
</p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDocumentToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}