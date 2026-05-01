import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';
import type { User } from '../App';

// Mock user database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  '12345678901': {
    password: 'student123',
    user: {
      id: '1',
      tckn: '12345678901',
      name: 'Ahmet',
      surname: 'Yılmaz',
      roles: ['Student'],
      email: 'ahmet.yilmaz@student.edu.tr'
    }
  },
  '98765432109': {
    password: 'admin123',
    user: {
      id: '2',
      tckn: '98765432109',
      name: 'Mehmet',
      surname: 'Demir',
      roles: ['OIDB', 'Admin'],
      email: 'mehmet.demir@admin.edu.tr'
    }
  },
  '11111111111': {
    password: 'ydyo123',
    user: {
      id: '3',
      tckn: '11111111111',
      name: 'Ayşe',
      surname: 'Kaya',
      roles: ['YDYO'],
      email: 'ayse.kaya@ydyo.edu.tr'
    }
  },
  '22222222222': {
    password: 'ygk123',
    user: {
      id: '4',
      tckn: '22222222222',
      name: 'Fatma',
      surname: 'Şahin',
      roles: ['YGK'],
      email: 'fatma.sahin@ygk.edu.tr'
    }
  },
  '33333333333': {
    password: 'dean123',
    user: {
      id: '5',
      tckn: '33333333333',
      name: 'Ali',
      surname: 'Öztürk',
      roles: ['Dean'],
      email: 'ali.ozturk@dean.edu.tr'
    }
  },
  '44444444444': {
    password: 'board123',
    user: {
      id: '6',
      tckn: '44444444444',
      name: 'Zeynep',
      surname: 'Yıldız',
      roles: ['Board'],
      email: 'zeynep.yildiz@board.edu.tr'
    }
  }
};

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

import { useEffect } from 'react';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [tckn, setTckn] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    const savedLockout = localStorage.getItem('lockoutUntil');
    if (savedLockout) {
      const until = parseInt(savedLockout, 10);
      if (until > Date.now()) {
        setLockoutUntil(until);
      } else {
        localStorage.removeItem('lockoutUntil');
      }
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (lockoutUntil) {
      interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
        setRemainingTime(remaining);
        if (remaining === 0) {
          setLockoutUntil(null);
          setFailedAttempts(0);
          localStorage.removeItem('lockoutUntil');
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (lockoutUntil && Date.now() < lockoutUntil) {
      return;
    }

    // Validation
    if (!tckn || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (tckn.length !== 11 || !/^\d+$/.test(tckn)) {
      setError('T.C. Identity Number must be 11 digits.');
      return;
    }

    // Check credentials
    const userRecord = MOCK_USERS[tckn];
    if (!userRecord || userRecord.password !== password) {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= 5) {
        const until = Date.now() + 15 * 60 * 1000;
        setLockoutUntil(until);
        localStorage.setItem('lockoutUntil', until.toString());
        setError('Too many failed attempts. Account locked for 15 minutes.');
      } else {
        setError(`Invalid T.C. Identity Number or password. Attempt ${newAttempts}/5`);
      }
      return;
    }

    // Successful login
    setFailedAttempts(0);
    onLogin(userRecord.user);
  };

  if (showForgotPassword) {
    return <ForgotPasswordScreen onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#C00000' }}>
            <div className="text-white">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
          </div>
          <h1 className="text-gray-900">University Transfer Management System</h1>
          <p className="text-gray-600 mt-2">Please login to continue</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {lockoutUntil && Date.now() < lockoutUntil && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Account locked. Please try again in {Math.floor(remainingTime / 60)}m {remainingTime % 60}s.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="tckn">T.C. Identity Number</Label>
              <Input
                id="tckn"
                type="text"
                placeholder="Enter 11-digit TCKN"
                value={tckn}
                onChange={(e) => setTckn(e.target.value)}
                maxLength={11}
                disabled={!!lockoutUntil && Date.now() < lockoutUntil}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!!lockoutUntil && Date.now() < lockoutUntil}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              style={{ backgroundColor: '#C00000' }}
              disabled={!!lockoutUntil && Date.now() < lockoutUntil}
            >
              Login
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm hover:underline"
                style={{ color: '#C00000' }}
              >
                Forgot password?
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-gray-600">
              <div>Student: 12345678901 / student123</div>
              <div>OIDB/Admin: 98765432109 / admin123</div>
              <div>YDYO: 11111111111 / ydyo123</div>
              <div>YGK: 22222222222 / ygk123</div>
              <div>Dean: 33333333333 / dean123</div>
              <div>Board: 44444444444 / board123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
