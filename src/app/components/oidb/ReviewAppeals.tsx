import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ArrowLeft, CheckCircle2, XCircle, Eye, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';

interface ReviewAppealsProps {
  onBack: () => void;
}

const MOCK_APPEALS = [
  {
    id: 'APPEAL-2025-001',
    applicationId: 'APP-2025-001240',
    studentName: 'Can Öztürk',
    program: 'Elektrik-Elektronik Mühendisliği',
    originalDecision: 'Reddedildi',
    appealDate: '2025-02-03',
    appealReason: 'GNO hesaplamasında bir hata olduğunu düşünüyorum. Resmi transkriptim 2.85 GNO göstermektedir, bu da 2.50 olan minimum gereksinimi karşılamaktadır. Ancak başvurum yetersiz GNO gerekçesiyle reddedildi. Doğrulama için güncel resmi transkriptimi ekledim.',
    status: 'pending',
    supportingDoc: true
  },
  {
    id: 'APPEAL-2025-002',
    applicationId: 'APP-2025-001245',
    studentName: 'Elif Yıldız',
    program: 'Bilgisayar Mühendisliği',
    originalDecision: 'Reddedildi',
    appealDate: '2025-02-04',
    appealReason: 'Değerlendirmede TOEFL belgem dikkate alınmamış. 88 puanlık geçerli bir TOEFL iBT sonucum var, bu da beni dil yeterlilik sınavından muaf tutmalı. Red mektubunda dil gereksinimlerinin karşılanmadığı belirtilmiş, ancak bunun bir gözden kaçırma olduğuna inanıyorum.',
    status: 'pending',
    supportingDoc: true
  },
  {
    id: 'APPEAL-2025-003',
    applicationId: 'APP-2025-001238',
    studentName: 'Burak Demir',
    program: 'Makine Mühendisliği',
    originalDecision: 'Yedek',
    appealDate: '2025-02-02',
    appealReason: 'Yedek listesine alındım ancak ders muafiyetlerimin (intibak) doğru değerlendirilmediğini düşünüyorum. Tamamladığım birkaç ders doğrudan müfredat gereksinimleriyle örtüşüyor ve daha yüksek bir sıralama puanı ile sonuçlanmalıydı.',
    status: 'approved',
    supportingDoc: false,
    reviewNote: 'İtiraz haklı bulundu. Ders muafiyetleri yeniden değerlendirildi. Öğrenci asil listeye taşındı.'
  }
];

export function ReviewAppeals({ onBack }: ReviewAppealsProps) {
  const [selectedAppeal, setSelectedAppeal] = useState<typeof MOCK_APPEALS[0] | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  const handleDecision = (appealId: string, dec: 'approve' | 'reject') => {
    const appeal = MOCK_APPEALS.find(a => a.id === appealId);
    if (appeal) {
      setSelectedAppeal(appeal);
      setDecision(dec);
      setShowDecisionModal(true);
    }
  };

  const submitDecision = () => {
    if (reviewNote.trim()) {
      setShowDecisionModal(false);
      setSelectedAppeal(null);
      setDecision(null);
      setReviewNote('');
    }
  };

  const pendingAppeals = MOCK_APPEALS.filter(a => a.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">İtirazları Değerlendir</h1>
          <p className="text-gray-600">{pendingAppeals.length} itiraz inceleme bekliyor</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Geri Dön
        </Button>
      </div>

      {/* Appeals List */}
      <div className="space-y-4">
        {MOCK_APPEALS.map((appeal) => (
          <Card key={appeal.id} className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-gray-900">{appeal.studentName}</h3>
                    {appeal.status === 'pending' && (
                      <Badge className="bg-yellow-100 text-yellow-800">İnceleme Bekliyor</Badge>
                    )}
                    {appeal.status === 'approved' && (
                      <Badge className="bg-green-100 text-green-800">Kabul Edildi</Badge>
                    )}
                    {appeal.status === 'rejected' && (
                      <Badge className="bg-red-100 text-red-800">Reddedildi</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">İtiraz ID</div>
                      <div className="text-gray-900">{appeal.id}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Başvuru ID</div>
                      <div className="text-gray-900">{appeal.applicationId}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Program</div>
                      <div className="text-gray-900">{appeal.program}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Orijinal Karar</div>
                      <div className="text-red-600">{appeal.originalDecision}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">İtiraz Tarihi</div>
                      <div className="text-gray-900">{appeal.appealDate}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Ek Belgeler</div>
                      <div className="text-gray-900">{appeal.supportingDoc ? 'Var' : 'Yok'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Appeal Reason */}
              <div>
                <div className="text-sm text-gray-600 mb-2">İtiraz Nedeni:</div>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-900">
                  {appeal.appealReason}
                </div>
              </div>

              {/* Supporting Document */}
              {appeal.supportingDoc && (
                <div>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Destekleyici Belgeyi Görüntüle
                  </Button>
                </div>
              )}

              {/* Review Note */}
              {appeal.status !== 'pending' && appeal.reviewNote && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Değerlendirme Notu:</div>
                  <div className="p-4 bg-blue-50 rounded-lg text-sm text-gray-900 border border-blue-200">
                    {appeal.reviewNote}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {appeal.status === 'pending' && (
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <Button 
                    size="sm"
                    variant="outline"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Orijinal Başvuruyu Gör
                  </Button>
                  <div className="flex-1"></div>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                    onClick={() => handleDecision(appeal.id, 'reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    İtirazı Reddet
                  </Button>
                  <Button 
                    size="sm"
                    style={{ backgroundColor: '#C00000' }}
                    onClick={() => handleDecision(appeal.id, 'approve')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    İtirazı Kabul Et
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Decision Modal */}
      <Dialog open={showDecisionModal} onOpenChange={setShowDecisionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {decision === 'approve' ? 'İtirazı Kabul Et' : 'İtirazı Reddet'}
            </DialogTitle>
            <DialogDescription>
              {selectedAppeal && (
                <>İtiraz ID: {selectedAppeal.id} - {selectedAppeal.studentName}</>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedAppeal && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">İtiraz Nedeni:</div>
                <div className="text-sm text-gray-900">{selectedAppeal.appealReason}</div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="reviewNote">
                Karar Notu *
              </Label>
              <Textarea
                id="reviewNote"
                rows={5}
                placeholder={
                  decision === 'approve' 
                    ? "İtirazın neden kabul edildiğini ve yapılan düzeltici işlemleri açıklayın..."
                    : "İtirazın neden reddedildiğini ve orijinal kararın gerekçelerini açıklayın..."
                }
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Bu not öğrenci ile paylaşılacak ve itiraz kaydına dahil edilecektir.
              </p>
            </div>

            {decision === 'approve' && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  İtirazın kabul edilmesi orijinal kararı geçersiz kılacaktır. Başvuru yeniden değerlendirilecek veya öğrenci kabul edilecektir.
                </AlertDescription>
              </Alert>
            )}

            {decision === 'reject' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  İtirazın reddedilmesi orijinal kararı koruyacaktır. Bu karar nidaidir ve tekrar itiraz edilemez.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDecisionModal(false);
                  setReviewNote('');
                }}
              >
                İptal
              </Button>
              <Button 
                onClick={submitDecision}
                disabled={!reviewNote.trim()}
                style={decision === 'approve' ? { backgroundColor: '#C00000' } : undefined}
                variant={decision === 'reject' ? 'destructive' : 'default'}
              >
                {decision === 'approve' ? 'Kabulü Onayla' : 'Reddi Onayla'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
