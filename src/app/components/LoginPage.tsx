import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Lock, User, Eye, EyeOff, Languages, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import moonLogoWhite from '../../assets/white.png';
import moonLogoBlack from '../../assets/black.png';

// Spline Scene URL - Updated to new 3D design text scene
const SPLINE_SCENE_URL = 'https://my.spline.design/3ddesigntextcopycopy-ICjwUjRH9s8O1NCNqRAWjo5g-5OJ/';

interface LoginPageProps {
  onLanguageChange: (lang: string) => void;
  currentLanguage: string;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export function LoginPage({ onLanguageChange, currentLanguage }: LoginPageProps) {
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI State
  const [isUiVisible, setIsUiVisible] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side validation
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);

    try {
      if (activeTab === 'login') {
        const loginSuccess = await login(username, password);
        if (!loginSuccess) {
          setError(t('invalidCredentials') || 'Invalid username or password. If you don\'t have an account, use the Sign Up tab.');
        }
      } else {
        const signupSuccess = await signup(username, password);
        if (signupSuccess) {
          setSuccess('Account created successfully! You are now logged in.');
          // No need to redirect to login tab — auto-login from signup handles it
        } else {
          setError('Failed to create account. Username may already exist.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {/* Ambient Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-purple-950/20 to-pink-950/20 z-0" />
      
      {/* Spline 3D Background - Always receives mouse events for tracking */}
      <div className="absolute inset-0 z-0" style={{ top: '-15%', height: '130%' }}>
        <iframe 
          src={SPLINE_SCENE_URL}
          frameBorder="0" 
          width="100%" 
          height="100%" 
          className="w-full h-full"
          title="Spline 3D Scene"
          allow="fullscreen; autoplay"
          style={{ 
            pointerEvents: 'auto',
            border: 'none',
            background: 'transparent'
          }}
        />
      </div>

      {/* Grid Overlay Effect */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30 z-[1] pointer-events-none" />

      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-transparent blur-3xl z-[1] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-500/20 to-transparent blur-3xl z-[1] pointer-events-none" />

      {/* Top Bar - Brand Identity */}
      <AnimatePresence>
        {isUiVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="absolute top-0 left-0 right-0 z-40 p-6 flex items-center justify-between"
          >
            <div className="absolute top-6 right-6 flex items-center gap-3 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 shadow-2xl">
              <div className="w-16 h-16 flex items-center justify-center backdrop-blur-md bg-white/20 rounded-xl border border-white/30 shadow-lg">
                <img src={moonLogoWhite} alt="Moon Logo" className="w-full h-full object-contain drop-shadow-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                  DESIGN AND DEVELOPED BY ISAAC FALEH
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mt-0.5 drop-shadow-md">
                  Bibliographic Framework System v3.0
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI Control Buttons */}
      <div className="absolute bottom-8 right-8 z-50 flex gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => onLanguageChange(currentLanguage === 'en' ? 'ar' : 'en')}
            className="bg-black/30 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl rounded-xl w-12 h-12 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            <Languages className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsUiVisible(!isUiVisible)}
            className="bg-black/30 border-white/20 text-white hover:bg-white/10 backdrop-blur-xl rounded-xl w-12 h-12 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            {isUiVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </motion.div>
      </div>

      {/* Login Card */}
      <AnimatePresence>
        {isUiVisible && (
          <motion.div
            initial={{ opacity: 0, x: -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.95 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              opacity: { duration: 0.3 }
            }}
            className="absolute top-1/2 left-12 -translate-y-1/2 z-30 pointer-events-none"
          >
            <Card className="w-[420px] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_1px_rgba(255,255,255,0.1)_inset] pointer-events-auto overflow-hidden rounded-2xl">
              {/* Animated gradient border */}
              <motion.div 
                className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear'
                }}
                style={{
                  backgroundSize: '200% 100%'
                }}
              />

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-blue-400/30 rounded-tl-2xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-purple-400/30 rounded-br-2xl" />

              <CardHeader className="pb-4 pt-8">
                <CardTitle className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <img src={moonLogoWhite} alt="Moon Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
                  <span className="text-white font-bold">
                    moon editor
                  </span>
                </CardTitle>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-white/40 text-xs uppercase tracking-[0.15em]">
                    Secure Access Portal
                  </p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400/70 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="px-8 pb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 mb-6 p-1 rounded-xl">
                    <TabsTrigger 
                      value="login" 
                      className="data-[state=active]:bg-white/20 data-[state=active]:backdrop-blur-xl data-[state=active]:border data-[state=active]:border-white/30 data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] data-[state=active]:text-white text-white/50 text-xs uppercase tracking-[0.1em] font-semibold rounded-lg transition-all duration-300"
                    >
                      {t('login') || 'Login'}
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      className="data-[state=active]:bg-white/20 data-[state=active]:backdrop-blur-xl data-[state=active]:border data-[state=active]:border-white/30 data-[state=active]:shadow-[0_0_20px_rgba(255,255,255,0.3)] data-[state=active]:text-white text-white/50 text-xs uppercase tracking-[0.1em] font-semibold rounded-lg transition-all duration-300"
                    >
                      {t('signup') || 'Sign Up'}
                    </TabsTrigger>
                  </TabsList>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-white/70 text-[11px] uppercase tracking-[0.12em] font-medium" htmlFor="username">
                        Username
                      </Label>
                      <div className="relative group">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-blue-400 transition-colors duration-200" />
                        <Input 
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-11 h-11 bg-black/30 border border-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all duration-300 rounded-xl hover:border-white/20"
                          placeholder="Enter your identifier"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white/70 text-[11px] uppercase tracking-[0.12em] font-medium" htmlFor="password">
                        Password
                      </Label>
                      <div className="relative group">
                        <Lock className="absolute left-3.5 top-3 h-4 w-4 text-white/30 group-focus-within:text-purple-400 transition-colors duration-200" />
                        <Input 
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-11 pr-11 h-11 bg-black/30 border border-white/10 text-white placeholder:text-white/20 focus-visible:ring-2 focus-visible:ring-purple-500/50 focus-visible:border-purple-500/50 transition-all duration-300 rounded-xl hover:border-white/20"
                          placeholder="Enter your access key"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-white/30 hover:text-white/60 transition-colors"
                          disabled={loading}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-red-400 mt-1.5" />
                            <span>{error}</span>
                          </div>
                        </motion.div>
                      )}
                      
                      {success && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: -10, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="p-3.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-xs backdrop-blur-sm"
                        >
                          <div className="flex items-start gap-2">
                            <div className="w-1 h-1 rounded-full bg-green-400 mt-1.5" />
                            <span>{success}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      whileHover={{ scale: loading ? 1 : 1.01 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="pt-2"
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 bg-blue-500/30 backdrop-blur-xl border border-blue-400/50 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:bg-blue-400/40 transition-all duration-300 font-bold text-lg uppercase tracking-wider rounded-xl disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        disabled={loading}
                      >
                        {/* Button shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                        <span className="relative z-10">
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              >
                                ⚡
                              </motion.span>
                              Authenticating...
                            </span>
                          ) : (
                            'START'
                          )}
                        </span>
                      </Button>
                    </motion.div>

                    {activeTab === 'login' && (
                      <div className="text-center pt-2">
                        <button
                          type="button"
                          className="text-xs text-white/40 hover:text-white/70 transition-colors underline"
                          disabled={loading}
                        >
                          Forgot password?
                        </button>
                      </div>
                    )}
                  </form>
                </Tabs>

                {/* Footer info */}
                <div className="mt-6 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider">
                    <span>v3.0.1</span>
                    <span>Secure Connection</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}