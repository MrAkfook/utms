import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Activity,
  Database,
  Shield,
  FileCheck
} from 'lucide-react';

interface ExternalSystemsMonitorProps {
  onBack: () => void;
}

const EXTERNAL_SYSTEMS = [
  {
    id: 'nvi',
    name: 'NVI (Nüfus ve Vatandaşlık İşleri)',
    description: 'Kimlik Doğrulama Servisi',
    icon: Shield,
    status: 'online',
    uptime: '99.8%',
    lastSync: '2 dakika önce',
    avgResponseTime: '245ms',
    todayRequests: 3847,
    successRate: '99.9%',
    endpoints: [
      { name: 'TC Kimlik Doğrula', status: 'operational' },
      { name: 'Vatandaş Verisi Getir', status: 'operational' }
    ]
  },
  {
    id: 'yoksis',
    name: 'YÖKSİS',
    description: 'Yükseköğretim Bilgi Sistemi',
    icon: Database,
    status: 'online',
    uptime: '98.2%',
    lastSync: '5 dakika önce',
    avgResponseTime: '580ms',
    todayRequests: 2156,
    successRate: '98.5%',
    endpoints: [
      { name: 'Öğrenci Akademik Kaydı Getir', status: 'operational' },
      { name: 'Mevcut GNO Getir', status: 'operational' },
      { name: 'Kayıt Durumu Doğrula', status: 'operational' }
    ]
  },
  {
    id: 'osym',
    name: 'ÖSYM',
    description: 'Ölçme, Seçme ve Yerleştirme Merkezi',
    icon: FileCheck,
    status: 'degraded',
    uptime: '94.5%',
    lastSync: '45 dakika önce',
    avgResponseTime: '1250ms',
    todayRequests: 1892,
    successRate: '92.3%',
    endpoints: [
      { name: 'YKS/ÖSYS Puanı Getir', status: 'degraded' },
      { name: 'Sınav Sonucu Doğrula', status: 'operational' }
    ]
  },
  {
    id: 'ebys',
    name: 'EBYS',
    description: 'Elektronik Belge Yönetim Sistemi',
    icon: Activity,
    status: 'online',
    uptime: '99.5%',
    lastSync: '1 dakika önce',
    avgResponseTime: '320ms',
    todayRequests: 5234,
    successRate: '99.7%',
    endpoints: [
      { name: 'Belge Doğruluğunu Onayla', status: 'operational' },
      { name: 'Belge Üstverisi Getir', status: 'operational' }
    ]
  }
];

const RECENT_API_LOGS = [
  {
    timestamp: '2025-01-18 14:32:15',
    system: 'NVI',
    endpoint: 'Verify TC Identity',
    request: 'TCKN: 12345678901',
    status: 'success',
    responseTime: '234ms',
    statusCode: 200
  },
  {
    timestamp: '2025-01-18 14:31:58',
    system: 'YÖKSİS',
    endpoint: 'Get Student Academic Record',
    request: 'Student ID: 2021234567',
    status: 'success',
    responseTime: '542ms',
    statusCode: 200
  },
  {
    timestamp: '2025-01-18 14:30:42',
    system: 'ÖSYM',
    endpoint: 'Get YKS Score',
    request: 'TC: 98765432109, Year: 2024',
    status: 'error',
    responseTime: '2150ms',
    statusCode: 504,
    error: 'Gateway timeout'
  },
  {
    timestamp: '2025-01-18 14:29:33',
    system: 'EBYS',
    endpoint: 'Validate Document',
    request: 'Doc ID: DOC-2025-001234',
    status: 'success',
    responseTime: '298ms',
    statusCode: 200
  }
];

