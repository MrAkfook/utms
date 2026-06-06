import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowLeft,
  Loader2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { getApplication, type ApplicationDetailDto } from '../../lib/api/document-upload';

interface ApplicationTimelineProps {
  applicationId: string;
  userId: string;
  onBack: () => void;
}

// ─── Status rank ──────────────────────────────────────────────────────────────
// Higher = further along in the process. Used to determine completed/active/pending.

const STATUS_RANK: Record<string, number> = {
  DRAFT: 0,
  PENDING_DOCUMENT_UPLOAD: 1,
  RETURNED_FOR_CORRECTION: 2,
  PENDING_OIDB_VERIFICATION: 3,
  INTAKE_VERIFIED: 4,
  REJECTED_AT_INTAKE: 4,
  PENDING_YGK_FORWARDING: 5,
  IN_REVIEW_YDYO: 6,
  IN_REVIEW_YGK: 7,
  RANKED_ASIL: 8,
  RANKED_YEDEK: 8,
  RANKED_RED: 8,
  RESULTS_PUBLISHED: 9,
};

function rank(status: string): number {
  return STATUS_RANK[status] ?? 0;
}

// ─── Step types ───────────────────────────────────────────────────────────────

type StepStatus = 'completed' | 'active' | 'pending' | 'skipped';

interface TimelineStep {
  id: string;
  title: string;
  description: string;
  status: StepStatus;
  timestamp?: string;
  actor?: string;
  notes?: string;
}

// ─── Derive steps from application data ───────────────────────────────────────

