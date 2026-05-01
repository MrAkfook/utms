import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onBack: () => void;
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [tckn, setTckn] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Security: Generic error message to prevent information leakage
      if (tckn === '12345678901' && email === 'ahmet.yilmaz@student.edu.tr') {
        setSuccess(true);
      } else {
        setError('TCKN veya e-posta hatalı.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-gray-900">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your details to receive reset instructions</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Instructions Sent</h2>
              <p className="text-gray-600">
                If the provided TCKN and email match our records, you will receive password reset instructions shortly.
              </p>
              <Button
                onClick={onBack}
                className="w-full"
                style={{ backgroundColor: '#C00000' }}
              >
                Return to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <button
                type="button"
                onClick={onBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
              </button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
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
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#C00000' }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
