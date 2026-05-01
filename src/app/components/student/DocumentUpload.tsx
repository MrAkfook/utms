import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  File as FileIcon,
  CheckCircle2, 
  AlertCircle, 
  X,
  Eye,
  ArrowLeft,
  Send,
  History
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

interface DocumentUploadProps {
  applicationId: string;
  applicationData: any;
  onComplete: () => void;
  onBack: () => void;
}

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  maxSize: number; // in MB
  acceptedFormats: string[];
}

const BASE_DOCUMENTS: DocumentType[] = [
  {
    id: 'transcript',
    name: 'Official Transcript',
    description: 'Complete academic transcript from current university',
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    id: 'osym_result',
    name: 'ÖSYM Exam Result',
    description: 'Official ÖSYM score document',
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    id: 'curriculum',
    name: 'Program Curriculum',
    description: 'Current program curriculum from your university',
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF']
  },
  {
    id: 'student_certificate',
    name: 'Student Certificate',
    description: 'Current enrollment certificate',
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    id: 'language_proficiency',
    name: 'English Proficiency Certificate',
    description: 'TOEFL, IELTS, or YDS certificate (if applicable)',
    required: false,
    maxSize: 10,
    acceptedFormats: ['PDF', 'JPG', 'PNG']
  },
  {
    id: 'course_contents',
    name: 'Course Contents/Syllabi',
    description: 'Detailed course descriptions from previous courses',
    required: true,
    maxSize: 10,
    acceptedFormats: ['PDF']
  }
];