function deriveSteps(app: ApplicationDetailDto): TimelineStep[] {
  const r = rank(app.currentStatus);
  const fmt = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }) : undefined;

  const isRejected =
    app.currentStatus === 'REJECTED_AT_INTAKE' || app.currentStatus === 'RANKED_RED';
  const isRanked = ['RANKED_ASIL', 'RANKED_YEDEK', 'RANKED_RED'].includes(app.currentStatus);

  const steps: TimelineStep[] = [];

  // 1 — Application submitted
  steps.push({
    id: 'submitted',
    title: 'Başvuru Oluşturuldu',
    description: 'Transfer başvurunuz sisteme kaydedildi',
    status: 'completed',
    timestamp: fmt(app.submittedAt),
  });

  // 2 — Document upload
  const docCompleted = r >= rank('PENDING_OIDB_VERIFICATION');
  const docActive =
    app.currentStatus === 'PENDING_DOCUMENT_UPLOAD' ||
    app.currentStatus === 'RETURNED_FOR_CORRECTION';
  steps.push({
    id: 'documents',
    title: 'Belge Yükleme',
    description: 'Gerekli belgelerinizi sisteme yükleyiniz',
    status: docCompleted ? 'completed' : docActive ? 'active' : 'pending',
    notes:
      app.currentStatus === 'RETURNED_FOR_CORRECTION'
        ? 'Belgelerinizde eksiklik tespit edildi. Lütfen düzeltiniz.'
        : undefined,
  });

  // 3 — OIDB intake review
  const oidbCompleted = r >= rank('INTAKE_VERIFIED');
  const oidbActive = app.currentStatus === 'PENDING_OIDB_VERIFICATION';
  const oidbRejected = app.currentStatus === 'REJECTED_AT_INTAKE';
  let oidbNotes: string | undefined;
  if (oidbRejected && app.rejectionReason) oidbNotes = `Red gerekçesi: ${app.rejectionReason}`;
  else if (Array.isArray(app.correctionReasons) && app.correctionReasons.length > 0)
    oidbNotes = `Düzeltme talepleri: ${(app.correctionReasons as string[]).join(', ')}`;
  steps.push({
    id: 'oidb',
    title: 'ÖİDB Ön İnceleme',
    description: 'Öğrenci İşleri Daire Başkanlığı belgelerinizi doğruluyor',
    status: oidbRejected ? 'completed' : oidbCompleted ? 'completed' : oidbActive ? 'active' : 'pending',
    timestamp: fmt(app.intakeVerifiedAt),
    actor: app.intakeVerifiedBy ? `Personel ID: ${app.intakeVerifiedBy}` : undefined,
    notes: oidbNotes,
  });

  // Early exit branch — rejected at intake
  if (oidbRejected) {
    steps.push({
      id: 'rejected',
      title: 'Başvuru Reddedildi',
      description: app.rejectionReason ?? 'Başvurunuz ÖİDB aşamasında reddedildi.',
      status: 'active',
    });
    return steps;
  }

  // 4 — YDYO language review (conditional)
  if (app.routedToYdyo || app.ydyoExempt) {
    const ydyoCompleted = r >= rank('IN_REVIEW_YGK');
    const ydyoActive = app.currentStatus === 'IN_REVIEW_YDYO';
    steps.push({
      id: 'ydyo',
      title: 'YDYO Dil Yeterlilik İncelemesi',
      description: app.ydyoExempt
        ? 'Dil yeterliliği muafiyet kapsamında değerlendirildi'
        : 'Yabancı Diller Yüksekokulu dil yeterliliğinizi inceliyor',
      status: app.ydyoExempt && r >= rank('PENDING_YGK_FORWARDING')
        ? 'completed'
        : ydyoCompleted ? 'completed' : ydyoActive ? 'active' : 'pending',
      notes: app.ydyoExempt ? 'Dil yeterlilik muafiyeti tanındı.' : undefined,
    });
  }

  // 5 — YGK academic review
  const ygkCompleted = r >= rank('RANKED_ASIL');
  const ygkActive =
    app.currentStatus === 'IN_REVIEW_YGK' || app.currentStatus === 'PENDING_YGK_FORWARDING';
  steps.push({
    id: 'ygk',
    title: 'YGK Akademik Değerlendirme',
    description: 'Bölüm komisyonu akademik uygunluğunuzu ve sıralamanızı belirliyor',
    status: ygkCompleted ? 'completed' : ygkActive ? 'active' : 'pending',
  });

  // 6 — Ranking result
  steps.push({
    id: 'ranking',
    title: 'Sıralama Sonucu',
    description: 'Kontenjan ve puan sıralamasına göre yerleştirme sonucu',
    status: isRanked ? 'completed' : r >= rank('RANKED_ASIL') ? 'completed' : 'pending',
    notes: app.rankingCategory
      ? `Kategori: ${
          app.rankingCategory === 'ASIL'
            ? 'Asil'
            : app.rankingCategory === 'YEDEK'
            ? 'Yedek'
            : 'Red'
        }`
      : undefined,
  });

  // 7 — Dean's office review (conditional)
  if (app.routedToDeansOffice) {
    const deanCompleted = r >= rank('RESULTS_PUBLISHED');
    const deanActive = isRanked && !deanCompleted;
    steps.push({
      id: 'dean',
      title: 'Dekanlık İncelemesi',
      description: 'Fakülte dekanlığı değerlendirme paketini inceliyor',
      status: deanCompleted ? 'completed' : deanActive ? 'active' : 'pending',
    });
  }

  // 8 — Results published
  steps.push({
    id: 'results',
    title: 'Sonuçların İlanı',
    description: 'Nihai transfer kabulü sonuçları ilan edildi',
    status: app.currentStatus === 'RESULTS_PUBLISHED' ? 'completed' : isRejected ? 'skipped' : 'pending',
  });

  return steps;
}

// ─── Current status label ─────────────────────────────────────────────────────

