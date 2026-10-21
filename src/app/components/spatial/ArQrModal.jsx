import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Smartphone, Check, Copy, Settings2, Camera, Box } from 'lucide-react';

export default function ArQrModal({ artifact, onClose, lang }) {
  const isAr = lang === 'ar';
  const [qrMode, setQrMode] = useState('scan');
  
  // Default to local LAN IP for phones on Wi-Fi
  const defaultHost = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    ? window.location.hostname
    : '192.168.100.33';

  const defaultPort = (typeof window !== 'undefined' && window.location.port) ? window.location.port : '5173';

  const [hostIp, setHostIp] = useState(defaultHost);
  const [port, setPort] = useState(defaultPort);
  const [showConfig, setShowConfig] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Extract model slug matching alqami3 dock buttons (e.g. "Zulfiqar_Sword", "nahj_al_balagha", etc.)
  const getModelSlug = () => {
    if (artifact.model?.glb) {
      const parts = artifact.model.glb.split('/');
      return parts[parts.length - 1].split('?')[0].replace(/\.glb$/i, '');
    }
    return artifact.id;
  };

  // Generate the mobile AR URL targeting /mobile/ with exact model and mode
  const getArTargetUrl = () => {
    if (typeof window === 'undefined') return '';
    // If running on GitHub Pages (e.g. isaacrow.github.io/alqami4/) or any hosted subpath
    const isHosted = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    let base = '';
    if (isHosted) {
      // Keep exact origin and pathname directory
      const pathDir = window.location.pathname.replace(/\/[^/]*$/, '');
      base = `${window.location.origin}${pathDir}`;
    } else {
      const protocol = window.location.protocol;
      const portPart = port ? `:${port}` : '';
      base = `${protocol}//${hostIp}${portPart}`;
    }
    const cleanBase = base.replace(/\/+$/, '');
    const modelSlug = getModelSlug();
    const modeParam = qrMode === 'scan' ? '&mode=scan' : '&mode=3d';
    return `${cleanBase}/mobile/?model=${encodeURIComponent(modelSlug)}&id=${encodeURIComponent(artifact.id)}${modeParam}`;
  };

  const arTargetUrl = getArTargetUrl();

  useEffect(() => {
    QRCode.toDataURL(arTargetUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#080a12',
        light: '#ffffff'
      }
    }).then(url => {
      setQrDataUrl(url);
    }).catch(err => {
      console.error("QR Code error:", err);
    });
  }, [arTargetUrl, qrMode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(arTargetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-md glass-card rounded-[2.5rem] p-6 text-center shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-white/10 text-white border border-white/25">
          <Smartphone className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1 font-amiri">
          {isAr ? 'تجربة الواقع المعزز (AR على الهاتف)' : 'Augmented Reality on Mobile'}
        </h3>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center justify-center gap-1.5 p-1 bg-white/10 rounded-2xl my-3 border border-white/20">
          <button
            type="button"
            onClick={() => setQrMode('scan')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              qrMode === 'scan' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{isAr ? 'فتح المسح مباشرة (Scan Mode)' : 'Direct Scan Mode'}</span>
          </button>

          <button
            type="button"
            onClick={() => setQrMode('3d')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              qrMode === '3d' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{isAr ? 'استعراض 3D' : '3D Viewer'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300/80 mb-4 font-light min-h-[32px] flex items-center justify-center">
          {qrMode === 'scan'
            ? (isAr 
                ? 'امسح الرمز بكاميرا هاتفك لفتح وضع مسح الكاميرا (Scan Mode) مباشرة على هاتفك' 
                : 'Scan with your phone camera to open AR Scan Mode directly on your device')
            : (isAr 
                ? 'امسح الرمز لفتح عارض النماذج ثلاثية الأبعاد والبيانات الوصفية على الهاتف' 
                : 'Scan to explore the 3D model and metadata on your smartphone')}
        </p>

        {/* QR Code Canvas */}
        <div className="relative p-4 rounded-3xl bg-white mx-auto w-fit shadow-2xl mb-4 group">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="AR QR Code" className="w-56 h-56 rounded-xl" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">
              Generating QR...
            </div>
          )}
        </div>

        {/* Artifact Name Tag */}
        <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 mb-3 text-xs text-white font-medium">
          {artifact.title[lang]}
        </div>

        {/* IP / Network Config Trigger */}
        <div className="mb-4">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] text-slate-300 hover:text-white flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <Settings2 className="w-3 h-3" />
            <span>{isAr ? `عنوان الشبكة: ${hostIp}:${port}` : `Network Address: ${hostIp}:${port}`}</span>
          </button>

          {showConfig && (
            <div className="mt-2 p-3 rounded-2xl bg-black/60 border border-white/20 text-left text-xs space-y-2 animate-fade-in">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  {isAr ? 'عنوان IP للجهاز (Wi-Fi IP)' : 'Local Wi-Fi IP'}
                </label>
                <input
                  type="text"
                  value={hostIp}
                  onChange={(e) => setHostIp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/80 border border-white/20 text-white font-mono text-xs focus:outline-none focus:border-white"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                {isAr 
                  ? 'ملاحظة: يجب أن يكون الهاتف متصلاً بنفس شبكة الواي فاي للكمبيوتر.' 
                  : 'Ensure your phone is connected to the same Wi-Fi network.'}
              </p>
            </div>
          )}
        </div>

        {/* Direct Link Copy Button */}
        <button
          onClick={handleCopyLink}
          className="w-full glass-pill py-2.5 text-xs font-semibold text-black bg-white hover:bg-slate-100 flex items-center justify-center gap-1.5"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-black" />}
          <span>{copied ? (isAr ? 'تم نسخ الرابط!' : 'Link Copied!') : (isAr ? 'نسخ رابط التجربة للهاتف' : 'Copy Mobile AR Link')}</span>
        </button>

      </div>
    </div>
  );
}