export function ExternalSystemsMonitor({ onBack }: ExternalSystemsMonitorProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'operational':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 };
      case 'degraded':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle };
      case 'offline':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertTriangle };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2 font-bold">Dış Sistem Entegrasyonları</h1>
          <p className="text-gray-600">Dış doğrulama sistemleri ile olan API bağlantılarını izleyin ve yönetin</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Durumu Güncelle
          </Button>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Yönetim Paneline Dön
          </Button>
        </div>
      </div>

      {/* Architecture Diagram */}
      <Card className="p-6 overflow-hidden">
        <h2 className="text-gray-900 mb-4 font-bold">Entegrasyon Mimarisi</h2>
        <div className="flex items-center justify-center py-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center max-w-5xl">
            <div className="space-y-3 md:col-span-2">
              {EXTERNAL_SYSTEMS.map((system) => {
                const Icon = system.icon;
                const statusConfig = getStatusColor(system.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <div key={system.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900">{system.name}</div>
                      <div className="flex items-center space-x-1 mt-0.5">
                        <StatusIcon className={`w-3 h-3 ${statusConfig.text}`} />
                        <span className={`text-[10px] font-bold uppercase ${statusConfig.text}`}>{system.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center">
                    <div className="w-16 h-0.5 bg-gray-200"></div>
                    <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: '#C00000' }}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="p-6 rounded-lg border-2 bg-red-50/30" style={{ borderColor: '#C00000' }}>
                <div className="flex items-center justify-center mb-3">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#C00000' }}>
                    <Database className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-900 font-bold mb-1">Transfer Yönetim Portalı</div>
                  <div className="text-xs text-gray-500">Merkezi Başvuru Sistemi</div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Sistemler Bağlı</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {EXTERNAL_SYSTEMS.map((system) => {
          const Icon = system.icon;
          const statusConfig = getStatusColor(system.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={system.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-bold">{system.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{system.description}</p>
                  </div>
                </div>
                <Badge className={`${statusConfig.bg} ${statusConfig.text} border-none font-bold text-[10px]`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {system.status.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 font-mono">
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Çalışma Süresi</div>
                  <div className="text-sm text-gray-900 font-bold">{system.uptime}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Başarı Oranı</div>
                  <div className="text-sm text-gray-900 font-bold">{system.successRate}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Ort. Yanıt</div>
                  <div className="text-sm text-gray-900 font-bold">{system.avgResponseTime}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-100">
                  <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Bugünkü İstek</div>
                  <div className="text-sm text-gray-900 font-bold">{system.todayRequests.toLocaleString()}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="text-[10px] text-gray-500 mb-3 font-bold uppercase tracking-wider">API Uç Noktaları:</div>
                <div className="space-y-2">
                  {system.endpoints.map((endpoint, idx) => {
                    const epStatusConfig = getStatusColor(endpoint.status);
                    const EpStatusIcon = epStatusConfig.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">{endpoint.name}</span>
                        <div className="flex items-center space-x-1">
                          <EpStatusIcon className={`w-3 h-3 ${epStatusConfig.text}`} />
                          <span className={`text-[10px] font-bold ${epStatusConfig.text}`}>{endpoint.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-4 font-medium">
                <div className="text-[10px] text-gray-400">Son senkronizasyon: {system.lastSync}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent API Activity Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold">Son API Aktiviteleri</h2>
          <Button size="sm" variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Tüm Kayıtları Gör
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
                <th className="text-left py-3 px-4">Zaman Damgası</th>
                <th className="text-left py-3 px-4">Sistem</th>
                <th className="text-left py-3 px-4">Uç Nokta</th>
                <th className="text-left py-3 px-4">İstek</th>
                <th className="text-left py-3 px-4">Durum</th>
                <th className="text-left py-3 px-4">Yanıt Süresi</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_API_LOGS.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors font-mono">
                  <td className="py-3 px-4 text-[11px] text-gray-500">{log.timestamp}</td>
                  <td className="py-3 px-4 text-xs font-bold text-gray-900">{log.system}</td>
                  <td className="py-3 px-4 text-[11px] text-gray-700">{log.endpoint}</td>
                  <td className="py-3 px-4 text-[11px] text-gray-500 truncate max-w-[150px]">{log.request}</td>
                  <td className="py-3 px-4">
                    {log.status === 'success' ? (
                      <Badge className="bg-green-100 text-green-800 text-[10px] font-bold border-none">
                        {log.statusCode} BAŞARILI
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 text-[10px] font-bold border-none">
                        {log.statusCode} HATA
                      </Badge>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-gray-600 font-bold">{log.responseTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {RECENT_API_LOGS.some(log => log.error) && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
            <div className="text-xs text-red-900 font-bold mb-1">Kritik Hatalar Tespit Edildi</div>
            <div className="text-[10px] text-red-700 font-medium">
              {RECENT_API_LOGS.filter(log => log.error).map((log, idx) => (
                <div key={idx}>
                  • {log.system} - {log.endpoint}: {log.error} (Referans: {log.statusCode})
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
