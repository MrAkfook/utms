import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Eye,
  ZoomIn,
  ZoomOut,
  Download
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { toast } from 'sonner';

interface IntakeVerificationProps {
  applicationId: string;
  onBack: () => void;
}

export function IntakeVerification({ applicationId, onBack }: IntakeVerificationProps) {
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [returnReasons, setReturnReasons] = useState<string[]>([]);
  const [officerComment, setOfficerComment] = useState('');

  // Mock application data with high precision scores
  const appData = {
    id: applicationId,
    student: {
      name: 'Ahmet Yılmaz',
      tckn: '12345678901',
      studentId: '2021234567',
      email: 'ahmet.yilmaz@student.edu.tr'
    },
    application: {
      targetProgram: 'Computer Engineering',
      targetSemester: '3',
      gpa: '3.45000',
      osymScore: '485.50000',
      osymYear: '2024',
      currentUniversity: 'Istanbul Technical University',
      currentProgram: 'Industrial Engineering'
    },
    documents: [
      { id: 'transcript', name: 'Resmi Transkript', status: 'verified', size: '2.4 MB', edevlet: 'Verified' },
      { id: 'osym', name: 'ÖSYM Sonuç Belgesi', status: 'verified', size: '1.8 MB', edevlet: 'Verified' },
      { id: 'curriculum', name: 'Ders Planı (Müfredat)', status: 'verified', size: '3.2 MB', edevlet: 'Manual Check Required' },
      { id: 'certificate', name: 'Öğrenci Belgesi', status: 'verified', size: '1.2 MB', edevlet: 'Verified' },
      { id: 'language', name: 'Dil Yeterlilik Belgesi', status: 'manual_check', size: '2.1 MB', edevlet: 'Manual Check Required' },
      { id: 'course_contents', name: 'Ders İçerikleri', status: 'verified', size: '5.6 MB', edevlet: 'Invalid' }
    ],
    submittedDate: '2025-01-10 14:30'
  };

  const [selectedDoc, setSelectedDoc] = useState<any>(appData.documents[0]);

  const returnReasonOptions = [
    'Eksik transkript',
    'Geçersiz ÖSYM belgesi',
    'Eksik imzalı belgeler',
    'Yanlış müfredat versiyonu',
    'Düşük kaliteli belge taraması',
    'GNO minimum gereksinimin altında',
    'Geçersiz öğrenci belgesi',
    'Eksik ders içerikleri'
  ];

  const handleVerify = () => {
    setShowVerifyModal(true);
  };

  const handleConfirmVerify = () => {
    toast.success('Başvuru başarıyla doğrulandı ve YDYO\'ya iletildi.');
    setShowVerifyModal(false);
    onBack();
  };

  const handleReturn = () => {
    if (returnReasons.length > 0) {
      toast.info('Başvuru düzeltme için öğrenciye iade edildi.');
      setShowReturnModal(false);
      onBack();
    }
  };

  const handleReject = () => {
    if (officerComment.trim()) {
      toast.error('Başvuru reddedildi.');
      setShowRejectModal(false);
      onBack();
    }
  };

  const toggleReturnReason = (reason: string) => {
    if (returnReasons.includes(reason)) {
      setReturnReasons(returnReasons.filter(r => r !== reason));
    } else {
      setReturnReasons([...returnReasons, reason]);
    }
  };

  const getEDevletBadge = (status: string) => {
    switch (status) {
      case 'Verified':
        return <Badge className="bg-green-600 hover:bg-green-700 text-white border-none text-[10px]">e-Devlet: Doğrulandı</Badge>;
      case 'Manual Check Required':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none text-[10px]">e-Devlet: Manuel Kontrol</Badge>;
      case 'Invalid':
        return <Badge className="bg-red-600 hover:bg-red-700 text-white border-none text-[10px]">e-Devlet: Geçersiz</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b shrink-0">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Başvuru Ön İnceleme ve Doğrulama</h1>
            <p className="text-xs text-gray-500">ID: {applicationId} • Öğrenci: {appData.student.name}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowReturnModal(true)}
          >
            İade Et
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-600 hover:bg-red-50"
            onClick={() => setShowRejectModal(true)}
          >
            Reddet
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: '#C00000' }}
            onClick={handleVerify}
          >
            Doğrula ve İlet
          </Button>
        </div>
      </div>

      {/* Main Content Area: Side-by-Side */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Form Data */}
        <div className="w-1/2 overflow-y-auto p-4 border-r bg-gray-50">
          <div className="space-y-4">
            {/* Student Info Card */}
            <Card className="p-4">
              <h3 className="text-sm font-bold mb-3 border-b pb-1">Öğrenci Bilgileri</h3>
              <div className="grid grid-cols-2 gap-y-3 text-xs">
                <div>
                  <div className="text-gray-500">Ad Soyad</div>
                  <div className="font-medium">{appData.student.name}</div>
                </div>
                <div>
                  <div className="text-gray-500">TCKN</div>
                  <div className="font-medium text-[#C00000]">{appData.student.tckn.substring(0, 3) + "*****" + appData.student.tckn.substring(8)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Öğrenci No</div>
                  <div className="font-medium">{appData.student.studentId}</div>
                </div>
                <div>
                  <div className="text-gray-500">GNO (GPA)</div>
                  <div className="font-medium">{appData.application.gpa}</div>
                </div>
              </div>
            </Card>

            {/* Application Data Card */}
            <Card className="p-4">
              <h3 className="text-sm font-bold mb-3 border-b pb-1">Akademik Detaylar</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Mevcut Üniversite</span>
                  <span className="font-medium">{appData.application.currentUniversity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mevcut Program</span>
                  <span className="font-medium">{appData.application.currentProgram}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hedef Program</span>
                  <span className="font-medium font-bold text-blue-700">{appData.application.targetProgram}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-500">ÖSYM Puanı</span>
                  <span className="font-bold">{appData.application.osymScore}</span>
                </div>
              </div>
            </Card>

            {/* Document Checklist Card */}
            <Card className="p-4">
              <h3 className="text-sm font-bold mb-3 border-b pb-1">Belge Kontrol Listesi</h3>
              <div className="space-y-2">
                {appData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${selectedDoc?.id === doc.id ? 'border-[#C00000] bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <FileText className={`w-4 h-4 ${selectedDoc?.id === doc.id ? 'text-[#C00000]' : 'text-gray-400'}`} />
                        <span className="text-[11px] font-medium">{doc.name}</span>
                      </div>
                      {getEDevletBadge(doc.edevlet)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span>Boyut: {doc.size}</span>
                      <span className="flex items-center italic">
                        {doc.status === 'verified' ? <CheckCircle2 className="w-3 h-3 mr-1 text-green-600" /> : <AlertTriangle className="w-3 h-3 mr-1 text-yellow-600" />}
                        {doc.status === 'verified' ? 'Doğrulandı' : 'Manuel Kontrol'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Side: PDF Viewer Placeholder */}
        <div className="w-1/2 flex flex-col bg-gray-200">
          <div className="bg-gray-800 text-white p-2 text-xs flex justify-between items-center shrink-0">
            <span>Görüntülenen: {selectedDoc?.name || 'Belge seçilmedi'}</span>
            <div className="flex space-x-2">
              <Button variant="secondary" size="sm" className="h-6 text-[10px] py-0 px-2"><ZoomIn className="w-3 h-3 mr-1"/>Yakınlaştır</Button>
              <Button variant="secondary" size="sm" className="h-6 text-[10px] py-0 px-2"><ZoomOut className="w-3 h-3 mr-1"/>Uzaklaştır</Button>
              <Button variant="secondary" size="sm" className="h-6 text-[10px] py-0 px-2"><Download className="w-3 h-3 mr-1"/>İndir</Button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
            <div className="w-[595px] h-[842px] bg-white shadow-2xl flex flex-col p-12 shrink-0">
              <div className="border-b-2 border-gray-900 pb-4 mb-8 flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-serif font-bold uppercase">{selectedDoc?.name}</h1>
                  <p className="text-sm font-serif">Üniversite Transfer Başvuru Belgesi</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-serif font-bold">TARİH: 12/01/2025</p>
                  <p className="text-xs font-serif font-bold">DOĞRULAMA ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <div className="h-4 bg-gray-100 w-3/4"></div>
                <div className="h-4 bg-gray-100 w-1/2"></div>
                <div className="h-32 bg-gray-50 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-serif italic text-sm">
                  {selectedDoc?.name} için belge önizleme içeriği
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 w-full"></div>
                    <div className="h-3 bg-gray-100 w-full"></div>
                    <div className="h-3 bg-gray-100 w-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-100 w-full"></div>
                    <div className="h-3 bg-gray-100 w-full"></div>
                    <div className="h-3 bg-gray-100 w-full"></div>
                  </div>
                </div>
                <div className="mt-12 flex justify-end">
                  <div className="w-32 h-32 border-2 border-blue-900 rounded-full flex items-center justify-center border-double rotate-12">
                     <div className="text-center text-blue-900 font-bold text-[10px]">
                        e-DEVLET<br/>DOĞRULANDI<br/>{new Date().toLocaleDateString()}
                     </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-gray-200 text-[8px] text-gray-400 uppercase tracking-widest text-center">
                Bu belge güvenli bağlantı üzerinden merkezi üniversite yönetim sisteminden çekilmiştir.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu Doğrula?</DialogTitle>
            <DialogDescription>
              Doğrulamayı onaylamak bu başvuruyu iş akışındaki bir sonraki adıma iletecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Başvuru dil yeterlilik incelemesi için YDYO'ya iletilecektir.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowVerifyModal(false)}>
                İptal
              </Button>
              <Button 
                style={{ backgroundColor: '#C00000' }}
                onClick={handleConfirmVerify}
              >
                Doğrulamayı Onayla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReturnModal} onOpenChange={setShowReturnModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Düzeltme İçin İade Et</DialogTitle>
            <DialogDescription>
              Düzeltilmesi gereken konuları seçiniz. Öğrenciye bu maddeleri düzeltmesi için bildirim gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {returnReasonOptions.map((reason) => (
                <div key={reason} className="flex items-center space-x-2">
                  <Checkbox
                    id={reason}
                    checked={returnReasons.includes(reason)}
                    onCheckedChange={() => toggleReturnReason(reason)}
                  />
                  <Label htmlFor={reason} className="text-sm cursor-pointer">
                    {reason}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Ek Notlar (Opsiyonel)</Label>
              <Textarea
                id="comment"
                rows={3}
                placeholder="Öğrenci için ek detaylar sağlayın..."
                value={officerComment}
                onChange={(e) => setOfficerComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowReturnModal(false)}>
                İptal
              </Button>
              <Button 
                onClick={handleReturn}
                disabled={returnReasons.length === 0}
                style={{ backgroundColor: '#C00000' }}
              >
                Düzeltme İçin Geri Gönder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu Reddet?</DialogTitle>
            <DialogDescription>
              Bu işlem başvuruyu kalıcı olarak reddedecektir. Lütfen bir neden belirtiniz.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">Red Nedeni *</Label>
              <Textarea
                id="rejectReason"
                rows={4}
                placeholder="Red için detaylı neden belirtiniz..."
                value={officerComment}
                onChange={(e) => setOfficerComment(e.target.value)}
              />
            </div>

            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Bu işlem geri alınamaz. Öğrenciye red bildirimi gönderilecektir.
              </AlertDescription>
            </Alert>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                İptal
              </Button>
              <Button 
                variant="destructive"
                onClick={handleReject}
                disabled={!officerComment.trim()}
              >
                Reddi Onayla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
