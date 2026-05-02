import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import {
  ArrowLeft,
  FileText,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Calendar,
  Award
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { CommentsPanel } from '../shared/CommentsPanel';
import { toast } from 'sonner';

interface LanguageReviewDetailProps {
  applicationId: string;
  onBack: () => void;
}

const MOCK_APPLICATION = {
  id: 'APP-2025-001234',
  studentName: 'Ahmet Yılmaz',
  studentId: '202012345',
  program: 'Bilgisayar Mühendisliği',
  faculty: 'Mühendislik Fakültesi',
  languageDoc: {
    type: 'TOEFL iBT',
    score: 88,
    examDate: '15/08/2024',
    validUntil: '15/08/2026',
    certificateNumber: 'TOEFL-2024-12345',
    documentUrl: '#'
  },
  submittedDate: '12/01/2025',
  currentStatus: 'pending'
};

const VALIDATION_RULES = {
  'TOEFL iBT': {
    minScore: 79,
    exemptScore: 90,
    validityPeriod: 'Sınav tarihinden itibaren 2 yıl'
  },
  'IELTS Academic': {
    minScore: 6.0,
    exemptScore: 7.0,
    validityPeriod: 'Sınav tarihinden itibaren 2 yıl'
  },
  'YDS': {
    minScore: 70,
    exemptScore: 85,
    validityPeriod: 'Sınav tarihinden itibaren 5 yıl'
  }
};

export function LanguageReviewDetail({ applicationId, onBack }: LanguageReviewDetailProps) {
  const [decision, setDecision] = useState<'successful' | 'unsuccessful' | 'exempt' | ''>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitDecision = () => {
    if (!decision) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      
      if (decision === 'successful') {
        toast.success('Dil değerlendirmesi başarıyla kaydedildi', {
          description: `${applicationId} nolu başvuru "Başarılı" olarak işaretlendi.`
        });
      } else if (decision === 'exempt') {
        toast.success('Dil değerlendirmesi başarıyla kaydedildi', {
          description: `${applicationId} nolu başvuru "Muaf" (+5 bonus puan) olarak işaretlendi.`
        });
      } else {
        toast.warning('Dil değerlendirmesi kaydedildi', {
          description: `${applicationId} nolu başvuru "Başarısız" olarak işaretlendi.`
        });
      }
      
      onBack();
    }, 1000);
  };

  const rules = VALIDATION_RULES[MOCK_APPLICATION.languageDoc.type as keyof typeof VALIDATION_RULES];
  const score = MOCK_APPLICATION.languageDoc.score;
  const meetsMinimum = score >= rules.minScore;
  const qualifiesForExemption = score >= rules.exemptScore;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Dil Yeterlilik Doğrulama Detayı</h1>
          <p className="text-gray-600">
            {MOCK_APPLICATION.id} - {MOCK_APPLICATION.studentName}
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kuyruğa Dön
        </Button>
      </div>

      {/* Validation Rules Banner */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-1">
            <div><strong>{MOCK_APPLICATION.languageDoc.type} için Dil Gereksinim Kuralları:</strong></div>
            <div className="text-sm">
              • Minimum Geçer Puan: <strong>{rules.minScore}</strong> {meetsMinimum ? '✓' : '✗'}
            </div>
            <div className="text-sm">
              • Muafiyet Eşiği: <strong>{rules.exemptScore}</strong> {qualifiesForExemption ? '✓' : '✗'}
            </div>
            <div className="text-sm">
              • Geçerlilik Süresi: {rules.validityPeriod}
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Student & Application Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Information */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4 font-medium">Öğrenci Bilgileri</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Öğrenci Adı</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.studentName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Öğrenci No</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.studentId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Hedef Program</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.program}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Fakülte</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.faculty}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Başvuru Tarihi</div>
                <div className="text-gray-900 flex items-center font-medium">
                  <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                  {MOCK_APPLICATION.submittedDate}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Mevcut Durum</div>
                <Badge className="bg-yellow-100 text-yellow-800">YDYO İncelemesi Bekliyor</Badge>
              </div>
            </div>
          </Card>

          {/* Language Document Details */}
          <Card className="p-6">
            <h2 className="text-gray-900 mb-4 font-medium">Dil Belgesi Detayları</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Sınav Türü</div>
                <div className="text-gray-900 font-bold">{MOCK_APPLICATION.languageDoc.type}</div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Beyan Edilen Puan</div>
                <div className="text-2xl text-gray-900 font-bold">{MOCK_APPLICATION.languageDoc.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Sınav Tarihi</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.languageDoc.examDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Geçerlilik Sonu</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.languageDoc.validUntil}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Sertifika No</div>
                <div className="text-gray-900 font-medium">{MOCK_APPLICATION.languageDoc.certificateNumber}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Sonuç Değerlendirmesi</div>
                <div className="space-y-1">
                  {meetsMinimum && (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Minimum gereksinimi karşılıyor
                    </div>
                  )}
                  {!meetsMinimum && (
                    <div className="flex items-center text-red-600 text-sm font-medium">
                      <XCircle className="w-4 h-4 mr-1" />
                      Minimum gereksinimin altında
                    </div>
                  )}
                  {qualifiesForExemption && (
                    <div className="flex items-center text-blue-600 text-sm font-medium">
                      <Award className="w-4 h-4 mr-1" />
                      Dil muafiyeti için uygun
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Document Viewer */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <div className="text-sm text-gray-900 mb-2 font-medium">Dil Yeterlilik Belgesi Dosyası</div>
              <div className="text-xs text-gray-500 mb-4">
                Öğrenci tarafından yüklenen resmi dil yeterlilik sertifikası
              </div>
              <div className="flex items-center justify-center space-x-3">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Belgeyi Görüntüle
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF Olarak İndir
                </Button>
              </div>
            </div>
          </Card>

          {/* Comments Section */}
          <CommentsPanel 
            applicationId={applicationId}
            currentUserRole="YDYO"
          />
        </div>

        {/* Right Panel - Decision Form */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-6">
            <h2 className="text-gray-900 mb-4 font-medium">Değerlendirme Kararı</h2>
            
            <div className="space-y-4">
              {/* Decision Radio Buttons */}
              <div className="space-y-3">
                <Label>Karar Seçiniz *</Label>
                <RadioGroup value={decision} onValueChange={(value: any) => setDecision(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-green-50 transition cursor-pointer">
                      <RadioGroupItem value="successful" id="successful" />
                      <Label htmlFor="successful" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <div>
                            <div className="text-sm text-gray-900 font-medium">Başarılı</div>
                            <div className="text-xs text-gray-500">
                              Minimum gereksinimi karşılıyor
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-red-50 transition cursor-pointer">
                      <RadioGroupItem value="unsuccessful" id="unsuccessful" />
                      <Label htmlFor="unsuccessful" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <div>
                            <div className="text-sm text-gray-900 font-medium">Başarısız / Geçersiz</div>
                            <div className="text-xs text-gray-500">
                              Gereksinimi karşılamıyor veya belge geçersiz
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-blue-50 transition cursor-pointer">
                      <RadioGroupItem value="exempt" id="exempt" />
                      <Label htmlFor="exempt" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <Award className="w-4 h-4 text-blue-600" />
                          <div>
                            <div className="text-sm text-gray-900 font-medium">Muaf</div>
                            <div className="text-xs text-gray-500">
                              Muafiyet kriterlerini sağlıyor (+5 bonus)
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Conditional Warning for Unsuccessful */}
              {decision === 'unsuccessful' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Lütfen belgenin neden başarısız veya geçersiz olduğunu açıklayan detaylı notlar ekleyiniz.
                  </AlertDescription>
                </Alert>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Değerlendirme Notları {decision === 'unsuccessful' && <span className="text-red-600">*</span>}
                </Label>
                <Textarea
                  id="notes"
                  rows={5}
                  placeholder="Dil belgesi değerlendirmesi hakkında detaylı notlar ekleyin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={decision === 'unsuccessful' && !notes ? 'border-red-300' : ''}
                />
                <p className="text-xs text-gray-500">
                  Bu notlar ÖİDB, YGK ve diğer incelemeciler tarafından görülebilecektir.
                </p>
              </div>

              {/* Automatic Score Calculation Info */}
              {decision === 'exempt' && (
                <Alert>
                  <Award className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Dil muafiyeti, öğrencinin transfer puanı hesaplamasına <strong>+5 bonus puan</strong> ekleyecektir.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={handleSubmitDecision}
                  disabled={!decision || (decision === 'unsuccessful' && !notes.trim()) || isSubmitting}
                  className="w-full"
                  style={{ backgroundColor: '#C00000' }}
                >
                  {isSubmitting ? 'Kaydediliyor...' : 'Değerlendirmeyi Gönder'}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={onBack}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  İptal
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Reference */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm text-gray-900 mb-2 font-medium">Hızlı Referans</div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• TOEFL iBT: 79-89 Geçer, ≥90 Muaf</div>
              <div>• IELTS: 6.0-6.9 Geçer, ≥7.0 Muaf</div>
              <div>• YDS: 70-84 Geçer, ≥85 Muaf</div>
              <div>• Tüm belgeler geçerlilik süresi içinde olmalıdır</div>
              <div>• Muafiyet +5 bonus puan kazandırır</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
