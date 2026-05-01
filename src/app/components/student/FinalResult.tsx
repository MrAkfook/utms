import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { useState } from 'react';

interface FinalResultProps {
  applicationId: string;
  onAppeal: () => void;
  onBack: () => void;
}

// Mock result - can be 'admitted', 'waitlisted', or 'rejected'
const MOCK_RESULT = {
  status: 'waitlisted' as 'admitted' | 'waitlisted' | 'rejected',
  rank: 3,
  totalWaitlist: 8,
  announcementDate: '2025-02-01',
  hasIntibak: true
};

export function FinalResult({ applicationId, onAppeal, onBack }: FinalResultProps) {
  const getResultConfig = () => {
    switch (MOCK_RESULT.status) {
      case 'admitted':
        return {
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Congratulations! You Have Been Admitted',
          description: 'You have been accepted to the Computer Engineering program for 3rd semester entry.',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'waitlisted':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'You Are on the Waitlist',
          description: 'You have been placed on the waitlist. You will be notified if a position becomes available.',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Application Not Accepted',
          description: 'Unfortunately, your application was not successful for this period.',
          badgeColor: 'bg-red-100 text-red-800'
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;

  // Scenario 7: Even if email service fails (571-NOTIFY), result is still on portal
  const [emailStatus, setEmailStatus] = useState<'sent' | 'error'>('error');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Application Result</h1>
          <p className="text-gray-600">Application ID: {applicationId}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {emailStatus === 'error' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">
            <strong>Notification Notice:</strong> We encountered an issue sending your result email (Error: 571-NOTIFY).
            However, your official result is published here in the portal.
          </AlertDescription>
        </Alert>
      )}

      {/* Result Card */}
      <Card className={`p-8 border-2 ${config.borderColor} ${config.bgColor}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center border-2 ${config.borderColor}`}>
              <Icon className={`w-12 h-12 ${config.iconColor}`} />
            </div>
          </div>
          
          <h2 className="text-gray-900 mb-2">{config.title}</h2>
          <p className="text-gray-700 mb-4">{config.description}</p>
          
          <Badge className={config.badgeColor}>
            {MOCK_RESULT.status.toUpperCase()}
          </Badge>

          {MOCK_RESULT.status === 'waitlisted' && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-900 mb-1">Waitlist Position</div>
              <div className="text-2xl text-yellow-700">#{MOCK_RESULT.rank} of {MOCK_RESULT.totalWaitlist}</div>
              <div className="text-xs text-gray-600 mt-2">
                You will be notified via email if your position changes
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Details Card */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4">Decision Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Target Program</div>
              <div className="text-gray-900">Computer Engineering</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Target Semester</div>
              <div className="text-gray-900">3rd Semester (2nd Year Entry)</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Decision Date</div>
              <div className="text-gray-900">{MOCK_RESULT.announcementDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Final Score</div>
              <div className="text-gray-900 font-mono">87.50000 / 100</div>
            </div>
          </div>

          {MOCK_RESULT.status === 'admitted' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Next Steps:</strong> You will receive an email with registration instructions. 
                Please complete your registration by February 15, 2025.
              </AlertDescription>
            </Alert>
          )}

          {MOCK_RESULT.status === 'waitlisted' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Waitlist Information:</strong> If admitted students do not complete their registration, 
                positions may become available. You will be notified immediately if you are admitted from the waitlist.
              </AlertDescription>
            </Alert>
          )}

          {MOCK_RESULT.status === 'rejected' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Appeal Process:</strong> If you believe there was an error in the evaluation, 
                you may submit an appeal within 5 business days.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Course Equivalence (Intibak) */}
      {(MOCK_RESULT.status === 'admitted' || MOCK_RESULT.status === 'waitlisted') && MOCK_RESULT.hasIntibak && (
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Course Equivalence Table (İntibak)</h2>
          <p className="text-sm text-gray-600 mb-4">
            The following courses from your previous institution have been evaluated for equivalence
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700">Previous Course</th>
                  <th className="text-left py-3 px-4 text-gray-700">Credits</th>
                  <th className="text-left py-3 px-4 text-gray-700">Equivalent Course</th>
                  <th className="text-left py-3 px-4 text-gray-700">Credits</th>
                  <th className="text-left py-3 px-4 text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Introduction to Programming</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">COMP 101 - Programming Fundamentals</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Full Equivalent</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Data Structures</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">COMP 201 - Data Structures & Algorithms</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Full Equivalent</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Calculus I</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">MATH 101 - Calculus I</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Full Equivalent</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Digital Logic Design</td>
                  <td className="py-3 px-4 text-gray-600">3</td>
                  <td className="py-3 px-4 text-gray-900">COMP 150 - Digital Systems</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Partial Equivalent</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Total Credits Transferred:</strong> 15.00000 credits
              </div>
              <div>
                <strong>Additional Credits Required:</strong> 1.00000 credit
              </div>
              <div>
                <strong>Starting Semester:</strong> 3rd Semester
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            <FileText className="w-4 h-4 mr-2" />
            Download Full İntibak Document (PDF)
          </Button>
        </Card>
      )}

      {/* Appeal Section */}
      {MOCK_RESULT.status === 'rejected' && (
        <Card className="p-6 border-l-4" style={{ borderLeftColor: '#C00000' }}>
          <h2 className="text-gray-900 mb-2">Not Satisfied with the Result?</h2>
          <p className="text-sm text-gray-600 mb-4">
            You can submit an appeal if you believe there was an error in the evaluation process. 
            Appeals must be submitted within 5 business days from the result announcement date.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>Appeal Deadline:</strong> February 6, 2025
            </div>
            <Button 
              onClick={onAppeal}
              style={{ backgroundColor: '#C00000' }}
            >
              Submit Appeal
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
