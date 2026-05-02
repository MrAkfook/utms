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
          title: 'Tebrikler! Kabul Edildiniz',
          description: 'Bilgisayar Mühendisliği programına 3. dönem girişi için kabul edildiniz.',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'waitlisted':
        return {
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Yedek Listesindesiniz',
          description: 'Sıralamaya göre yedek listesinde yer almaktasınız. Kontenjan açılması durumunda bilgilendirileceksiniz.',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      case 'rejected':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Başvuru Kabul Edilmedi',
          description: 'Maalesef bu dönem için başvurunuz olumlu sonuçlanmamıştır.',
          badgeColor: 'bg-red-100 text-red-800'
        };
    }
  };

  const config = getResultConfig();
  const Icon = config.icon;

  const [emailStatus] = useState<'sent' | 'error'>('error');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Başvuru Sonucu</h1>
          <p className="text-gray-600">Başvuru ID: {applicationId}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Geri Dön
        </Button>
      </div>

      {emailStatus === 'error' && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-xs">
            <strong>Bildirim Notu:</strong> Sonuç e-postası gönderilirken bir sorun oluştu (Hata: 571-NOTIFY).
            Ancak resmi sonucunuza buradan ulaşabilirsiniz.
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
            {MOCK_RESULT.status === 'admitted' ? 'ASİL' : MOCK_RESULT.status === 'waitlisted' ? 'YEDEK' : 'RED'}
          </Badge>

          {MOCK_RESULT.status === 'waitlisted' && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-yellow-200">
              <div className="text-sm text-gray-900 mb-1">Yedek Sıranız</div>
              <div className="text-2xl text-yellow-700">{MOCK_RESULT.rank}. Yedek (Toplam {MOCK_RESULT.totalWaitlist})</div>
              <div className="text-xs text-gray-600 mt-2">
                Sıranız geldiğinde e-posta yoluyla bilgilendirileceksiniz.
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Details Card */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4">Karar Detayları</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Hedef Program</div>
              <div className="text-gray-900">Bilgisayar Mühendisliği</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Hedef Dönem</div>
              <div className="text-gray-900">3. Dönem (2. Sınıf Giriş)</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Açıklanma Tarihi</div>
              <div className="text-gray-900">{MOCK_RESULT.announcementDate}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Nihai Puan</div>
              <div className="text-gray-900 font-mono">87.50000 / 100</div>
            </div>
          </div>

          {MOCK_RESULT.status === 'admitted' && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Sonraki Adımlar:</strong> Kayıt talimatlarını içeren bir e-posta alacaksınız.
                Lütfen kaydınızı 15 Şubat 2025 tarihine kadar tamamlayınız.
              </AlertDescription>
            </Alert>
          )}

          {MOCK_RESULT.status === 'waitlisted' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <strong>Yedek Bilgilendirmesi:</strong> Asil adayların kayıt yaptırmaması durumunda sıra size gelecektir.
                Sıranız geldiğinde anında bilgilendirme yapılacaktır.
              </AlertDescription>
            </Alert>
          )}

          {MOCK_RESULT.status === 'rejected' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>İtiraz Süreci:</strong> Değerlendirmede bir hata olduğunu düşünüyorsanız,
                5 iş günü içerisinde itiraz başvurusunda bulunabilirsiniz.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </Card>

      {/* Course Equivalence (Intibak) */}
      {(MOCK_RESULT.status === 'admitted' || MOCK_RESULT.status === 'waitlisted') && MOCK_RESULT.hasIntibak && (
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Ders Muafiyet Tablosu (İntibak)</h2>
          <p className="text-sm text-gray-600 mb-4">
            Önceki kurumunuzdan aldığınız aşağıdaki dersler muafiyet için değerlendirilmiştir.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700">Alınan Ders</th>
                  <th className="text-left py-3 px-4 text-gray-700">Kredi</th>
                  <th className="text-left py-3 px-4 text-gray-700">Eşdeğer Ders</th>
                  <th className="text-left py-3 px-4 text-gray-700">Kredi</th>
                  <th className="text-left py-3 px-4 text-gray-700">Durum</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Programlamaya Giriş</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">COMP 101 - Programlama Temelleri</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Tam Muaf</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Veri Yapıları</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">COMP 201 - Veri Yapıları ve Algoritmalar</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Tam Muaf</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Matematik I</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4 text-gray-900">MATH 101 - Kalkülüs I</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-green-100 text-green-800">Tam Muaf</Badge>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-900">Dijital Mantık Tasarımı</td>
                  <td className="py-3 px-4 text-gray-600">3</td>
                  <td className="py-3 px-4 text-gray-900">COMP 150 - Dijital Sistemler</td>
                  <td className="py-3 px-4 text-gray-600">4</td>
                  <td className="py-3 px-4">
                    <Badge className="bg-yellow-100 text-yellow-800">Kısmi Muaf</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <strong>Toplam Muafiyet:</strong> 15.00000 kredi
              </div>
              <div>
                <strong>Tamamlanması Gereken Ek:</strong> 1.00000 kredi
              </div>
              <div>
                <strong>Başlangıç Dönemi:</strong> 3. Dönem
              </div>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4">
            <FileText className="w-4 h-4 mr-2" />
            Tam İntibak Belgesini İndir (PDF)
          </Button>
        </Card>
      )}

      {/* Appeal Section */}
      {MOCK_RESULT.status === 'rejected' && (
        <Card className="p-6 border-l-4" style={{ borderLeftColor: '#C00000' }}>
          <h2 className="text-gray-900 mb-2">Sonuçtan Memnun Değil misiniz?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Değerlendirme sürecinde bir hata olduğunu düşünüyorsanız itiraz başvurusunda bulunabilirsiniz.
            İtirazlar sonuç ilanından itibaren 5 iş günü içerisinde yapılmalıdır.
          </p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <strong>Son İtiraz Tarihi:</strong> 6 Şubat 2025
            </div>
            <Button 
              onClick={onAppeal}
              style={{ backgroundColor: '#C00000' }}
            >
              İtiraz Et
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
