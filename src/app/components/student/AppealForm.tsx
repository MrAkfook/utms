import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Upload, X, Send, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

interface AppealFormProps {
  applicationId: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AppealForm({ applicationId, onSubmit, onCancel }: AppealFormProps) {
  const [appealReason, setAppealReason] = useState('');
  const [supportingDoc, setSupportingDoc] = useState<File | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileUpload = (file: File) => {
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      setErrors({ ...errors, file: 'Dosya boyutu 10MB\'ı geçmemelidir' });
      return;
    }

    const fileExt = file.name.split('.').pop()?.toUpperCase();
    if (!fileExt || !['PDF', 'JPG', 'PNG', 'DOC', 'DOCX'].includes(fileExt)) {
      setErrors({ ...errors, file: 'Sadece PDF, JPG, PNG, DOC, DOCX dosyalarına izin verilir' });
      return;
    }

    setSupportingDoc(file);
    setErrors({ ...errors, file: '' });
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!appealReason.trim()) {
      newErrors.reason = 'Lütfen itiraz nedeninizi belirtiniz';
    } else if (appealReason.length < 50) {
      newErrors.reason = 'İtiraz nedeni en az 50 karakter olmalıdır';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setShowSuccessModal(true);
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    onSubmit();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">İtiraz Başvurusu</h1>
          <p className="text-gray-600">Başvuru ID: {applicationId}</p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sonuçlara Geri Dön
        </Button>
      </div>

      {/* Important Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>İtiraz Kılavuzu:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>İtirazlar sonuç ilanından itibaren 5 iş günü içerisinde yapılmalıdır</li>
            <li>İtiraz nedeninizi ve oluştuğunu düşündüğünüz hatayı net bir şekilde belirtiniz</li>
            <li>Varsa destekleyici belgeleri ekleyiniz</li>
            <li>İtirazlar ayrı bir komisyon tarafından değerlendirilir</li>
            <li>10 iş günü içerisinde yanıt alacaksınız</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Appeal Form */}
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-gray-900 mb-4">İtiraz Detayları</h2>
            
            {/* Application Summary */}
            <div className="p-4 bg-gray-50 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Hedef Program</div>
                  <div className="text-gray-900">Bilgisayar Mühendisliği</div>
                </div>
                <div>
                  <div className="text-gray-600">Karar</div>
                  <div className="text-red-600">Reddedildi</div>
                </div>
                <div>
                  <div className="text-gray-600">Karar Tarihi</div>
                  <div className="text-gray-900">1 Şubat 2025</div>
                </div>
                <div>
                  <div className="text-gray-600">İtiraz Son Tarihi</div>
                  <div className="text-gray-900">6 Şubat 2025</div>
                </div>
              </div>
            </div>

            {/* Appeal Reason */}
            <div className="space-y-2">
              <Label htmlFor="appealReason">
                İtiraz Nedeni *
                <span className="text-sm text-gray-500 ml-2">(Minimum 50 karakter)</span>
              </Label>
              <Textarea
                id="appealReason"
                rows={8}
                placeholder="Lütfen itiraz nedeninizi detaylıca açıklayınız. Değerlendirme sürecinde oluştuğunu düşündüğünüz spesifik hataları, dikkate alınmayan belgeleri veya diğer ilgili bilgileri belirtiniz."
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                className={errors.reason ? 'border-red-500' : ''}
              />
              <div className="flex justify-between">
                <div>
                  {errors.reason && (
                    <p className="text-xs text-red-600">{errors.reason}</p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {appealReason.length} karakter
                </p>
              </div>
            </div>

            {/* Supporting Document */}
            <div className="space-y-2">
              <Label htmlFor="supportingDoc">
                Destekleyici Belge (Opsiyonel)
              </Label>
              <p className="text-sm text-gray-600 mb-2">
                İtirazınızı destekleyen belgeleri yükleyin (örn. not düzeltmeleri, eksik sertifikalar)
              </p>
              
              {!supportingDoc ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    Dosyayı buraya sürükleyin veya seçmek için tıklayın
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PDF, JPG, PNG, DOC, DOCX • Maks 10MB
                  </p>
                  <label htmlFor="fileUpload">
                    <Button type="button" variant="outline" onClick={() => document.getElementById('fileUpload')?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Dosya Seç
                    </Button>
                  </label>
                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                  />
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded bg-blue-100 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-900">{supportingDoc.name}</div>
                        <div className="text-xs text-gray-500">
                          {(supportingDoc.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSupportingDoc(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {errors.file && (
                <p className="text-xs text-red-600">{errors.file}</p>
              )}
            </div>
          </div>

          {/* Important Note */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Lütfen Dikkat:</strong> Gönderildikten sonra itirazınız üzerinde değişiklik yapılamaz.
              Tüm bilgilerin doğru ve eksiksiz olduğundan emin olunuz.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmit}
              style={{ backgroundColor: '#C00000' }}
            >
              <Send className="w-4 h-4 mr-2" />
              İtirazı Gönder
            </Button>
          </div>
        </div>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Send className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">İtiraz Başarıyla Gönderildi!</DialogTitle>
            <DialogDescription className="text-center">
              <p className="mb-4">
                İtirazınız alınmıştır ve itiraz komisyonu tarafından değerlendirilecektir.
              </p>
              <div className="p-4 bg-gray-50 rounded-lg text-left text-sm space-y-2">
                <div>
                  <strong>İtiraz Referans Numarası:</strong> APPEAL-2025-001234
                </div>
                <div>
                  <strong>Gönderim Tarihi:</strong> {new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div>
                  <strong>Beklenen Yanıt Süresi:</strong> 10 iş günü içerisinde
                </div>
              </div>
              <p className="mt-4 text-xs text-gray-600">
                İtirazınız sonuçlandığında e-posta ile bilgilendirileceksiniz.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={handleModalClose} style={{ backgroundColor: '#C00000' }}>
              Panele Dön
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