export function DocumentUpload({ applicationId, applicationData, onComplete, onBack }: DocumentUploadProps) {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, {
    file: File;
    status: 'valid' | 'invalid';
    error?: string;
    version: number;
    history: { name: string; date: string }[];
  }>>({});
  const [documentList, setDocumentList] = useState<DocumentType[]>(BASE_DOCUMENTS);

  useEffect(() => {
    // Dynamic checklist: Add Portfolio for Architecture
    if (applicationData?.targetProgram === 'architecture') {
       if (!documentList.find(d => d.id === 'portfolio')) {
         setDocumentList(prev => [...prev, {
           id: 'portfolio',
           name: 'Portfolio',
           description: 'Design portfolio for Architecture/Art programs',
           required: true,
           maxSize: 10,
           acceptedFormats: ['PDF']
         }]);
       }
    } else {
       setDocumentList(BASE_DOCUMENTS);
    }
  }, [applicationData]);

  const validateFile = (file: File, docType: DocumentType): { valid: boolean; error?: string } => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > docType.maxSize) {
      return { valid: false, error: `File size exceeds ${docType.maxSize}MB limit` };
    }

    // Check file format
    const fileExt = file.name.split('.').pop()?.toUpperCase();
    if (!fileExt || !docType.acceptedFormats.includes(fileExt)) {
      return { valid: false, error: `Only ${docType.acceptedFormats.join(', ')} files are allowed` };
    }

    // Simulated Encryption Check
    if (file.name.toLowerCase().includes('encrypted')) {
      return { valid: false, error: 'Encrypted files are not supported. Please remove password protection.' };
    }

    return { valid: true };
  };

  const generateFileName = (docTypeId: string, originalName: string) => {
    const ext = originalName.split('.').pop();
    return `${applicationId}_${docTypeId}_${applicationData?.tckn || '12345678901'}.${ext}`;
  };

  const handleFileUpload = (docType: DocumentType, file: File) => {
    const validation = validateFile(file, docType);
    const existing = uploadedDocs[docType.id];
    
    const newEntry = {
      file,
      status: validation.valid ? 'valid' as const : 'invalid' as const,
      error: validation.error,
      version: existing ? existing.version + 1 : 1,
      history: existing ? [
        { name: existing.file.name, date: new Date().toLocaleString() },
        ...existing.history
      ] : []
    };

    setUploadedDocs(prev => ({
      ...prev,
      [docType.id]: newEntry
    }));

    if (validation.valid) {
      toast.success(`${docType.name} uploaded successfully${newEntry.version > 1 ? ' (Version ' + newEntry.version + ')' : ''}`);
    } else {
      toast.error(`Upload failed: ${validation.error}`);
    }
  };

  const handleRemoveFile = (docTypeId: string) => {
    const newDocs = { ...uploadedDocs };
    delete newDocs[docTypeId];
    setUploadedDocs(newDocs);
  };

  const canSubmit = () => {
    const requiredDocs = documentList.filter(doc => doc.required);
    return requiredDocs.every(doc => 
      uploadedDocs[doc.id] && uploadedDocs[doc.id].status === 'valid'
    );
  };

  const handleSubmit = () => {
    if (canSubmit()) {
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Upload Required Documents</h1>
          <p className="text-gray-600">Application ID: {applicationId}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </Button>
      </div>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Upload Guidelines:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>All required documents must be uploaded to submit your application</li>
            <li>Files must be in PDF, JPG, or PNG format</li>
            <li>Maximum file size: 10 MB per document</li>
            <li>Files will be automatically renamed according to system standards</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Document Upload Cards */}
      <div className="grid grid-cols-1 gap-4">
        {documentList.map((docType) => {
          const uploaded = uploadedDocs[docType.id];
          const isUploaded = !!uploaded;
          const isValid = uploaded?.status === 'valid';

          return (
            <Card key={docType.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-gray-900">{docType.name}</h3>
                    {docType.required && (
                      <span className="text-xs text-red-600">*Required</span>
                    )}
                    {isUploaded && isValid && (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    )}
                    {isUploaded && !isValid && (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{docType.description}</p>
                  <p className="text-xs text-gray-500">
                    Accepted formats: {docType.acceptedFormats.join(', ')} • Max size: {docType.maxSize}MB
                  </p>

                  {/* Uploaded File Info */}
                  {isUploaded && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <FileIcon className="w-5 h-5 text-[#C00000]" />
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-900">{uploaded.file.name}</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] h-4">Active</Badge>
                                {uploaded.version > 1 && (
                                  <Badge variant="outline" className="text-[10px] h-4">v{uploaded.version}</Badge>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 mt-0.5">
                                Size: {(uploaded.file.size / (1024 * 1024)).toFixed(2)} MB • Renamed to: {generateFileName(docType.id, uploaded.file.name)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveFile(docType.id)}
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        {!isValid && uploaded.error && (
                          <div className="mt-2 text-xs text-red-600 flex items-center">
                            <AlertCircle className="w-3 h-3 mr-1" /> {uploaded.error}
                          </div>
                        )}
                      </div>

                      {/* Version History */}
                      {uploaded.history.length > 0 && (
                        <div className="pl-4 border-l-2 border-gray-100 space-y-2">
                          <p className="text-[10px] font-medium text-gray-500 flex items-center uppercase tracking-wider">
                            <History className="w-3 h-3 mr-1" /> Archived Versions
                          </p>
                          {uploaded.history.map((hist, i) => (
                            <div key={i} className="flex items-center justify-between text-[11px] text-gray-400 bg-gray-50/50 p-2 rounded">
                              <span className="truncate max-w-[200px]">{hist.name}</span>
                              <div className="flex items-center space-x-2">
                                <span>{hist.date}</span>
                                <Badge variant="secondary" className="bg-gray-100 text-gray-500 text-[9px] h-3">Archived</Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Upload Button */}
                <div className="ml-4">
                  <label htmlFor={`upload-${docType.id}`}>
                    <Button 
                      type="button"
                      variant={isUploaded ? "outline" : "default"}
                      style={!isUploaded ? { backgroundColor: '#C00000' } : undefined}
                      onClick={() => document.getElementById(`upload-${docType.id}`)?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploaded ? 'Replace' : 'Upload'}
                    </Button>
                  </label>
                  <input
                    id={`upload-${docType.id}`}
                    type="file"
                    className="hidden"
                    accept={docType.acceptedFormats.map(f => `.${f.toLowerCase()}`).join(',')}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(docType, file);
                      }
                    }}
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress Summary */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-900 mb-1">Upload Progress</h3>
            <p className="text-sm text-gray-600">
              {Object.values(uploadedDocs).filter(doc => doc.status === 'valid').length} of {documentList.filter(d => d.required).length} required documents uploaded
            </p>
          </div>
          <div className="text-right">
            {canSubmit() ? (
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            )}
          </div>
        </div>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!canSubmit()}
          style={{ backgroundColor: '#C00000' }}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Final Application
        </Button>
      </div>

      {!canSubmit() && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please upload all required documents before submitting your application.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
