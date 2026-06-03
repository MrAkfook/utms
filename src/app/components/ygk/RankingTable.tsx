import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Award, CheckCircle, AlertTriangle, Zap, Info } from 'lucide-react';
import { toast } from 'sonner';

interface RankingTableProps {
  onBack: () => void;
}

interface RankingResult {
  rank: number;
  applicationId: string;
  studentTckn: string;
  studentFullName: string;
  gpa: number;
  yksScore: number | null;
  transferScore: number;
  category: string;
}

interface TieGroup {
  boundaryRank: number;
  applicationIds: string[];
}

interface RankingSummary {
  departmentId: string;
  periodId: string;
  quota: number;
  totalEvaluated: number;
  eligible: number;
  ineligible: number;
  asilCount: number;
  yedekCount: number;
  redCount: number;
  rankings: RankingResult[];
  hasTies: boolean;
  ties: TieGroup[];
}

const DEPT_OPTIONS = [
  { value: 'dept-computer-engineering', label: 'Bilgisayar Mühendisliği' },
  { value: 'dept-electrical-engineering', label: 'Elektrik Mühendisliği' },
  { value: 'dept-mechanical-engineering', label: 'Makina Mühendisliği' },
  { value: 'dept-civil', label: 'İnşaat Mühendisliği' },
  { value: 'dept-architecture', label: 'Mimarlık' },
];

const PERIOD_OPTIONS = [
  { value: 'period-ygk-scenarios-2026', label: 'Senaryo 2026 (Test)' },
  { value: 'period-spring-2026', label: 'Bahar 2026' },
  { value: 'period-fall-2025', label: 'Güz 2025' },
];