function statusLabel(status: string): { label: string; className: string } {
  const map: Record<string, { label: string; className: string }> = {
    PENDING_DOCUMENT_UPLOAD: { label: 'Belge Bekleniyor', className: 'bg-blue-100 text-blue-800' },
    RETURNED_FOR_CORRECTION: { label: 'Düzeltme İstendi', className: 'bg-orange-100 text-orange-800' },
    PENDING_OIDB_VERIFICATION: { label: 'ÖİDB İncelemesinde', className: 'bg-yellow-100 text-yellow-800' },
    INTAKE_VERIFIED: { label: 'ÖİDB Onaylandı', className: 'bg-green-100 text-green-800' },
    REJECTED_AT_INTAKE: { label: 'ÖİDB Reddetti', className: 'bg-red-100 text-red-800' },
    PENDING_YGK_FORWARDING: { label: 'YGK\'ya İletiliyor', className: 'bg-yellow-100 text-yellow-800' },
    IN_REVIEW_YDYO: { label: 'YDYO İncelemesinde', className: 'bg-yellow-100 text-yellow-800' },
    IN_REVIEW_YGK: { label: 'YGK İncelemesinde', className: 'bg-yellow-100 text-yellow-800' },
    RANKED_ASIL: { label: 'Asil Liste', className: 'bg-green-100 text-green-800' },
    RANKED_YEDEK: { label: 'Yedek Liste', className: 'bg-teal-100 text-teal-800' },
    RANKED_RED: { label: 'Reddedildi', className: 'bg-red-100 text-red-800' },
    RESULTS_PUBLISHED: { label: 'Sonuçlandı', className: 'bg-green-100 text-green-800' },
  };
  return map[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApplicationTimeline({ applicationId, userId, onBack }: ApplicationTimelineProps) {
  const [app, setApp] = useState<ApplicationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getApplication(applicationId, userId)
      .then(setApp)
      .catch((e) => setError(e instanceof Error ? e.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  }, [applicationId, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Başvuru bilgileri yükleniyor...
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {error ?? 'Başvuru bulunamadı.'}
      </div>
    );
  }

  const steps = deriveSteps(app);
  const { label, className } = statusLabel(app.currentStatus);
  const activeStep = steps.find((s) => s.status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Başvuru Süreç Takibi</h1>
          <p className="text-gray-600 font-mono text-sm">ID: {applicationId}</p>
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
            <h2 className="text-gray-900">{activeStep?.title ?? label}</h2>
            <p className="text-sm text-gray-600 mt-1">{activeStep?.description ?? ''}</p>
          </div>
          <Badge className={className}>{label}</Badge>
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-gray-900 mb-6">Başvuru İlerleme Durumu</h2>
        <div className="space-y-6">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            return (
              <div key={step.id} className="flex">
                {/* Icon + connector line */}
                <div className="flex flex-col items-center mr-4">
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
                    {step.status === 'skipped' && (
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-red-400" />
                      </div>
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 h-full mt-2 ${
                        step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                      }`}
                      style={{ minHeight: '40px' }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h3
                        className={
                          step.status === 'pending' || step.status === 'skipped'
                            ? 'text-gray-400'
                            : 'text-gray-900'
                        }
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm ${
                          step.status === 'pending' || step.status === 'skipped'
                            ? 'text-gray-400'
                            : 'text-gray-600'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                    {step.timestamp && (
                      <div className="text-xs text-gray-500 shrink-0 ml-4">{step.timestamp}</div>
                    )}
                  </div>

                  {step.actor && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="text-gray-600">İşlem Yapan:</span> {step.actor}
                    </div>
                  )}

                  {step.notes && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-900">{step.notes}</div>
                    </div>
                  )}

                  {step.status === 'active' && (
                    <div className="mt-2 flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                      <span className="text-xs text-yellow-700">Şu an işleniyor</span>
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
            <div className="text-gray-900">{app.targetDepartmentId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Hedef Fakülte</div>
            <div className="text-gray-900">{app.targetFacultyId}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Transfer Türü</div>
            <div className="text-gray-900">{app.transferType}</div>
          </div>
          {app.targetedSemester && (
            <div>
              <div className="text-sm text-gray-600">Hedef Dönem</div>
              <div className="text-gray-900">{app.targetedSemester}. Dönem</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">GNO (GPA)</div>
            <div className="text-gray-900">{app.submittedGpa.toFixed(2)} / 4.00</div>
          </div>
          {app.submittedYksScore && (
            <div>
              <div className="text-sm text-gray-600">ÖSYM Puanı</div>
              <div className="text-gray-900">
                {app.submittedYksScore.toFixed(2)}{app.yksExamYear ? ` (${app.yksExamYear})` : ''}
              </div>
            </div>
          )}
          {app.currentInstitution && (
            <div>
              <div className="text-sm text-gray-600">Mevcut Kurum</div>
              <div className="text-gray-900">{app.currentInstitution}</div>
            </div>
          )}
          {app.currentDepartment && (
            <div>
              <div className="text-sm text-gray-600">Mevcut Bölüm</div>
              <div className="text-gray-900">{app.currentDepartment}</div>
            </div>
          )}
          <div>
            <div className="text-sm text-gray-600">Başvuru Tarihi</div>
            <div className="text-gray-900">
              {new Date(app.submittedAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Son Güncelleme</div>
            <div className="text-gray-900">
              {new Date(app.lastModifiedAt).toLocaleString('tr-TR', { dateStyle: 'medium', timeStyle: 'short' })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
