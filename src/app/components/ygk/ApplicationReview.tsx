import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import {
  CheckCircle2, XCircle, ArrowLeft, AlertTriangle,
  Building2, GraduationCap, Languages, ClipboardCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationReviewProps {
  applicationId: string;
  onBack: () => void;
  onScoreConfirmed: () => void;
}

type ReviewStep = 'eligibility' | 'conditions' | 'score';

interface EligibilityData {
  applicationId: string;
  studentFullName: string;
  studentTckn: string;
  currentInstitution?: string;
  currentDepartment?: string;
  targetDepartmentId: string;
  gpa: number;
  yksScore?: number;
  activeSemester?: number;
  targetSemester: number;
  preScreening: { isPassed: boolean; failedRules: string[] };
  ydyoDecision: string;
  language?: string;
  eligible: boolean;
  warnings: string[];
  fieldWarnings: Record<string, string>;
}

interface ConditionCheck {
  name: string;
  requirement: string;
  studentValue: string;
  met: boolean;
}

interface ConditionsData {
  applicationId: string;
  departmentId: string;
  hasConditions: boolean;
  conditions: ConditionCheck[];
  autoPass: boolean;
  allConditionsMet: boolean;
  message: string;
}

interface ScoreData {
  applicationId: string;
  yksScore: number;
  gpa: number;
  calculatedScore: number;
  formula: string;
}

const DEPT_NAMES: Record<string, string> = {
  'dept-computer-engineering': 'Bilgisayar Mühendisliği',
  'dept-ce': 'Bilgisayar Mühendisliği',
  'dept-electrical-engineering': 'Elektrik Mühendisliği',
  'dept-ee': 'Elektrik Mühendisliği',
  'dept-architecture': 'Mimarlık',
  'dept-civil': 'İnşaat Mühendisliği',
  'dept-mechanical': 'Makina Mühendisliği',
};

export function ApplicationReview({ applicationId, onBack, onScoreConfirmed }: ApplicationReviewProps) {
  const [step, setStep] = useState<ReviewStep>('eligibility');
  const [loading, setLoading] = useState(true);
  const [eligibilityData, setEligibilityData] = useState<EligibilityData | null>(null);
  const [conditionsData, setConditionsData] = useState<ConditionsData | null>(null);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [scoreError, setScoreError] = useState<string | null>(null);

  // Note field — shown only when negative decision clicked
  const [showNoteField, setShowNoteField] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'not-eligible' | 'conditions-not-met' | null>(null);

  const headers = () => {
    const user = localStorage.getItem('currentUser');
    return { 'x-mock-user': user ? JSON.parse(user).id : 'user-ygk-cmpe-1' };
  };

  useEffect(() => {
    initReview();
  }, [applicationId]);

  const initReview = async () => {
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/start-review`, {
        method: 'POST',
        headers: headers(),
      });
      const data = await loadEligibility();
      setEligibilityData(data);
    } catch {
      toast.error('Başvuru açılamadı');
    } finally {
      setLoading(false);
    }
  };

  const loadEligibility = async (): Promise<EligibilityData> => {
    const res = await fetch(`/api/ranking/${applicationId}/eligibility`, { headers: headers() });
    if (!res.ok) throw new Error('eligibility fetch failed');
    return res.json();
  };

  const loadConditions = async (): Promise<ConditionsData> => {
    const res = await fetch(`/api/ranking/${applicationId}/conditions`, { headers: headers() });
    if (!res.ok) throw new Error('conditions fetch failed');
    return res.json();
  };

  const loadScore = async (): Promise<ScoreData> => {
    const res = await fetch(`/api/ranking/${applicationId}/score`, { headers: headers() });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'score fetch failed');
    }
    return res.json();
  };

  // ── Eligibility Actions ──────────────────────────────────────────────────

  const handleEligibleContinue = async () => {
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/eligibility`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligible: true }),
      });

      const cond = await loadConditions();
      setConditionsData(cond);
      // Her iki durumda da conditions step'ini göster
      setStep('conditions');
    } catch (e: any) {
      toast.error('Hata: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNotEligibleClick = () => {
    setPendingDecision('not-eligible');
    setShowNoteField(true);
    setNote('');
    setNoteError(false);
  };

  const handleEligibilityConfirm = async () => {
    if (!note.trim()) {
      setNoteError(true);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/eligibility`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ eligible: false, note: note.trim() }),
      });
      toast.success('Başvuru uygun bulunmadı olarak işaretlendi');
      onBack();
    } catch {
      toast.error('Karar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  // ── Conditions Actions ───────────────────────────────────────────────────

  const saveConditionsMetAndGoToScore = async () => {
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/conditions`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditionsMet: true }),
      });
      await goToScore();
    } catch (e: any) {
      toast.error('Hata: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionsNotMetClick = () => {
    setPendingDecision('conditions-not-met');
    setShowNoteField(true);
    setNote('');
    setNoteError(false);
  };

  const handleConditionsConfirm = async () => {
    if (!note.trim()) {
      setNoteError(true);
      return;
    }
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/conditions`, {
        method: 'POST',
        headers: { ...headers(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ conditionsMet: false, note: note.trim() }),
      });
      toast.success('Başvuru işaretlendi');
      onBack();
    } catch {
      toast.error('Karar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const cancelNegativeDecision = () => {
    setShowNoteField(false);
    setPendingDecision(null);
    setNote('');
    setNoteError(false);
  };

  // ── Score Actions ────────────────────────────────────────────────────────

  const goToScore = async () => {
    try {
      const score = await loadScore();
      setScoreData(score);
      setScoreError(null);
      setStep('score');
    } catch (e: any) {
      if (e.message?.includes('431-CALC')) {
        setScoreError('Puan hesaplanamadı. (431-CALC) — YKS puanı eksik. Başvuru ÖİDB kuyruğuna iade edildi.');
        setStep('score');
      } else {
        toast.error('Puan verisi alınamadı');
      }
    }
  };

  const handleConfirmScore = async () => {
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/score/confirm`, {
        method: 'POST',
        headers: headers(),
      });
      toast.success('Puan onaylandı');
      onScoreConfirmed();
    } catch {
      toast.error('Puan onaylanamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = async () => {
    setLoading(true);
    try {
      await fetch(`/api/ranking/${applicationId}/score/invalidate`, {
        method: 'POST',
        headers: headers(),
      });
      toast.info('Puan geçersiz kılındı. Lütfen yeniden doğrulayın.');
      const data = await loadEligibility();
      setEligibilityData(data);
      setScoreData(null);
      setScoreError(null);
      setShowNoteField(false);
      setPendingDecision(null);
      setNote('');
      setStep('eligibility');
    } catch {
      toast.error('Geri dönüş yapılamadı');
    } finally {
      setLoading(false);
    }
  };

  // ── Render helpers ───────────────────────────────────────────────────────

  const stepDone = (s: ReviewStep) => {
    const order = ['eligibility', 'conditions', 'score'];
    return order.indexOf(s) < order.indexOf(step);
  };

  const stepActive = (s: ReviewStep) => step === s;

  if (loading && !eligibilityData) {
    return <Card className="p-8 text-center text-gray-500">Yükleniyor...</Card>;
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-gray-900">Bireysel Başvuru İncelemesi</h2>
          <p className="text-sm text-gray-500 mt-0.5">Başvuru No: <span className="font-mono">{applicationId}</span></p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kuyruğa Dön
        </Button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {(['eligibility', 'conditions', 'score'] as ReviewStep[]).map((s, i) => {
          const labels = ['Akademik Uygunluk', 'Bölüm Koşulları', 'Puan Hesaplama'];
          const done = stepDone(s);
          const active = stepActive(s);
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-gray-300" />}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm
                ${active ? 'bg-[#7A1616] text-white' : done ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                {done
                  ? <CheckCircle2 className="w-4 h-4" />
                  : <span className="w-4 h-4 flex items-center justify-center font-bold">{i + 1}</span>
                }
                {labels[i]}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: AKADEMİK UYGUNLUK ─────────────────────────────────────── */}
      {step === 'eligibility' && eligibilityData && (
        <Card className="p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-base">Akademik Uygunluk Ekranı</h3>

          {/* Öğrenci bilgileri — tek view */}
          <div className="grid grid-cols-2 gap-4">

            {/* Kurum */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <Building2 className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Mevcut Kurum / Bölüm</div>
                <div className="text-sm text-gray-900">{eligibilityData.currentInstitution || '—'}</div>
                <div className="text-xs text-gray-600">{eligibilityData.currentDepartment || '—'}</div>
              </div>
            </div>

            {/* Hedef bölüm */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Hedef Bölüm / Dönem</div>
                <div className="text-sm text-gray-900">
                  {DEPT_NAMES[eligibilityData.targetDepartmentId] || eligibilityData.targetDepartmentId}
                </div>
                <div className="text-xs text-gray-600">{eligibilityData.targetSemester}. Dönem</div>
              </div>
            </div>

            {/* GPA */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">GPA (Not Ortalaması)</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{eligibilityData.gpa.toFixed(2)}</span>
                {eligibilityData.fieldWarnings?.gpa
                  ? <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {eligibilityData.fieldWarnings.gpa}
                    </Badge>
                  : <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Min. 2.50 ✓
                    </Badge>
                }
              </div>
            </div>

            {/* Aktif dönem */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Aktif Dönem</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gray-900">{eligibilityData.activeSemester ?? '—'}</span>
                {eligibilityData.fieldWarnings?.semester
                  ? <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {eligibilityData.fieldWarnings.semester}
                    </Badge>
                  : <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      3. veya 5. ✓
                    </Badge>
                }
              </div>
            </div>

            {/* Ön değerlendirme */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Ön Değerlendirme (Pre-Screening)</div>
              {eligibilityData.preScreening.isPassed
                ? <Badge className="bg-green-100 text-green-700 border-green-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Geçti
                  </Badge>
                : <Badge className="bg-red-100 text-red-700 border-red-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Başarısız
                  </Badge>
              }
              {eligibilityData.preScreening.failedRules.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {eligibilityData.preScreening.failedRules.join(', ')}
                </div>
              )}
            </div>

            {/* YDYO kararı */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">YDYO Dil Kararı</div>
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-gray-400" />
                {eligibilityData.ydyoDecision === 'EXEMPT'
                  ? <Badge className="bg-blue-100 text-blue-700 border-blue-200">Muaf</Badge>
                  : <Badge variant="outline">Değerlendirme Gerekli</Badge>
                }
                {eligibilityData.language && (
                  <span className="text-xs text-gray-500">{eligibilityData.language}</span>
                )}
              </div>
            </div>

          </div>

          {/* Note alanı — sadece "Uygun Değil" tıklandıktan sonra görünür */}
          {showNoteField && pendingDecision === 'not-eligible' && (
            <div className="space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800">
                Uygun bulunmama gerekçesi <span className="text-red-600">*</span>
              </div>
              <Textarea
                autoFocus
                rows={3}
                value={note}
                onChange={(e) => { setNote(e.target.value); setNoteError(false); }}
                placeholder="Uygun bulunmama sebebini açıklayınız..."
                className={noteError ? 'border-red-500 focus:ring-red-500' : ''}
              />
              {noteError && (
                <p className="text-xs text-red-600">Devam etmek için not girmelisiniz.</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={cancelNegativeDecision}>İptal</Button>
                <Button size="sm" variant="destructive" onClick={handleEligibilityConfirm} disabled={loading}>
                  Onayla
                </Button>
              </div>
            </div>
          )}

          {/* Karar butonları — note alanı açıkken gizle */}
          {!showNoteField && (
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={handleNotEligibleClick} disabled={loading}>
                <XCircle className="w-4 h-4 mr-2" />
                Uygun Değil
              </Button>
              <Button
                onClick={handleEligibleContinue}
                disabled={loading || !eligibilityData.eligible}
                title={!eligibilityData.eligible ? 'Uygunluk kriterleri karşılanmıyor' : undefined}
                style={eligibilityData.eligible ? { backgroundColor: '#7A1616' } : {}}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Uygun — Devam Et
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* ── STEP 2: BÖLÜM KOŞULLARI ───────────────────────────────────────── */}
      {step === 'conditions' && conditionsData && (
        <Card className="p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-base">Bölüm Koşulları Ekranı</h3>

          {conditionsData.autoPass ? (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              <span className="text-sm text-blue-800">Bölüm koşulu yok — devam ediliyor.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">
                {DEPT_NAMES[conditionsData.departmentId] || conditionsData.departmentId} — Bölüm Gereksinimleri
              </div>
              {conditionsData.conditions.map((c, i) => (
                <div key={i} className={`flex items-start justify-between p-4 rounded-lg border
                  ${c.met ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Gereksinim: <strong>{c.requirement}</strong> — Öğrenci: <strong>{c.studentValue}</strong>
                    </div>
                    {!c.met && (
                      <div className="text-xs text-red-700 mt-1">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {c.studentValue === 'Yüklenmemiş'
                          ? 'Belge yüklenmemiş'
                          : `Gereksinim karşılanmıyor — minimum ${c.requirement} gerekli`}
                      </div>
                    )}
                  </div>
                  <Badge className={c.met
                    ? 'bg-green-100 text-green-800 border-green-200 shrink-0'
                    : 'bg-red-100 text-red-800 border-red-200 shrink-0'}>
                    {c.met
                      ? <><CheckCircle2 className="w-3 h-3 mr-1" />Karşılandı</>
                      : <><XCircle className="w-3 h-3 mr-1" />Karşılanmadı</>}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Not alanı — "Karşılamıyor" tıklandıktan sonra */}
          {showNoteField && pendingDecision === 'conditions-not-met' && (
            <div className="space-y-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-800">
                Zorunlu not <span className="text-red-600">*</span>
              </div>
              <Textarea
                autoFocus
                rows={3}
                value={note}
                onChange={(e) => { setNote(e.target.value); setNoteError(false); }}
                placeholder="Koşulların karşılanmama gerekçesini giriniz..."
                className={noteError ? 'border-red-500' : ''}
              />
              {noteError && (
                <p className="text-xs text-red-600">Devam etmek için not girmelisiniz.</p>
              )}
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="ghost" size="sm" onClick={cancelNegativeDecision}>İptal</Button>
                <Button size="sm" variant="destructive" onClick={handleConditionsConfirm} disabled={loading}>
                  Onayla
                </Button>
              </div>
            </div>
          )}

          {!showNoteField && (
            <div className="flex justify-end gap-3 pt-2 border-t">
              {/* Auto-pass → tek buton: puan hesaplamaya geç */}
              {conditionsData.autoPass ? (
                <Button
                  onClick={saveConditionsMetAndGoToScore}
                  disabled={loading}
                  style={{ backgroundColor: '#7A1616' }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Puan Hesaplamaya Geç
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleConditionsNotMetClick} disabled={loading}>
                    <XCircle className="w-4 h-4 mr-2" />
                    Koşulları Karşılamıyor
                  </Button>
                  <Button
                    onClick={saveConditionsMetAndGoToScore}
                    disabled={loading}
                    style={{ backgroundColor: '#7A1616' }}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Koşulları Karşılıyor — Devam Et
                  </Button>
                </>
              )}
            </div>
          )}
        </Card>
      )}

      {/* ── STEP 3: PUAN HESAPLAMA ─────────────────────────────────────────── */}
      {step === 'score' && (
        <Card className="p-6 space-y-6">
          <h3 className="font-semibold text-gray-900 text-base">Puan Hesaplama Ekranı</h3>

          {scoreError ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-red-800 mb-1">Puan Hesaplama Hatası</div>
                  <div className="text-sm text-red-700">{scoreError}</div>
                </div>
              </div>
            </div>
          ) : scoreData && (
            <>
              {/* Formül */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Hesaplama Formülü (SDD Scenario 5)</div>
                <code className="text-sm text-gray-800">{scoreData.formula}</code>
              </div>

              {/* Değerler */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-xs text-gray-500 mb-1">YKS Puanı</div>
                  <div className="text-3xl font-bold text-gray-900">{scoreData.yksScore}</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="text-xs text-gray-500 mb-1">GPA</div>
                  <div className="text-3xl font-bold text-gray-900">{scoreData.gpa.toFixed(2)}</div>
                </div>
                <div className="p-4 border-2 rounded-lg text-center" style={{ borderColor: '#7A1616', backgroundColor: '#fdf2f2' }}>
                  <div className="text-xs mb-1" style={{ color: '#7A1616' }}>Transfer Puanı</div>
                  <div className="text-3xl font-bold" style={{ color: '#7A1616' }}>
                    {scoreData.calculatedScore.toFixed(5)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Button variant="outline" onClick={handleGoBack} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri Dön / Veriyi Düzelt
                </Button>
                <Button
                  onClick={handleConfirmScore}
                  disabled={loading}
                  style={{ backgroundColor: '#7A1616' }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Puanı Onayla
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