export function RankingTable({ onBack }: RankingTableProps) {
  const [deptId, setDeptId] = useState('dept-mechanical-engineering');
  const [periodId, setPeriodId] = useState('period-ygk-scenarios-2026');
  const [quota, setQuota] = useState<number | ''>('');
  const [yedekQuota, setYedekQuota] = useState<number | null>(null);
  const [quotaSource, setQuotaSource] = useState<'defined' | 'manual' | 'none'>('none');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<RankingSummary | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  // Tie-breaking state
  const [manualRanks, setManualRanks] = useState<Record<string, number>>({});

  const headers = () => {
    const user = localStorage.getItem('currentUser');
    return {
      'x-mock-user': user ? JSON.parse(user).id : 'user-ygk-chair-cmpe',
      'Content-Type': 'application/json',
    };
  };

  // Bölüm/dönem değişince kota sorgula
  useEffect(() => {
    fetchQuota();
  }, [deptId, periodId]);

  const fetchQuota = async () => {
    try {
      const res = await fetch(`/api/ranking/quota/${deptId}/${periodId}`, {
        headers: { 'x-mock-user': JSON.parse(localStorage.getItem('currentUser') || '{}').id || 'user-ygk-chair-cmpe' },
      });
      if (res.ok) {
        const data = await res.json();
        setQuota(data.asilQuota);
        setYedekQuota(data.yedekQuota);
        setQuotaSource('defined');
      } else {
        setQuota('');
        setYedekQuota(null);
        setQuotaSource('none');
      }
    } catch {
      setQuota('');
      setYedekQuota(null);
      setQuotaSource('none');
    }
  };

  const tiedIds = new Set(summary?.ties.flatMap((t) => t.applicationIds) ?? []);

  // All ties resolved when every tied app has a unique manual rank
  const tiesResolved = (): boolean => {
    if (!summary?.hasTies) return true;
    const assignedIds = Object.keys(manualRanks).filter((id) => tiedIds.has(id));
    if (assignedIds.length < tiedIds.size) return false;
    const ranks = assignedIds.map((id) => manualRanks[id]);
    return new Set(ranks).size === ranks.length;
  };

  // Build display rows: apply manual ranks to tied applicants, then re-sort
  const buildDisplayRankings = (): (RankingResult & { isTied: boolean })[] => {
    if (!summary) return [];

    const rows = summary.rankings.map((r) => ({
      ...r,
      isTied: tiedIds.has(r.applicationId),
      // Apply manual rank override for tied applicants
      rank: tiedIds.has(r.applicationId) && manualRanks[r.applicationId] !== undefined
        ? manualRanks[r.applicationId]
        : r.rank,
    }));

    // Re-sort if manual ranks applied
    if (Object.keys(manualRanks).length > 0) {
      rows.sort((a, b) => a.rank - b.rank);
      // Re-assign categories based on new order
      const asilCount = summary.asilCount;
      const yedekCount = summary.yedekCount;
      rows.forEach((r, i) => {
        const rank = i + 1;
        r.rank = rank;
        if (rank <= asilCount) r.category = 'ASIL';
        else if (rank <= asilCount + yedekCount) r.category = 'YEDEK';
        else r.category = 'RED';
      });
    }

    return rows;
  };

  const executeRanking = async () => {
    if (!quota || Number(quota) <= 0) {
      toast.error('Sıralamadan önce kotaları tanımlayınız.');
      return;
    }

    setLoading(true);
    setSummary(null);
    setConfirmed(false);
    setManualRanks({});

    try {
      const res = await fetch('/api/ranking/execute', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ departmentId: deptId, periodId, quota: Number(quota) }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Ranking failed');
      }

      const data: RankingSummary = await res.json();
      setSummary(data);

      if (data.hasTies) {
        toast.warning('Eşitlik tespit edildi. Lütfen manuel olarak çözünüz.');
      } else {
        toast.success('Sıralama oluşturuldu');
      }
    } catch (e: any) {
      if (e.message?.includes('No applications found') || e.message?.includes('quota')) {
        toast.error('Bu bölüm/dönem için değerlendirme bekleyen başvuru bulunamadı');
      } else {
        toast.error('Hata: ' + e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const confirmRanking = () => {
    setConfirmed(true);
    toast.success('Sıralama onaylandı ve kaydedildi.');
  };

  const getCategoryBadge = (cat: string, rank: number, quota: number) => {
    switch (cat) {
      case 'ASIL':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 min-w-[52px] justify-center">
            Asil
          </Badge>
        );
      case 'YEDEK':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 min-w-[52px] justify-center">
            Yedek
          </Badge>
        );
      default:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 min-w-[52px] justify-center">
            Red
          </Badge>
        );
    }
  };

  const displayRows = buildDisplayRankings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 font-bold">Toplu Sıralama</h1>
          <p className="text-gray-600 text-sm">Bölüm bazlı sıralama oluştur ve onayla</p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Panele Geri Dön
        </Button>
      </div>

      {/* Config */}
      {!summary && (
        <Card className="p-6 space-y-4">
          <h2 className="font-medium text-gray-900">Sıralama Parametreleri</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dept">Bölüm</Label>
              <select
                id="dept"
                value={deptId}
                onChange={(e) => setDeptId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {DEPT_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="period">Dönem</Label>
              <select
                id="period"
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="quota">Asil Kontenjan</Label>
              <Input
                id="quota"
                type="number"
                min={1}
                placeholder="ör. 2"
                value={quota}
                onChange={(e) => {
                  setQuota(e.target.value === '' ? '' : Number(e.target.value));
                  setQuotaSource('manual');
                }}
                className="mt-1"
              />
            </div>
          </div>

          {/* Kota durumu */}
          {quotaSource === 'defined' && quota !== '' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <Info className="w-4 h-4 shrink-0" />
              <span>
                Tanımlı kota yüklendi: <strong>{quota} Asil</strong>
                {yedekQuota !== null && <>, <strong>{yedekQuota} Yedek</strong></>}
              </span>
            </div>
          )}
          {quotaSource === 'none' && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Bu bölüm/dönem için tanımlı kota bulunamadı. Manuel girin.
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={executeRanking}
              disabled={loading || !quota || Number(quota) <= 0}
              style={{ backgroundColor: '#7A1616' }}
            >
              {loading ? 'Oluşturuluyor...' : 'Sıralamayı Oluştur'}
            </Button>
          </div>
        </Card>
      )}

      {/* Results */}
      {summary && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            {[
              { label: 'Toplam', val: summary.totalEvaluated, color: 'blue' },
              { label: 'Uygun', val: summary.eligible, color: 'green' },
              { label: 'Asil', val: summary.asilCount, color: 'green' },
              { label: 'Yedek', val: summary.yedekCount, color: 'yellow' },
              { label: 'Red', val: summary.redCount, color: 'red' },
            ].map(({ label, val, color }) => (
              <Card key={label} className={`p-4 border-l-4 ${
                color === 'blue' ? 'border-blue-500' :
                color === 'green' ? 'border-green-500' :
                color === 'yellow' ? 'border-yellow-500' : 'border-red-500'
              }`}>
                <div className="text-xs text-gray-500">{label}</div>
                <div className={`text-2xl font-bold ${
                  color === 'blue' ? 'text-blue-700' :
                  color === 'green' ? 'text-green-700' :
                  color === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                }`}>{val}</div>
              </Card>
            ))}
          </div>

          {/* Tie warning banner */}
          {summary.hasTies && !confirmed && (
            <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-yellow-800 text-sm mb-1">
                  Eşit puan tespit edildi — Eşitliği manuel olarak çözünüz.
                </div>
                <div className="text-xs text-yellow-700">
                  Sarı ile işaretlenen adaylar aynı transfer puanına sahip ve kota sınırında.
                  Her adaya farklı bir sıra numarası atayın, ardından sıralamayı onaylayın.
                </div>
              </div>
            </div>
          )}

          {/* Confirmed banner */}
          {confirmed && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800 text-sm">
                Sıralama onaylandı ve kaydedildi. Liste kilitlendi.
              </span>
            </div>
          )}

          {/* Ranking table */}
          <Card>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium text-gray-900">Nihai Başarı Sıralaması</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  Kota: {summary.quota} Asil · {Math.ceil(summary.quota * 0.2)} Yedek
                </span>
                {!confirmed && (
                  <Button
                    size="sm"
                    disabled={!tiesResolved()}
                    title={!tiesResolved() ? 'Önce eşitliği çözünüz' : ''}
                    onClick={confirmRanking}
                    style={tiesResolved() ? { backgroundColor: '#7A1616' } : {}}
                  >
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Sıralamayı Onayla
                  </Button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left w-16">Sıra</th>
                    <th className="px-4 py-3 text-left">Öğrenci</th>
                    <th className="px-4 py-3 text-left">GPA</th>
                    <th className="px-4 py-3 text-left">YKS</th>
                    <th className="px-4 py-3 text-left">Transfer Puanı</th>
                    <th className="px-4 py-3 text-left">Kategori</th>
                    {summary.hasTies && !confirmed && (
                      <th className="px-4 py-3 text-left">Manuel Sıra</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row) => {
                    const isTied = tiedIds.has(row.applicationId);
                    const rankAssigned = manualRanks[row.applicationId];
                    const rowBg = isTied && !confirmed
                      ? 'bg-yellow-50 hover:bg-yellow-100'
                      : row.category === 'ASIL' ? 'bg-green-50/30 hover:bg-green-50'
                      : row.category === 'YEDEK' ? 'bg-yellow-50/30 hover:bg-yellow-50'
                      : 'hover:bg-gray-50';

                    return (
                      <tr key={row.applicationId} className={`border-b ${rowBg} transition-colors`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {row.rank <= 3 && row.category === 'ASIL' && (
                              <Award className="w-4 h-4 shrink-0" style={{ color: '#7A1616' }} />
                            )}
                            <span className="font-bold text-sm">{row.rank}</span>
                            {isTied && !confirmed && (
                              <span title="Eşitlik">
                                <Zap className="w-3.5 h-3.5 text-yellow-500" />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {row.studentFullName}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{row.applicationId}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">{row.gpa.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{row.yksScore ?? '—'}</td>
                        <td className="px-4 py-3 text-sm font-mono font-bold" style={{ color: '#7A1616' }}>
                          {row.transferScore.toFixed(5)}
                        </td>
                        <td className="px-4 py-3">
                          {getCategoryBadge(row.category, row.rank, summary.quota)}
                        </td>
                        {summary.hasTies && !confirmed && (
                          <td className="px-4 py-3">
                            {isTied ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  min={1}
                                  max={summary.eligible}
                                  placeholder="Sıra #"
                                  value={rankAssigned ?? ''}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    if (val > 0) {
                                      setManualRanks((prev) => ({ ...prev, [row.applicationId]: val }));
                                    } else {
                                      setManualRanks((prev) => {
                                        const n = { ...prev };
                                        delete n[row.applicationId];
                                        return n;
                                      });
                                    }
                                  }}
                                  className="w-20 h-7 text-sm"
                                />
                                {rankAssigned && (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSummary(null);
                setConfirmed(false);
                setManualRanks({});
              }}
            >
              Yeni Sıralama Oluştur
            </Button>
            {!confirmed && !tiesResolved() && (
              <span className="text-sm text-yellow-700 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Tüm eşitlikler çözülmeden sıralama onaylanamaz.
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
