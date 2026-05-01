import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Award, Download } from 'lucide-react';

interface RankingTableProps {
  onBack: () => void;
}

const RANKED_APPLICANTS = [
  { rank: 1, id: 'APP-2025-001234', name: 'Ahmet Yılmaz', score: 87.50000, status: 'asil' },
  { rank: 2, id: 'APP-2025-001235', name: 'Ayşe Demir', score: 85.23450, status: 'asil' },
  { rank: 3, id: 'APP-2025-001238', name: 'Fatma Şahin', score: 83.81123, status: 'asil' },
  { rank: 4, id: 'APP-2025-001240', name: 'Can Öztürk', score: 82.10050, status: 'asil' },
  { rank: 5, id: 'APP-2025-001242', name: 'Mustafa Çelik', score: 81.40000, status: 'asil' },
  { rank: 6, id: 'APP-2025-001244', name: 'Zeynep Kara', score: 80.32000, status: 'asil' },
  { rank: 7, id: 'APP-2025-001246', name: 'Burak Demir', score: 79.50000, status: 'asil' },
  { rank: 8, id: 'APP-2025-001248', name: 'Elif Yıldız', score: 78.29999, status: 'asil' },
  { rank: 9, id: 'APP-2025-001250', name: 'Emre Arslan', score: 76.84567, status: 'yedek' },
  { rank: 10, id: 'APP-2025-001252', name: 'Selin Koç', score: 75.40000, status: 'yedek' },
];

export function RankingTable({ onBack }: RankingTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Applicant Ranking</h1>
          <p className="text-gray-600">3rd Semester Entry - Computer Engineering</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-sm text-gray-600">Total Quota</div>
          <div className="text-2xl text-gray-900">8</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Asil (Direct Admission)</div>
          <div className="text-2xl text-green-600">8</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-gray-600">Yedek (Waitlist)</div>
          <div className="text-2xl text-yellow-600">2</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Final Rankings</h2>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export to PDF
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-700">Rank</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Application ID</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Student Name</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Final Score</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {RANKED_APPLICANTS.map((app) => (
                <tr key={app.id} className={`border-b border-gray-100 ${app.rank <= 8 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {app.rank <= 3 && <Award className="w-4 h-4 mr-2" style={{ color: '#C00000' }} />}
                      <span className="text-sm">{app.rank}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm font-mono">{app.id}</td>
                  <td className="py-3 px-4 text-sm">{app.name}</td>
                  <td className="py-3 px-4 text-sm font-mono font-bold text-[#C00000]">{app.score.toFixed(5)}</td>
                  <td className="py-3 px-4">
                    {app.status === 'asil' ? (
                      <Badge className="bg-green-100 text-green-800">Asil</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">Yedek</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
