import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  Circle,
  ArrowLeft
} from 'lucide-react';

interface ApplicationTimelineProps {
  applicationId: string;
  onBack: () => void;
}

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'pending';
  timestamp?: string;
  actor?: string;
  notes?: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 'submitted',
    title: 'Başvuru Gönderildi',
    description: 'Transfer başvurunuz başarıyla sisteme iletildi',
    status: 'completed',
    timestamp: '2025-01-10 14:30',
    actor: 'Ahmet Yılmaz (Öğrenci)'
  },
  {
    id: 'oidb_intake',
    title: 'ÖİDB Ön İnceleme',
    description: 'Öğrenci İşleri belgelerinizi doğruluyor',
    status: 'completed',
    timestamp: '2025-01-11 09:15',
    actor: 'Mehmet Demir (ÖİDB)',
    notes: 'Tüm belgeler doğrulandı. Başvuru YDYO\'ya iletildi.'
  },
  {
    id: 'ydyo_review',
    title: 'YDYO Dil Yeterlilik İncelemesi',
    description: 'Yabancı Diller Yüksekokulu dil muafiyetinizi değerlendiriyor',
    status: 'active',
    timestamp: '2025-01-12 10:00',
    actor: 'Ayşe Kaya (YDYO)',
    notes: 'Dil belgesi değerlendirme aşamasında.'
  },
  {
    id: 'ygk_academic',
    title: 'YGK Akademik Değerlendirme',
    description: 'Bölüm komisyonu akademik uygunluğunuzu inceleyecek',
    status: 'pending'
  },
  {
    id: 'ygk_ranking',
    title: 'YGK Sıralama',
    description: 'Diğer adaylarla birlikte puan sıralamasına alınacaksınız',
    status: 'pending'
  },
  {
    id: 'ygk_intibak',
    title: 'Ders Muafiyeti (İntibak)',
    description: 'Eşdeğer sayılacak dersleriniz belirlenecek',
    status: 'pending'
  },
  {
    id: 'dean_review',
    title: "Dekanlık İncelemesi",
    description: "Fakülte dekanlığı değerlendirme paketini onaylayacak",
    status: 'pending'
  },
  {
    id: 'board_approval',
    title: 'Fakülte Yönetim Kurulu Onayı',
    description: 'Yönetim kurulundan nihai onay süreci',
    status: 'pending'
  },
  {
    id: 'results_published',
    title: 'Sonuçların İlanı',
    description: 'Nihai sonuçlar sisteme yansıtılacak',
    status: 'pending'
  }
];

export function ApplicationTimeline({ applicationId, onBack }: ApplicationTimelineProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Başvuru Süreç Takibi</h1>
          <p className="text-gray-600">Başvuru ID: {applicationId}</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Geri Dön
        </Button>
      </div>

      {/* Current Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Mevcut Durum</div>
            <h2 className="text-gray-900">YDYO Dil Yeterlilik İncelemesi</h2>
            <p className="text-sm text-gray-600 mt-1">Dil yeterlilik belgeleriniz komisyon tarafından inceleniyor</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800">Devam Ediyor</Badge>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Başvuru İlerleme Durumu</h2>
        
        <div className="space-y-6">
          {TIMELINE_STEPS.map((step, index) => {
            const isLast = index === TIMELINE_STEPS.length - 1;
            
            return (
              <div key={step.id} className="flex">
                {/* Icon and Line */}
                <div className="flex flex-col items-center mr-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'completed' && (
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                      </div>
                    )}
                    {step.status === 'active' && (
                      <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                    )}
                    {step.status === 'pending' && (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Circle className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Connecting Line */}
                  {!isLast && (
                    <div className={`w-0.5 h-full mt-2 ${
                      step.status === 'completed' ? 'bg-green-600' : 'bg-gray-300'
                    }`} style={{ minHeight: '40px' }}></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={`${
                        step.status === 'pending' ? 'text-gray-500' : 'text-gray-900'
                      }`}>
                        {step.title}
                      </h3>
                      <p className={`text-sm ${
                        step.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                    {step.status !== 'pending' && (
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{step.timestamp}</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  {step.actor && (
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="text-gray-600">İşlem Yapan:</span> {step.actor}
                    </div>
                  )}

                  {step.notes && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-900">{step.notes}</div>
                    </div>
                  )}

                  {step.status === 'active' && (
                    <div className="mt-3 flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-600 animate-pulse"></div>
                        <span className="text-xs text-yellow-700">Şu an işleniyor</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Application Details */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-4">Başvuru Detayları</h2>
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
            <div className="text-sm text-gray-600">Mevcut GNO (GPA)</div>
            <div className="text-gray-900">3.45 / 4.00</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">ÖSYM Puanı</div>
            <div className="text-gray-900">485.5 (2024)</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Başvuru Tarihi</div>
            <div className="text-gray-900">10 Ocak 2025</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Beklenen Sonuç Tarihi</div>
            <div className="text-gray-900">1 Şubat 2025</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
