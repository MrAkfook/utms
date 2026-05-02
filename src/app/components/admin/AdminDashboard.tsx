import { useState } from 'react';
import { AppShell } from '../AppShell';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  Shield, 
  Users, 
  Calendar, 
  Settings,
  Database,
  CheckCircle2,
  Activity,
  ArrowLeft
} from 'lucide-react';
import type { User } from '../../App';
import { ExternalSystemsMonitor } from './ExternalSystemsMonitor';
import { toast } from 'sonner';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole?: () => void;
}

type AdminView = 'dashboard' | 'external-systems';
type Section = 'dashboard' | 'integrations';

export function AdminDashboard({ user, onLogout, onSwitchRole }: AdminDashboardProps) {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const handleUpdateSettings = () => {
    toast.success('Ayarlar başarıyla güncellendi');
  };

  const renderDashboardContent = () => {
    if (currentView === 'external-systems' || currentSection === 'integrations') {
      return (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => { setCurrentView('dashboard'); setCurrentSection('dashboard'); }} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <ExternalSystemsMonitor onBack={() => { setCurrentView('dashboard'); setCurrentSection('dashboard'); }} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-gray-900 mb-2">Sistem Yönetim Paneli</h1>
          <p className="text-gray-600">Kullanıcıları, ayarları ve sistem konfigürasyonunu yönetin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Toplam Kullanıcı</div>
                <div className="text-2xl text-gray-900">142</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Aktif Dönem</div>
                <div className="text-sm text-gray-900">Bahar 2025</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Sistem Durumu</div>
                <div className="text-sm text-green-600">Operasyonel</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Veritabanı</div>
                <div className="text-sm text-gray-900">98% Sağlıklı</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Application Period Settings */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Başvuru Dönemi Yapılandırması</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Başvuru Başlangıç Tarihi</Label>
                <Input type="date" defaultValue="2025-01-05" />
              </div>
              <div className="space-y-2">
                <Label>Başvuru Bitiş Tarihi</Label>
                <Input type="date" defaultValue="2025-01-15" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sonuç Açıklama Tarihi</Label>
                <Input type="date" defaultValue="2025-02-01" />
              </div>
              <div className="space-y-2">
                <Label>Akademik Yıl / Dönem</Label>
                <Input defaultValue="2024-2025 / Bahar" />
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" style={{ backgroundColor: '#4D0D0D' }} onClick={handleUpdateSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Dönem Ayarlarını Güncelle
            </Button>
          </div>
        </Card>

        {/* Quota Management */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Bölüm Bazlı Kontenjan Yönetimi</h2>
          <div className="space-y-3">
            {[
              { dept: 'Bilgisayar Mühendisliği', semester3: 8, semester5: 4 },
              { dept: 'Elektrik-Elektronik Mühendisliği', semester3: 6, semester5: 3 },
              { dept: 'Makine Mühendisliği', semester3: 7, semester5: 3 },
              { dept: 'Endüstri Mühendisliği', semester3: 5, semester5: 2 },
            ].map((quota) => (
              <div key={quota.dept} className="grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-900">{quota.dept}</div>
                <div className="text-sm text-gray-600">3. Dönem: {quota.semester3}</div>
                <div className="text-sm text-gray-600">5. Dönem: {quota.semester5}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline">
              <Settings className="w-4 h-4 mr-2" />
              Kontenjanları Düzenle
            </Button>
          </div>
        </Card>

        {/* API Integration Status */}
        <Card className="p-6">
          <h2 className="text-gray-900 mb-4">Dış Servis Entegrasyon Durumları</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">e-Devlet (TCKN Doğrulama)</div>
                <div className="text-xs text-gray-600">Son senkronizasyon: 2 dakika önce</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">ÖSYM Veritabanı</div>
                <div className="text-xs text-gray-600">Son senkronizasyon: 5 dakika önce</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">YÖKSİS Akademik Kayıt Sistemi</div>
                <div className="text-xs text-gray-600">Son senkronizasyon: 1 saat önce</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
            <div className="p-4 border rounded-lg flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-900">Belge Doğrulama Servisi</div>
                <div className="text-xs text-gray-600">Son senkronizasyon: 30 dakika önce</div>
              </div>
              <Badge className="bg-green-100 text-green-800">Aktif</Badge>
            </div>
          </div>
          <div className="mt-4">
            <Button size="sm" variant="outline" onClick={() => setCurrentView('external-systems')}>
              <Activity className="w-4 h-4 mr-2" />
              Dış Sistemleri İzle
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <AppShell
      user={user}
      currentRole="Admin"
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      currentSection={currentSection}
      onNavigate={(section) => {
        setCurrentSection(section as Section);
        if (section === 'dashboard') {
          setCurrentView('dashboard');
        } else if (section === 'integrations') {
          setCurrentView('external-systems');
        }
      }}
    >
      {renderDashboardContent()}
    </AppShell>
  );
}
