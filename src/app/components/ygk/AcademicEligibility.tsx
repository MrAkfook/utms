import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

interface AcademicEligibilityProps {
  onBack: () => void;
}

const MOCK_APPLICANTS = [
  { id: 'APP-2025-001234', name: 'Ahmet Yılmaz', gpa: 3.45, osym: 485.5, semester: 3, eligible: true, score: 87.5 },
  { id: 'APP-2025-001235', name: 'Ayşe Demir', gpa: 3.12, osym: 462.0, semester: 3, eligible: true, score: 81.2 },
  { id: 'APP-2025-001236', name: 'Mehmet Kaya', gpa: 2.35, osym: 455.0, semester: 3, eligible: false, score: 0 },
];

export function AcademicEligibility({ onBack }: AcademicEligibilityProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Akademik Uygunluk Değerlendirmesi</h1>
          <p className="text-gray-600">Adayların akademik gereksinimlere göre değerlendirilmesi</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Geri Dön
        </Button>
      </div>

      <Card className="p-6">
        <h2 className="text-gray-900 mb-4">Uygunluk Kriterleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm text-gray-900">Minimum GNO</div>
            <div className="text-green-700 font-bold">≥ 2.50 / 4.00</div>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm text-gray-900">Geçerli Dönem</div>
            <div className="text-green-700 font-bold">Sadece 3. veya 5.</div>
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <div className="text-sm text-gray-900">ÖSYM Puanı</div>
            <div className="text-green-700 font-bold">Geçerli 2022-2024</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm text-gray-700">Başvuru ID</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Öğrenci</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">GNO</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">ÖSYM</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Dönem</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Puan</th>
                <th className="text-left py-3 px-4 text-sm text-gray-700">Durum</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_APPLICANTS.map((app) => (
                <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono">{app.id}</td>
                  <td className="py-3 px-4 text-sm font-medium">{app.name}</td>
                  <td className="py-3 px-4 text-sm">{app.gpa.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm">{app.osym.toFixed(1)}</td>
                  <td className="py-3 px-4 text-sm">{app.semester}. Dönem</td>
                  <td className="py-3 px-4 text-sm font-bold text-[#C00000]">{app.score.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    {app.eligible ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Uygun
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Uygun Değil
                      </Badge>
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
