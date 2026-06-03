import { useState } from 'react';
import { AppShell } from '../AppShell';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Building2, Send, Eye, FileText, ArrowLeft, Inbox } from 'lucide-react';
import type { User } from '../../App';
import { PackageDetailView } from './PackageDetailView';
import { DeanQueue } from './DeanQueue';
import { toast } from 'sonner';

interface DeanDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole?: () => void;
}

type DeanView = 'dashboard' | 'package-detail' | 'queue';
type Section = 'dashboard' | 'queue';

// Mock packages data
const MOCK_PACKAGES = [
  {
    id: 'PKG-2025-CE-001',
    department: 'Computer Engineering',
    semester: '3rd Semester',
    period: 'Spring 2024-2025',
    receivedDate: '2025-01-16',
    applicantCount: 18,
    status: 'received_from_ygk',
    deadline: '2025-01-23'
  },
  {
    id: 'PKG-2025-EE-001',
    department: 'Electrical Engineering',
    semester: '3rd Semester',
    period: 'Spring 2024-2025',
    receivedDate: '2025-01-15',
    applicantCount: 12,
    status: 'reviewed',
    deadline: '2025-01-22'
  },
  {
    id: 'PKG-2025-ME-001',
    department: 'Mechanical Engineering',
    semester: '3rd Semester',
    period: 'Spring 2024-2025',
    receivedDate: '2025-01-17',
    applicantCount: 15,
    status: 'received_from_ygk',
    deadline: '2025-01-24'
  },
  {
    id: 'PKG-2025-IE-001',
    department: 'Industrial Engineering',
    semester: '3rd Semester',
    period: 'Spring 2024-2025',
    receivedDate: '2025-01-14',
    applicantCount: 10,
    status: 'sent_to_board',
    deadline: '2025-01-21'
  }
];

export function DeanDashboard({ user, onLogout, onSwitchRole }: DeanDashboardProps) {
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');
  const [currentView, setCurrentView] = useState<DeanView>('dashboard');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handleViewPackage = (packageId: string) => {
    setSelectedPackage(packageId);
    setCurrentView('package-detail');
  };

  const renderDashboardContent = () => {
    if (currentView === 'queue' || currentSection === 'queue') {
      return (
        <DeanQueue userFacultyId={user.id === 'user-deans-eng' ? 'faculty-engineering' : undefined} />
      );
    }

    if (currentView === 'package-detail' && selectedPackage) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setCurrentView('dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <PackageDetailView
            packageId={selectedPackage}
            onBack={() => setCurrentView('dashboard')}
          />
        </div>
      );
    }

    const receivedCount = MOCK_PACKAGES.filter(p => p.status === 'received_from_ygk').length;
    const reviewedCount = MOCK_PACKAGES.filter(p => p.status === 'reviewed').length;
    const sentCount = MOCK_PACKAGES.filter(p => p.status === 'sent_to_board').length;

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'received_from_ygk':
          return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">İnceleme Bekliyor</Badge>;
        case 'reviewed':
          return <Badge className="bg-blue-100 text-blue-800 border-blue-300">İncelendi</Badge>;
        case 'sent_to_board':
          return <Badge className="bg-green-100 text-green-800 border-green-300">Kurula Gönderildi</Badge>;
        default:
          return <Badge>{status}</Badge>;
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-gray-900 mb-2">Dekanlık Paneli</h1>
          <p className="text-gray-600">Fakülte Transfer Paketleri İnceleme ve Onay</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">İnceleme Bekleyen</div>
                <div className="text-2xl text-gray-900">{receivedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">İncelenen</div>
                <div className="text-2xl text-gray-900">{reviewedCount}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Kurula Gönderilen</div>
                <div className="text-2xl text-gray-900">{sentCount}</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Toplam Paket</div>
                <div className="text-2xl text-gray-900">{MOCK_PACKAGES.length}</div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C00000' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Department Packages Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-gray-900">Bölüm Paketleri</h2>
            <Badge className="bg-gray-100 text-gray-700 border-gray-300">
              Bahar 2024-2025
            </Badge>
          </div>

          <div className="space-y-3">
            {MOCK_PACKAGES.map(pkg => (
              <div
                key={pkg.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{pkg.department}</h3>
                      {getStatusBadge(pkg.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Paket ID</div>
                        <div className="text-gray-900">{pkg.id}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Dönem</div>
                        <div className="text-gray-900">{pkg.semester}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Başvuranlar</div>
                        <div className="text-gray-900">{pkg.applicantCount}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Alınma Tarihi</div>
                        <div className="text-gray-900">{pkg.receivedDate}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPackage(pkg.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      İncele
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Instructions */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-900 mb-1">İnceleme Süreci</h3>
              <p className="text-sm text-blue-800">
                YGK'dan gelen bölüm paketlerini inceleyin, sıralama listelerini ve intibak tablolarını doğrulayın,
                gerekirse dekanlık notu ekleyin ve nihai onay için Fakülte Yönetim Kurulu'na sevk edin.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  return (
    <AppShell
      user={user}
      currentRole="Dean"
      onLogout={onLogout}
      onSwitchRole={onSwitchRole}
      currentSection={currentSection}
      onNavigate={(section) => {
        setCurrentSection(section as Section);
        if (section === 'queue') {
          setCurrentView('queue');
        } else {
          setCurrentView('dashboard');
        }
      }}
    >
      {renderDashboardContent()}
    </AppShell>
  );
}
