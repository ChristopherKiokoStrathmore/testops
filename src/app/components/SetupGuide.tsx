import { Database, ExternalLink, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SQL_SETUP = `-- Create profiles table with passwords
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL DEFAULT '1234',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 9 testers
INSERT INTO profiles (full_name, phone_number, password) 
VALUES
  ('Christopher Kioko', '+254785638462', '1234'),
  ('Gabriella Ngeene', '+254105107837', '1234'),
  ('Norman Kodi', '+254733578275', '1234'),
  ('Geoffrey Gachingiri', '+254782544992', '1234'),
  ('Ahmed Wairimu', '+254785460106', '1234'),
  ('Samuel Gitau', '+254751665392', '1234'),
  ('Ivan Andayi', '+254100524754', '1234'),
  ('Dennis Mugendi', '+254783150482', '1234'),
  ('Valry Oduor', '+254107441742', '1234')
ON CONFLICT (phone_number) DO NOTHING;

-- Create test_logs table
CREATE TABLE IF NOT EXISTS test_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tester_id UUID NOT NULL REFERENCES profiles(id),
  category TEXT NOT NULL CHECK (category IN ('M-pesa', 'Safaricom', 'USSD', 'STK')),
  duration_sec INTEGER NOT NULL DEFAULT 0,
  is_failed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_test_logs_created_at ON test_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_test_logs_tester_id ON test_logs(tester_id);
CREATE INDEX IF NOT EXISTS idx_test_logs_category ON test_logs(category);
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);

-- Enable RLS and allow all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all operations on profiles" ON profiles;
CREATE POLICY "Allow all operations on profiles" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on test_logs" ON test_logs;
CREATE POLICY "Allow all operations on test_logs" ON test_logs
  FOR ALL USING (true) WITH CHECK (true);`;

export function SetupGuide() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-gradient-to-br from-emerald-950/50 to-teal-950/50 border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Simple Setup - Just 1 Step!</h2>
              <p className="text-emerald-100">Direct database authentication - No Supabase Auth needed</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-emerald-900/20 border-b border-emerald-500/30 px-8 py-4">
          <div className="flex items-start gap-3">
            <Check className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-emerald-200 font-semibold mb-1">
                No Auth Configuration Required!
              </p>
              <p className="text-emerald-300/80 text-sm">
                This app uses direct database lookup - just run the SQL below and you're done!
              </p>
            </div>
          </div>
        </div>

        {/* Single Step */}
        <div className="p-8">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-xl mb-3">Run This SQL Script</h3>
                <p className="text-gray-300 mb-4">
                  This creates the profiles table with all 9 testers and their passwords, plus the test_logs table.
                </p>
                
                <div className="flex gap-3 mb-4">
                  <a
                    href="https://supabase.com/dashboard/project/mjssawaxbmwjqksyevgd/sql/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-lg"
                  >
                    Open SQL Editor
                    <ExternalLink className="w-5 h-5" />
                  </a>
                  <button
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-lg"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        Copy SQL
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-black/50 rounded-lg p-4 max-h-80 overflow-y-auto border border-gray-700">
                  <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                    {SQL_SETUP}
                  </pre>
                </div>

                <div className="mt-4 bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                  <p className="text-sm text-gray-300 mb-2">
                    <span className="text-emerald-400 font-semibold">Instructions:</span>
                  </p>
                  <ol className="text-sm text-gray-400 space-y-1 list-decimal list-inside">
                    <li>Click "Open SQL Editor" above</li>
                    <li>Click "Copy SQL" to copy the script</li>
                    <li>Paste into the SQL editor</li>
                    <li>Click "Run" button</li>
                    <li>Refresh this page and login!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Test Login Box */}
          <div className="mt-8 bg-gradient-to-r from-emerald-900/30 to-teal-900/30 rounded-xl p-6 border border-emerald-500/30">
            <h3 className="text-white font-semibold text-lg mb-3">✅ Ready to Test?</h3>
            <p className="text-gray-300 mb-4">
              After running the SQL, refresh this page and login with any of these credentials:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Phone Numbers (any format works):</p>
                <div className="text-sm text-gray-300 space-y-1">
                  <div>0785638462 (Christopher)</div>
                  <div>0105107837 (Gabriella)</div>
                  <div>0733578275 (Norman)</div>
                  <div className="text-gray-500 text-xs">+ 6 more...</div>
                </div>
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Password for all:</p>
                <div className="text-2xl font-bold text-emerald-400 font-mono">1234</div>
                <p className="text-xs text-gray-500 mt-2">Can be changed from user menu</p>
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-6 rounded-xl font-bold shadow-lg shadow-emerald-500/50 hover:shadow-emerald-500/70 transition-all transform hover:scale-[1.02] text-lg"
            >
              🎉 I Ran the SQL - Refresh & Login!
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center space-y-2">
        <p className="text-gray-400 text-sm">
          📖 See <span className="text-emerald-400 font-semibold">SIMPLE_DB_AUTH.md</span> for more details
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <span>✅ No Supabase Auth setup</span>
          <span>•</span>
          <span>✅ No OTP codes</span>
          <span>•</span>
          <span>✅ Just run SQL!</span>
        </div>
      </div>
    </div>
  );
}
