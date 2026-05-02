import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, Save, ArrowRight, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationFormProps {
  onSave: (data: any) => void;
  onCancel: () => void;
}

export function ApplicationForm({ onSave, onCancel }: ApplicationFormProps) {
  const [formData, setFormData] = useState({
    // Auto-filled from user profile
    name: '',
    surname: '',
    tckn: '',
    studentId: '',
    currentUniversity: '',
    currentProgram: '',
    
    // User inputs
    targetProgram: '',
    targetSemester: '',
    gpa: '',
    osymScore: '',
    osymYear: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDraft, setIsDraft] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [apiDown, setApiDown] = useState(false); // Mock API status

  // Simulate YÖKSİS/ÖSYM data fetch
  useEffect(() => {
    const fetchExternalData = async () => {
      setIsLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock API down scenario check
      const mockApiDown = false; // Change to true to simulate system down
      if (mockApiDown) {
        setApiDown(true);
        setIsLoading(false);
        return;
      }

      setFormData(prev => ({
        ...prev,
        name: 'Ahmet',
        surname: 'Yılmaz',
        tckn: '12345678901',
        studentId: '2021234567',
        currentUniversity: 'Istanbul Technical University',
        currentProgram: 'Industrial Engineering',
      }));
      setIsLoading(false);
      toast.success('Akademik veriler YÖKSİS/ÖSYM üzerinden başarıyla çekildi');
    };

    fetchExternalData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.targetProgram) {
      newErrors.targetProgram = 'Lütfen bir program seçiniz';
    }

    if (!formData.targetSemester) {
      newErrors.targetSemester = 'Lütfen bir dönem seçiniz';
    } else if (formData.targetSemester !== '3' && formData.targetSemester !== '5') {
      newErrors.targetSemester = 'Sadece 3. veya 5. dönem için başvuru yapılabilir';
    }

    if (!formData.gpa) {
      newErrors.gpa = 'GNO (GPA) gereklidir';
    } else {
      const gpaNum = parseFloat(formData.gpa);
      if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
        newErrors.gpa = 'GNO 0.00 ile 4.00 arasında olmalıdır';
      } else if (gpaNum < 2.50) {
        newErrors.gpa = 'Başvuru için minimum 2.50 GNO gereklidir';
      }
    }

    if (!formData.osymScore) {
      newErrors.osymScore = 'ÖSYM puanı gereklidir';
    } else {
      const score = parseFloat(formData.osymScore);
      if (isNaN(score) || score < 0 || score > 600) {
        newErrors.osymScore = 'Geçersiz ÖSYM puanı';
      }
    }

    if (!formData.osymYear) {
      newErrors.osymYear = 'ÖSYM sınav yılı gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    setIsDraft(true);
    onSave({ ...formData, status: 'draft' });
    toast.success('Taslak başarıyla kaydedildi');
  };

  const handleContinue = () => {
    if (validateForm()) {
      setIsDraft(false);
      onSave({ ...formData, status: 'in_progress' });
      toast.success('Bilgiler kaydedildi, belge yükleme ekranına geçiliyor');
    }
  };

  const isFormValid = () => {
    const gpaNum = parseFloat(formData.gpa);
    const isValidGpa = !isNaN(gpaNum) && gpaNum >= 2.50 && gpaNum <= 4.0;
    const isValidSemester = formData.targetSemester === '3' || formData.targetSemester === '5';
    const hasRequiredFields = formData.targetProgram && formData.osymScore && formData.osymYear;
    return isValidGpa && isValidSemester && hasRequiredFields && !apiDown;
  };

  if (apiDown) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive" className="p-8 flex flex-col items-center text-center">
          <AlertCircle className="h-12 w-12 mb-4" />
          <h2 className="text-xl font-bold mb-2">Sistem Kullanılamıyor</h2>
          <AlertDescription className="text-lg">
            Dış veri sistemleri (YÖKSİS/ÖSYM) şu anda çevrimdışı.
            Güvenlik nedeniyle manuel girişe izin verilmemektedir.
            Lütfen daha sonra tekrar deneyiniz.
          </AlertDescription>
          <Button variant="outline" onClick={onCancel} className="mt-6">
             <ArrowLeft className="w-4 h-4 mr-2" />
             Panele Dön
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 mb-2">Yeni Transfer Başvurusu Oluştur</h1>
        <p className="text-gray-600">Başvuru sürecini başlatmak için bilgilerinizi doldurunuz</p>
      </div>

      {/* Form */}
      <Card className="p-6">
        <form className="space-y-6">
          {/* Personal Information (Auto-filled) */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-[#C00000]" />
              </div>
            )}
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-gray-900">Kişisel Bilgiler</h2>
              {!isLoading && <div className="flex items-center text-xs text-green-600 font-medium"><CheckCircle2 className="w-3 h-3 mr-1" /> ÖSYM Tarafından Doğrulandı</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad</Label>
                <div className="relative">
                  <Input id="name" value={formData.name} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Soyad</Label>
                <div className="relative">
                  <Input id="surname" value={formData.surname} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tckn">T.C. Kimlik Numarası</Label>
                <div className="relative">
                  <Input id="tckn" value={formData.tckn.replace(/(\d{3})\d{5}(\d{3})/, '$1*****$2')} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="studentId">Öğrenci Numarası</Label>
                <div className="relative">
                  <Input id="studentId" value={formData.studentId} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
            </div>
          </div>

          {/* Current Academic Information */}
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-[#C00000]" />
              </div>
            )}
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h2 className="text-gray-900">Mevcut Akademik Bilgiler</h2>
              {!isLoading && <div className="flex items-center text-xs text-green-600 font-medium"><CheckCircle2 className="w-3 h-3 mr-1" /> YÖKSİS Tarafından Doğrulandı</div>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentUniversity">Mevcut Üniversite</Label>
                <div className="relative">
                  <Input id="currentUniversity" value={formData.currentUniversity} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentProgram">Mevcut Program</Label>
                <div className="relative">
                  <Input id="currentProgram" value={formData.currentProgram} readOnly className="bg-gray-50" />
                  {!isLoading && <CheckCircle2 className="absolute right-3 top-2.5 h-4 w-4 text-green-600" />}
                </div>
              </div>
            </div>
          </div>

          {/* Transfer Application Details */}
          <div>
            <h2 className="text-gray-900 mb-4 pb-2 border-b">Transfer Başvuru Detayları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetProgram">Hedef Program *</Label>
                <Select 
                  value={formData.targetProgram} 
                  onValueChange={(value) => setFormData({ ...formData, targetProgram: value })}
                >
                  <SelectTrigger id="targetProgram">
                    <SelectValue placeholder="Program seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer-eng">Bilgisayar Mühendisliği</SelectItem>
                    <SelectItem value="electrical-eng">Elektrik-Elektronik Mühendisliği</SelectItem>
                    <SelectItem value="mechanical-eng">Makine Mühendisliği</SelectItem>
                    <SelectItem value="industrial-eng">Endüstri Mühendisliği</SelectItem>
                    <SelectItem value="civil-eng">İnşaat Mühendisliği</SelectItem>
                    <SelectItem value="architecture">Mimarlık</SelectItem>
                  </SelectContent>
                </Select>
                {errors.targetProgram && (
                  <p className="text-xs text-red-600">{errors.targetProgram}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetSemester">Hedef Dönem *</Label>
                <Select 
                  value={formData.targetSemester} 
                  onValueChange={(value) => setFormData({ ...formData, targetSemester: value })}
                >
                  <SelectTrigger id="targetSemester">
                    <SelectValue placeholder="Dönem seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3. Dönem (2. Sınıf)</SelectItem>
                    <SelectItem value="5">5. Dönem (3. Sınıf)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.targetSemester && (
                  <p className="text-xs text-red-600">{errors.targetSemester}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa">Mevcut GNO (GPA - 4.00 üzerinden) *</Label>
                <Input 
                  id="gpa" 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="4"
                  placeholder="örneğin, 3.25"
                  value={formData.gpa}
                  onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                />
                {errors.gpa && (
                  <p className="text-xs text-red-600">{errors.gpa}</p>
                )}
                {formData.gpa && parseFloat(formData.gpa) >= 2.50 && parseFloat(formData.gpa) <= 4.0 && (
                  <p className="text-xs text-green-600">✓ GNO minimum gereksinimi karşılıyor</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="osymScore">ÖSYM Puanı *</Label>
                <Input 
                  id="osymScore" 
                  type="number" 
                  placeholder="örneğin, 485.5"
                  value={formData.osymScore}
                  onChange={(e) => setFormData({ ...formData, osymScore: e.target.value })}
                />
                {errors.osymScore && (
                  <p className="text-xs text-red-600">{errors.osymScore}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="osymYear">ÖSYM Sınav Yılı *</Label>
                <Select 
                  value={formData.osymYear} 
                  onValueChange={(value) => setFormData({ ...formData, osymYear: value })}
                >
                  <SelectTrigger id="osymYear">
                    <SelectValue placeholder="Yıl seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
                {errors.osymYear && (
                  <p className="text-xs text-red-600">{errors.osymYear}</p>
                )}
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Tüm bilgilerin doğru olduğundan emin olunuz. Bir sonraki adımda destekleyici belgeleri yüklemeniz gerekecektir.
              Transfer başvuruları için minimum 2.50 GNO gereklidir.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              İptal
            </Button>
            <div className="space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleSaveDraft}
                disabled={isLoading || !isFormValid()}
              >
                <Save className="w-4 h-4 mr-2" />
                Taslağı Kaydet
              </Button>
              <Button 
                type="button" 
                onClick={handleContinue}
                disabled={isLoading || !isFormValid()}
                style={{ backgroundColor: '#C00000' }}
                className={!isFormValid() ? 'opacity-50' : ''}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Kaydet ve Devam Et
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}
