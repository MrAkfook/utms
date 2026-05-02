import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  GraduationCap, 
  UserCog, 
  Languages, 
  Users, 
  Building2, 
  Scale,
  Shield,
  LogOut
} from 'lucide-react';
import type { UserRole } from '../App';

interface RoleSwitchScreenProps {
  roles: UserRole[];
  onSelectRole: (role: UserRole) => void;
  onLogout: () => void;
}

const ROLE_CONFIG: Record<UserRole, { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  color: string;
}> = {
  Student: {
    icon: GraduationCap,
    title: 'Öğrenci',
    description: 'Transfer başvurusu yapın ve sürecinizi takip edin',
    color: '#C00000'
  },
  OIDB: {
    icon: UserCog,
    title: 'Öğrenci İşleri (ÖİDB)',
    description: 'Başvuru doğrulama ve iş akış yönetimi',
    color: '#A82020'
  },
  YDYO: {
    icon: Languages,
    title: 'Yabancı Diller (YDYO)',
    description: 'Dil yeterlilik belgelerini inceleme ve onay',
    color: '#8B1A1A'
  },
  YGK: {
    icon: Users,
    title: 'Bölüm Komisyonu (YGK)',
    description: 'Akademik değerlendirme ve sıralama işlemleri',
    color: '#7A1616'
  },
  Dean: {
    icon: Building2,
    title: "Dekanlık",
    description: 'Değerlendirme paketlerini inceleme ve sevk',
    color: '#6B1313'
  },
  Board: {
    icon: Scale,
    title: 'Fakülte Kurulu',
    description: 'Transfer kararlarının nihai onayı',
    color: '#5C1010'
  },
  Admin: {
    icon: Shield,
    title: 'Sistem Yöneticisi',
    description: 'Kullanıcı, kontenjan ve sistem ayarları yönetimi',
    color: '#4D0D0D'
  }
};

export function RoleSwitchScreen({ roles, onSelectRole, onLogout }: RoleSwitchScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-3 bg-red-50 rounded-2xl mb-4">
            <Shield className="w-10 h-10 text-[#C00000]" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Rol Seçimi</h1>
          <p className="text-gray-500 mt-3 text-lg font-medium">Erişmek istediğiniz yetki alanını seçiniz</p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {roles.map((role) => {
            const config = ROLE_CONFIG[role];
            const Icon = config.icon;
            
            return (
              <Card
                key={role}
                className="group relative overflow-hidden p-8 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-none ring-1 ring-gray-200"
                onClick={() => onSelectRole(role)}
              >
                {/* Background Pattern */}
                <div className="absolute -right-4 -bottom-4 opacity-5 transform rotate-12 transition-transform group-hover:rotate-0">
                  <Icon className="w-32 h-32" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                    style={{ backgroundColor: config.color }}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{config.description}</p>
                  </div>
                  <Button 
                    className="w-full h-11 font-bold shadow-md opacity-90 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.title} Olarak Gir
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Logout Button */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 font-bold transition-all px-8 py-6 h-auto rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sistemden Güvenli Çıkış Yap
          </Button>
        </div>
      </div>

      <div className="text-center pb-8">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">
          Transfer Yönetim Sistemi • Çoklu Yetki Paneli
        </p>
      </div>
    </div>
  );
}
