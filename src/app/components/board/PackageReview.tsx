import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  AlertTriangle,
  Send
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { CommentsPanel } from '../shared/CommentsPanel';
import { toast } from 'sonner';

interface PackageReviewProps {
  packageId: string;
  onBack: () => void;
}

const MOCK_PACKAGE = {
  id: 'PKG-2025-CE-001',
  department: 'Bilgisayar Mühendisliği',
  semester: '3. Dönem',
  receivedDate: '18/01/2025',
  meetingDate: '25/01/2025',
  deansNotes: 'İdari inceleme tamamlanmıştır. Tüm belgeler usulüne uygundur. YGK değerlendirmesi titizlikle yapılmış ve gerekçelendirilmiştir. Onaylanması tavsiye olunur.',
  summary: {
    asilCount: 8,
    yedekCount: 4,
    quota: 8
  }
};

export function PackageReview({ packageId, onBack }: PackageReviewProps) {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [boardNotes, setBoardNotes] = useState('');
  const [confirmedReview, setConfirmedReview] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleApprove = () => {
    if (boardNotes.trim() && confirmedReview) {
      toast.success('Paket başarıyla onaylandı. Sonuçlar 24 saat içinde ilan edilecektir.');
      setShowApproveModal(false);
      onBack();
    }
  };

  const handleReject = () => {
    if (rejectionReason.trim()) {
      toast.error('Paket reddedildi ve revizyon için iade edildi');
      setShowRejectModal(false);
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 font-bold">Fakülte Kurulu - Paket İncelemesi</h1>
          <p className="text-gray-600 font-medium">{MOCK_PACKAGE.id} - {MOCK_PACKAGE.department}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Paketlere Dön
        </Button>
      </div>

      {/* Meeting Info Banner */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="font-medium">
          <strong>Fakülte Yönetim Kurulu:</strong> Bu paket {MOCK_PACKAGE.meetingDate} tarihli kurul toplantısında görüşülmek üzere gündeme alınmıştır.
          Tüm kurul üyelerinin toplantı öncesi incelemesi zorunludur.
        </AlertDescription>
      </Alert>

      {/* Package Overview */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">Paket Genel Bakış</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Bölüm</div>
            <div className="text-gray-900 font-bold">{MOCK_PACKAGE.department}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500 mb-1">Giriş Dönemi</div>
            <div className="text-gray-900 font-bold">{MOCK_PACKAGE.semester}</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-sm text-gray-500 mb-1">Asil Kontenjan</div>
            <div className="text-2xl text-green-600 font-bold">{MOCK_PACKAGE.summary.asilCount}</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="text-sm text-gray-500 mb-1">Yedek</div>
            <div className="text-2xl text-yellow-600 font-bold">{MOCK_PACKAGE.summary.yedekCount}</div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2 font-bold uppercase tracking-wider">Dekanlık İnceleme Notu:</div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-gray-900 leading-relaxed italic">
            "{MOCK_PACKAGE.deansNotes}"
          </div>
        </div>
      </Card>

      {/* Review Checklist */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">Kurul Kontrol Listesi</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900 font-bold">YGK Değerlendirmesi Tamamlandı</div>
                <div className="text-xs text-gray-600">Tüm adaylar belirlenen kriterlere göre puanlanmış ve sıralanmıştır.</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900 font-bold">Ders Muafiyet (İntibak) Tabloları Hazır</div>
                <div className="text-xs text-gray-600">Asil listesindeki tüm öğrenciler için intibak formları düzenlenmiştir.</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900 font-bold">Kontenjan Uyumu</div>
                <div className="text-xs text-gray-600">Önerilen aday sayıları ilan edilen bölüm kontenjanları ile uyumludur.</div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900 font-bold">Dekanlık Onayı</div>
                <div className="text-xs text-gray-600">İdari ve usul yönünden eksiklik olmadığı dekanlıkça teyit edilmiştir.</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Review Documents */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">İnceleme Belgeleri</h2>
        <div className="space-y-2">
          {[
            'Nihai Sıralama Listesi (Asil & Yedek)',
            'YGK Değerlendirme Raporları',
            'Ders Muafiyet Tabloları (İntibak)',
            'Dil Yeterlilik Doğrulama Özeti',
            'Dekanlık İnceleme Notları',
            'Destekleyici Belgeler ve Kanıtlar'
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-500 group-hover:text-[#C00000]" />
                <span className="text-sm text-gray-900 font-medium">{doc}</span>
              </div>
              <Button size="sm" variant="ghost" className="hover:bg-white">
                <Download className="w-4 h-4 mr-2" />
                İndir
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Comments Panel */}
      <CommentsPanel 
        applicationId={packageId}
        currentUserRole="Fakülte Kurulu"
      />

      {/* Board Decision Actions */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4 font-bold">Kurul Kararı</h2>
        <p className="text-sm text-gray-600 mb-6 font-medium">
          Fakülte Yönetim Kurulu bu değerlendirme paketini onaylamalı veya reddetmelidir.
          Onaylama işlemi, transfer kararlarını kesinleştirerek öğrencilere ilan edilmesini sağlar.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2 border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowRejectModal(true)}
          >
            <XCircle className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-bold">Paketi Reddet</div>
              <div className="text-xs">Revizyon için iade et</div>
            </div>
          </Button>

          <Button 
            variant="outline"
            className="h-auto py-4 flex flex-col items-center space-y-2 hover:bg-gray-50"
          >
            <Send className="w-6 h-6 text-gray-600" />
            <div className="text-center">
              <div className="text-sm font-bold">Ek Bilgi Talebi</div>
              <div className="text-xs">Dekanlık/YGK'ya sor</div>
            </div>
          </Button>

          <Button 
            className="h-auto py-4 flex flex-col items-center space-y-2 shadow-lg shadow-red-100"
            style={{ backgroundColor: '#5C1010' }}
            onClick={() => setShowApproveModal(true)}
          >
            <CheckCircle2 className="w-6 h-6" />
            <div className="text-center">
              <div className="text-sm font-bold">Paketi Onayla</div>
              <div className="text-xs opacity-80">Kararları kesinleştir</div>
            </div>
          </Button>
        </div>
      </Card>

      {/* Approve Modal */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Değerlendirme Paketini Onayla</DialogTitle>
            <DialogDescription>
              Fakülte Yönetim Kurulu onayı ile bu paketteki tüm transfer kararları kesinleşecektir.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm font-medium text-green-800">
                <strong>Onay Etkisi:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{MOCK_PACKAGE.summary.asilCount} öğrenci kabul edilecektir</li>
                  <li>{MOCK_PACKAGE.summary.yedekCount} öğrenci yedek listesine alınacaktır</li>
                  <li>Sonuçlar 24 saat içinde sisteme yansıtılacaktır</li>
                  <li>ÖİDB ilan sürecini başlatmak üzere bilgilendirilecektir</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="boardNotes">Kurul Karar Notu *</Label>
              <Textarea
                id="boardNotes"
                rows={4}
                placeholder="Fakülte Yönetim Kurulu'nun resmi karar metnini ve gerekçesini giriniz..."
                value={boardNotes}
                onChange={(e) => setBoardNotes(e.target.value)}
              />
            </div>

            <div className="flex items-start space-x-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox 
                id="confirm"
                checked={confirmedReview}
                onCheckedChange={(checked) => setConfirmedReview(checked as boolean)}
              />
              <Label htmlFor="confirm" className="text-xs cursor-pointer leading-relaxed text-gray-600 italic">
                Tüm belgeleri incelediğimi ve Fakülte Yönetim Kurulu'nun bu değerlendirme paketini
                nihai ilan için uygun bulduğunu onaylıyorum. Bu karar bağlayıcıdır ve resmi karar defterine işlenecektir.
              </Label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowApproveModal(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={!boardNotes.trim() || !confirmedReview}
                style={{ backgroundColor: '#5C1010' }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Onayı Tamamla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Değerlendirme Paketini Reddet</DialogTitle>
            <DialogDescription>
              Bu işlem paketi revizyon için iade edecektir. Lütfen detaylı neden belirtiniz.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-sm font-medium">
                Paketin reddedilmesi nihai sonuçların ilanını geciktirecektir.
                Paket, dekanlığa ve YGK'ya geri gönderilecektir.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="rejection">Red Nedeni ve Gerekli Revizyonlar *</Label>
              <Textarea
                id="rejection"
                rows={6}
                placeholder="Tespit edilen eksiklikleri ve yapılması gereken düzeltmeleri açıkça belirtiniz..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reddi Kesinleştir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
