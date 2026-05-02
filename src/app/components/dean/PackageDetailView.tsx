import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { 
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Users,
  Download,
  MessageSquare
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { CommentsPanel } from '../shared/CommentsPanel';
import { toast } from 'sonner';

interface PackageDetailViewProps {
  packageId: string;
  onBack: () => void;
}

const MOCK_PACKAGE = {
  id: 'PKG-2025-CE-001',
  department: 'Bilgisayar Mühendisliği',
  semester: '3. Dönem',
  period: 'Bahar 2024-2025',
  receivedDate: '16/01/2025',
  receivedFrom: 'YGK - Bilgisayar Mühendisliği',
  status: 'received_from_ygk',
  summary: {
    totalApplicants: 18,
    eligible: 12,
    asilCount: 8,
    yedekCount: 4,
    quota: 8
  },
  documents: [
    { name: 'Nihai Sıralama Listesi', status: 'tamam', size: '245 KB' },
    { name: 'Akademik Değerlendirme Raporları', status: 'tamam', size: '1.2 MB' },
    { name: 'Ders Muafiyet (İntibak) Tabloları', status: 'tamam', size: '856 KB' },
    { name: 'Dil Yeterlilik Özeti', status: 'tamam', size: '124 KB' },
    { name: 'YGK Komisyon Notları', status: 'tamam', size: '89 KB' }
  ],
  applicants: [
    { rank: 1, name: 'Ahmet Yılmaz', score: 87.5, status: 'asil', intibak: 'tamam' },
    { rank: 2, name: 'Ayşe Demir', score: 85.2, status: 'asil', intibak: 'tamam' },
    { rank: 3, name: 'Fatma Şahin', score: 83.8, status: 'asil', intibak: 'tamam' },
    { rank: 4, name: 'Can Öztürk', score: 82.1, status: 'asil', intibak: 'tamam' },
    { rank: 5, name: 'Mustafa Çelik', score: 81.4, status: 'asil', intibak: 'tamam' },
    { rank: 6, name: 'Zeynep Kara', score: 80.3, status: 'asil', intibak: 'tamam' },
    { rank: 7, name: 'Burak Demir', score: 79.5, status: 'asil', intibak: 'tamam' },
    { rank: 8, name: 'Elif Yıldız', score: 78.2, status: 'asil', intibak: 'tamam' }
  ]
};

export function PackageDetailView({ packageId, onBack }: PackageDetailViewProps) {
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [showClarificationModal, setShowClarificationModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [clarificationRequest, setClarificationRequest] = useState('');

  const handleForwardToBoard = () => {
    if (adminNotes.trim()) {
      toast.success('Paket başarıyla Fakülte Kurulu\'na sevk edildi');
      setShowForwardModal(false);
      onBack();
    }
  };

  const handleRequestClarification = () => {
    if (clarificationRequest.trim()) {
      toast.info('YGK\'dan ek bilgi talebi gönderildi');
      setShowClarificationModal(false);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 font-bold">Değerlendirme Paketi İncelemesi</h1>
          <p className="text-gray-600 font-medium">{MOCK_PACKAGE.id} - {MOCK_PACKAGE.department}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Paketlere Dön
        </Button>
      </div>

      {/* Package Status Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          <strong>İdari İnceleme Bekliyor:</strong> Bu paket YGK tarafından {MOCK_PACKAGE.receivedDate} tarihinde gönderilmiştir.
          Lütfen Fakülte Kurulu'na sevk etmeden önce idari eksiklik olup olmadığını kontrol ediniz.
        </AlertDescription>
      </Alert>

      {/* Package Summary */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">Paket Özeti</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Toplam Başvuran</div>
            <div className="text-2xl text-gray-900 font-bold">{MOCK_PACKAGE.summary.totalApplicants}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Uygun Bulunan</div>
            <div className="text-2xl text-gray-900 font-bold">{MOCK_PACKAGE.summary.eligible}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Asil Adaylar</div>
            <div className="text-2xl text-green-600 font-bold">{MOCK_PACKAGE.summary.asilCount}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">Yedek Adaylar</div>
            <div className="text-2xl text-yellow-600 font-bold">{MOCK_PACKAGE.summary.yedekCount}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Bölüm</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.department}</div>
          </div>
          <div>
            <div className="text-gray-500">Giriş Dönemi</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.semester}</div>
          </div>
          <div>
            <div className="text-gray-500">Akademik Dönem</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.period}</div>
          </div>
          <div>
            <div className="text-gray-500">Gönderen Birim</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.receivedFrom}</div>
          </div>
          <div>
            <div className="text-gray-500">Alınma Tarihi</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.receivedDate}</div>
          </div>
          <div>
            <div className="text-gray-500">Bölüm Kontenjanı</div>
            <div className="text-gray-900 font-medium">{MOCK_PACKAGE.summary.quota} Kişi</div>
          </div>
        </div>
      </Card>

      {/* Package Documents */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">Paket İçeriği (Belgeler)</h2>
        <div className="space-y-3">
          {MOCK_PACKAGE.documents.map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-sm text-gray-900 font-medium">{doc.name}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Boyut: {doc.size}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {doc.status}
                </Badge>
                <Button size="sm" variant="ghost">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Tüm Paketi İndir (ZIP)
          </Button>
        </div>
      </Card>

      {/* Admitted Students Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold">Kabul Edilen Öğrenciler (Asil Liste)</h2>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            {MOCK_PACKAGE.applicants.length} Öğrenci
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
                <th className="text-left py-3 px-4">Sıra</th>
                <th className="text-left py-3 px-4">Öğrenci Adı</th>
                <th className="text-left py-3 px-4">Transfer Puanı</th>
                <th className="text-left py-3 px-4">Durum</th>
                <th className="text-left py-3 px-4">İntibak</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PACKAGE.applicants.map((student) => (
                <tr key={student.rank} className="border-b border-gray-100 bg-green-50/30 hover:bg-green-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold">{student.rank}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-sm font-mono font-bold text-[#C00000]">{student.score.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800 text-[10px] font-bold">ASİL</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      HAZIR
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Comments Panel */}
      <CommentsPanel 
        applicationId={packageId}
        currentUserRole="Dekanlık"
      />

      {/* Action Buttons */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">İdari İşlemler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
            onClick={() => setShowClarificationModal(true)}
          >
            <MessageSquare className="w-6 h-6 text-gray-600" />
            <div className="text-center">
              <div className="text-sm font-bold">Bilgi / Revizyon Talebi</div>
              <div className="text-xs text-gray-500 mt-1">YGK'ya geri gönder</div>
            </div>
          </Button>

          <Button 
            className="h-auto py-4 flex flex-col items-center space-y-2 shadow-lg shadow-red-100"
            style={{ backgroundColor: '#6B1313' }}
            onClick={() => setShowForwardModal(true)}
          >
            <Send className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-bold">Fakülte Kurulu'na Sevk Et</div>
              <div className="text-xs opacity-80 mt-1">İdari uygunluğu onayla ve ilet</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Forward Modal */}
      <Dialog open={showForwardModal} onOpenChange={setShowForwardModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Paketi Fakülte Kurulu'na Sevk Et</DialogTitle>
            <DialogDescription>
              Bu işlem değerlendirme paketini nihai onay için Fakülte Yönetim Kurulu'na iletecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                İdari inceleme tamamlandı. Gerekli tüm belgeler mevcut ve değerlendirme süreci kurallara uygun görünmektedir.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="adminNotes">Fakülte Kurulu İçin Dekanlık Notu *</Label>
              <Textarea
                id="adminNotes"
                rows={4}
                placeholder="Fakülte Kurulu üyeleri için idari notlar veya tavsiyeler ekleyin..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <p className="text-xs text-gray-500 italic">
                Bu notlar kurul üyeleri tarafından inceleme sırasında görülebilecektir.
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm text-gray-900 mb-2 font-bold">Sevk İşlemi Sonrası:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Tüm Kurul Üyelerine e-posta bildirimi gönderilir</li>
                <li>✓ Paket Kurul'un inceleme kuyruğuna düşer</li>
                <li>✓ Tüm ekli belgelere erişim yetkisi verilir</li>
              </ul>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowForwardModal(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleForwardToBoard}
                disabled={!adminNotes.trim()}
                style={{ backgroundColor: '#6B1313' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Kurula Gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clarification Modal */}
      <Dialog open={showClarificationModal} onOpenChange={setShowClarificationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>YGK'dan Bilgi / Revizyon Talebi</DialogTitle>
            <DialogDescription>
              Bu paketi YGK'ya spesifik sorularınız veya revizyon taleplerinizle birlikte geri gönderin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clarification">Revizyon Talebi Detayları *</Label>
              <Textarea
                id="clarification"
                rows={5}
                placeholder="YGK'dan talep edilen ek bilgileri veya düzeltilmesi gereken noktaları belirtin..."
                value={clarificationRequest}
                onChange={(e) => setClarificationRequest(e.target.value)}
              />
            </div>

            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Bu işlem paketi YGK'ya geri döndürecek ve Fakülte Kurulu inceleme sürecini geciktirecektir.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowClarificationModal(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleRequestClarification}
                disabled={!clarificationRequest.trim()}
                variant="destructive"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Revizyon Talebini Gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
