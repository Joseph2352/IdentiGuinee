import React, { useState, useEffect, useRef } from 'react';
import { verificationService } from '../../services/verification.service';
import { Skeleton } from '../../components/common/Skeleton';
import { TableSkeleton } from '../../components/common/TableSkeleton';
import { Html5Qrcode } from 'html5-qrcode';
import Reveal from '../../components/animations/Reveal';
import Counter from '../../components/animations/Counter';
import { toast } from 'react-hot-toast';

const Verifications: React.FC = () => {
  const [method, setMethod] = useState<'qr' | 'manual'>('qr');
  const [verifyStatus, setVerifyStatus] = useState<'idle' | 'loading' | 'authentic' | 'invalid'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [resultData, setResultData] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
    fetchHistory();
    
    const interval = setInterval(() => {
      fetchStats();
      fetchHistory();
    }, 10000); // Polling toutes les 10 secondes
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await verificationService.getStats();
      if (res.success) setStats(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingStats(false); }
  };

  const fetchHistory = async () => {
    try {
      const res = await verificationService.getHistorique();
      if (res.success) setHistory(res.data.verifications);
    } catch (err) { console.error(err); }
    finally { setLoadingHistory(false); }
  };

  useEffect(() => {
    if (verifyStatus === 'authentic' || verifyStatus === 'invalid') {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [verifyStatus]);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    if (isCameraActive || (scannerRef.current && scannerRef.current.isScanning)) {
      return;
    }

    setIsCameraActive(true);
    
    const readerElement = document.getElementById('reader');
    if (readerElement) readerElement.innerHTML = '';

    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10 },
        (decodedText) => {
          handleVerify(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err: any) {
      console.error("Impossible de démarrer la caméra:", err);
      if (err?.name === 'NotReadableError' || err?.message?.includes('Device in use')) {
        toast.error("La caméra est déjà utilisée par une autre application.");
      } else {
        toast.error("Erreur d'accès à la caméra. Vérifiez les permissions.");
      }
      setIsCameraActive(false);
      scannerRef.current = null;
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {}
    }
  };

  const playSuccessSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime); 
    oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.1); 
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    if (navigator.vibrate) navigator.vibrate(100);
  };

  const handleVerify = async (scannedValue?: string) => {
    let rawValue = scannedValue || searchQuery;
    let identifiantToSend = "";
    
    try {
      if (rawValue.trim().startsWith('{')) {
        const parsedData = JSON.parse(rawValue);
        if (parsedData.numeroCarte) identifiantToSend = parsedData.numeroCarte;
        else if (parsedData.id) identifiantToSend = parsedData.id;
      } else {
        identifiantToSend = rawValue.replace(/-/g, '');
      }
    } catch (e) {
      identifiantToSend = rawValue.replace(/-/g, '');
    }

    if (!identifiantToSend) {
      toast.error('Veuillez saisir un UID ou scanner un code valide');
      return;
    }

    setVerifyStatus('loading');
    setResultData(null);
    try {
      const isNin = !identifiantToSend.startsWith('GN') && identifiantToSend.length === 15;
      const response = await verificationService.verifierCarte({ 
        [isNin ? 'nin' : 'numeroCarte']: identifiantToSend,
        institution: 'Portail Admin' 
      });
      
      if (response.success || response.data) {
        setResultData(response.data || response);
        setVerifyStatus('authentic');
        playSuccessSound();
        toast.success('Document authentifié');
      } else {
        setVerifyStatus('invalid');
      }
      fetchStats();
      fetchHistory();
    } catch (error: any) {
      setVerifyStatus('invalid');
      toast.error(error.response?.data?.message || 'Document non trouvé ou invalide');
    }
  };

  const formatUID = (value: string) => {
    let raw = value.replace(/-/g, '').toUpperCase();
    let prefix = '';
    let digits = '';

    if (raw.startsWith('GN')) {
      prefix = 'GN';
      digits = raw.substring(2).replace(/[^0-9]/g, '');
    } else if (raw.startsWith('G')) {
      prefix = 'G';
      digits = raw.substring(1).replace(/[^0-9]/g, '');
    } else {
      digits = raw.replace(/[^0-9]/g, '');
    }

    const cleaned = prefix + digits;
    let formatted = cleaned;

    if (cleaned.startsWith('GN')) {
      const groups = digits.match(/.{1,4}/g) || [];
      formatted = 'GN' + (groups.length > 0 ? '-' + groups.join('-') : '');
    } else {
      const groups = cleaned.match(/.{1,4}/g) || [];
      formatted = groups.join('-');
    }

    return formatted.substring(0, 17);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-body">
      
      {/* BLOC 1: EN-TÊTE ADMIN */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-title font-bold text-[#1A3A1C]">Centre de vérification</h2>
          <p className="text-xs text-[#78909C]">Vérification décentralisée des documents officiels</p>
        </div>
        {loadingStats ? (
           <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
           </div>
        ) : (
           <div className="flex flex-wrap gap-2 font-bold tracking-tighter uppercase">
             <span className="px-3 py-1 bg-surface-container-low text-[11px] text-outline rounded-full border border-outline-variant/20">{stats?.total || 0} vérifications</span>
             <span className="px-3 py-1 bg-green-50 text-[11px] text-green-700 rounded-full border border-green-200">✓ {stats?.successPct || '---'}% certifiés</span>
             <span className="px-3 py-1 bg-red-50 text-[11px] text-red-700 rounded-full border border-red-200">⚠ {stats?.fraudes || 0} fraudes</span>
           </div>
        )}
      </div>

      {/* BLOC 2: OUTIL DE VÉRIFICATION (STYLE PUBLIC) */}
      <div className="flex flex-col items-center gap-12 mt-6">
        <div className="w-full max-w-2xl space-y-8">
          <Reveal width="100%" direction="up" distance={50}>
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-surface-variant">
              <div className="flex border-b border-surface-variant">
                <button 
                  onClick={() => { setMethod('qr'); stopScanner(); }}
                  className={`flex-1 py-5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${method === 'qr' ? 'border-b-2 border-brand-green bg-green-50/50 text-brand-green' : 'text-outline hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-xl">qr_code_scanner</span>
                  Scanner QR Code
                </button>
                <button 
                  onClick={() => { setMethod('manual'); stopScanner(); }}
                  className={`flex-1 py-5 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${method === 'manual' ? 'border-b-2 border-brand-green bg-green-50/50 text-brand-green' : 'text-outline hover:bg-surface-container-low'}`}
                >
                  <span className="material-symbols-outlined text-xl">keyboard</span>
                  Saisie Manuelle
                </button>
              </div>
              
              <div className="p-8">
                {method === 'qr' ? (
                  <div className="relative bg-black aspect-video md:aspect-[16/9] rounded-xl overflow-hidden flex items-center justify-center group shadow-inner border border-white/5">
                    <div id="reader" className={`w-full h-full absolute inset-0 z-0 ${isCameraActive ? 'opacity-100 scale-105' : 'opacity-0'} transition-all duration-700`}></div>

                    <style>{`
                      #reader img { display: none !important; }
                      #reader__scan_region { border: none !important; }
                      #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
                      #reader div[style*="shading"] { display: none !important; }
                      
                      @keyframes scan-slow {
                        0% { top: 0%; }
                        50% { top: 100%; }
                        100% { top: 0%; }
                      }
                      .animate-scan-line-slow {
                        animation: scan-slow 4s ease-in-out infinite;
                      }
                    `}</style>

                    <div 
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => !isCameraActive && startScanner()}
                    >
                      {isCameraActive && (
                        <div className="absolute inset-0 pointer-events-none">
                          <svg className="w-full h-full">
                            <defs>
                              <mask id="focus-mask">
                                <rect width="100%" height="100%" fill="white" />
                                <rect x="25%" y="20%" width="50%" height="60%" rx="12" fill="black" />
                              </mask>
                            </defs>
                            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#focus-mask)" />
                            <rect x="25%" y="20%" width="50%" height="60%" rx="12" fill="none" stroke="rgba(0,148,96,0.3)" strokeWidth="1" />
                          </svg>
                        </div>
                      )}

                      {isCameraActive && (
                        <Reveal delay={0} direction="up" distance={0} width="100%">
                          <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] pointer-events-none z-20 overflow-hidden rounded-xl">
                            <div className="w-full h-1 bg-brand-green/60 shadow-[0_0_15px_#009460] absolute top-0 animate-scan-line-slow"></div>
                            <div className="w-full h-20 bg-gradient-to-b from-brand-green/20 to-transparent absolute top-0 animate-scan-line-slow opacity-30"></div>
                          </div>
                        </Reveal>
                      )}

                      <div className={`absolute top-[20%] left-[25%] w-[50%] h-[60%] pointer-events-none transition-opacity duration-500 ${isCameraActive ? 'opacity-100' : 'opacity-40'}`}>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-brand-green rounded-tl-lg shadow-[0_0_10px_rgba(0,148,96,0.4)]"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-brand-green rounded-tr-lg shadow-[0_0_10px_rgba(0,148,96,0.4)]"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-brand-green rounded-bl-lg shadow-[0_0_10px_rgba(0,148,96,0.4)]"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-brand-green rounded-br-lg shadow-[0_0_10px_rgba(0,148,96,0.4)]"></div>
                      </div>
                      
                      {!isCameraActive && (
                        <div className="text-center p-10 z-20 bg-black/60 backdrop-blur-md rounded-3xl border border-white/5 hover:scale-105 transition-transform duration-500">
                          <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-green/20 group-hover:border-brand-green/50 transition-colors">
                            <span className="material-symbols-outlined text-5xl text-brand-green animate-pulse">photo_camera</span>
                          </div>
                          <h4 className="text-white font-institutional text-xl italic mb-2">Initier le contrôle</h4>
                          <p className="text-brand-green font-black text-[10px] uppercase tracking-[0.3em]">
                            Cliquez pour activer la caméra
                          </p>
                        </div>
                      )}

                      {isCameraActive && (
                        <div className="absolute bottom-6 bg-[#004d33]/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-brand-green/30 shadow-2xl z-30">
                          <p className="text-brand-green text-[9px] uppercase font-black tracking-[0.2em] flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-brand-green rounded-full shadow-[0_0_5px_#009460] animate-pulse"></span>
                             Analyse de signature en cours
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn py-4">
                    <div>
                      <label className="block text-xs font-bold text-outline uppercase mb-1">Identifiant Unique (UID)</label>
                      <input 
                         className="w-full px-4 py-4 bg-surface-container-low border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary text-lg font-bold" 
                         placeholder="GN-XXXX-XXXX-XXXX" 
                         type="text"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(formatUID(e.target.value))}
                       />
                    </div>
                    <button onClick={() => handleVerify()} className="w-full bg-primary guinea-gradient-primary text-white font-bold py-4 rounded-lg shadow-xl text-lg tracking-widest">VÉRIFIER LE HASH</button>
                  </div>
                )}
                
                {method === 'qr' && (
                  <div className="mt-8 flex items-center gap-4 p-5 bg-surface-container-low rounded-lg border border-surface-variant">
                    <span className="material-symbols-outlined text-outline text-2xl">info</span>
                    <p className="text-sm text-on-surface-variant leading-relaxed">Assurez-vous que l'éclairage est suffisant pour une lecture optimale du condensat cryptographique par les nœuds blockchain.</p>
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Results Area */}
        {verifyStatus !== 'idle' && (
          <div ref={resultRef} className="w-full max-w-2xl space-y-8 animate-fadeInUp">
            
            {verifyStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-fadeIn bg-white rounded-2xl shadow-xl border border-outline-variant/10">
                <span className="h-12 w-12 border-4 border-brand-green/20 border-t-brand-green rounded-full animate-spin mb-4"></span>
                <p className="text-lg font-bold text-on-surface">Vérification cryptographique en cours...</p>
                <p className="text-xs uppercase font-bold text-outline tracking-widest mt-2">Connexion au nœud principal</p>
              </div>
            )}

            {verifyStatus === 'authentic' && (
              <Reveal width="100%" direction="up" distance={50}>
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border-t-[8px] border-brand-green">
                  <div className="bg-green-50/50 p-6 flex flex-col md:flex-row items-center justify-between border-b border-green-100 gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-green rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-green-200">
                        <span className="material-symbols-outlined fill-icon">verified</span>
                      </div>
                      <div>
                        <h2 className="font-institutional text-2xl font-bold text-brand-deepGreen uppercase tracking-tight">
                           Document Authentique
                         </h2>
                         <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-green/80 mt-0.5">
                           Signature Numérique Validée
                         </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-16 shadow-md rounded-sm overflow-hidden border border-black/10 opacity-90">
                        <div className="flex-1 bg-[#CE1126]"></div>
                        <div className="flex-1 bg-[#FCD116]"></div>
                        <div className="flex-1 bg-[#009460]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col items-center justify-center p-12">
                      <div className="relative w-full max-w-[580px] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                        <div className={`card-flip-inner shadow-xl rounded-xl ${isFlipped ? 'card-flipped' : ''}`}>
                           
                           {/* FRONT FACE (RECTO) - Relative for dynamic height */}
                           <div className="card-face !relative z-10 h-auto border border-white/20">
                              {resultData?.carteRectoUrl ? (
                                <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                                  <img 
                                   src={`http://localhost:4000${resultData.carteRectoUrl}`} 
                                   alt="CNI Recto Authentifiée" 
                                   className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                 <div className="w-full h-full relative rounded-xl overflow-hidden bg-white border border-outline-variant/10">
                                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#ce1126] via-[#fcd116] to-[#006747]"></div>
                                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#1A3A1C 1px, transparent 1px)', backgroundSize: '12px 12px' }}></div>
                                    <div className="p-5 h-full flex flex-col justify-between">
                                       <div className="flex justify-between items-start">
                                         <div className="flex items-center gap-2">
                                           <div className="w-8 h-8 bg-surface-container-low rounded-full"></div>
                                           <div className="space-y-0.5">
                                             <h3 className="text-[10px] uppercase font-black tracking-tight text-[#006747] leading-none">République de Guinée</h3>
                                             <p className="text-[6px] uppercase font-bold tracking-widest text-[#ce1126]">Carte Nationale d'Identité Biométrique</p>
                                           </div>
                                         </div>
                                       </div>
                                       <div className="flex gap-4 items-center">
                                         <div className="w-[85px] h-[110px] bg-slate-100 border-2 border-white shadow-md overflow-hidden shrink-0 rounded-sm"></div>
                                         <div className="flex-1 space-y-3">
                                           <div className="h-4 w-32 bg-slate-100 rounded"></div>
                                           <div className="h-6 w-full bg-slate-100 rounded"></div>
                                           <div className="h-4 w-full bg-slate-100 rounded"></div>
                                         </div>
                                       </div>
                                    </div>
                                 </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                           </div>

                           {/* BACK FACE (VERSO) */}
                           <div className="card-face card-back border border-white/20">
                              {resultData?.carteVersoUrl ? (
                                <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                                  <img 
                                   src={`http://localhost:4000${resultData.carteVersoUrl}`} 
                                   alt="CNI Verso Sécurisée" 
                                   className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-full bg-slate-50 border-2 border-dashed border-outline-variant/20 rounded-xl flex items-center justify-center">
                                   <p className="text-[12px] text-outline font-bold uppercase tracking-widest">Visuel Verso non généré</p>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform translate-x-[-100%] group-hover:translate-x-[100%]"></div>
                           </div>
                        </div>
                      </div>
                      
                      <p className="mt-6 text-[10px] text-brand-green font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse bg-brand-green/10 py-2 px-4 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">touch_app</span> 
                        Cliquez sur la carte pour inspecter le Verso
                      </p>
                    </div>
    
                    <div className="mt-6 p-5 bg-black rounded-xl border border-white/10 shadow-2xl text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-brand-green font-black">
                          <span className="material-symbols-outlined text-xl">security</span>
                          <h3 className="text-xs uppercase tracking-[0.1em]">Données Blockchain</h3>
                        </div>
                        <span className="text-[9px] font-black bg-brand-green text-white px-2 py-1 rounded-full shadow-[0_0_10px_rgba(0,148,96,0.3)]">CONFIANCE : <Counter value={100} />%</span>
                      </div>
                      <div className="space-y-2">
                        <div className="group">
                          <label className="text-[8px] font-black text-white/40 uppercase block mb-1 tracking-widest group-hover:text-brand-green transition-colors">Hash Cryptographique</label>
                          <code className="font-mono text-[10px] break-all text-brand-green/90 bg-white/5 p-3 rounded-lg block border border-white/5 italic select-all cursor-pointer hover:bg-white/10 transition-all">
                             {resultData?.blockchainHash || resultData?.blockchainTx?.txHash || 'Hachage non disponible pour ce document'}
                           </code>
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-6 text-center border-t border-outline-variant/20 pt-6">
                      <button onClick={() => setVerifyStatus('idle')} className="text-xs text-brand-green font-bold uppercase tracking-widest hover:bg-brand-green/10 px-6 py-2 rounded-lg transition-colors border border-brand-green/20">
                         Effectuer une nouvelle vérification
                      </button>
                    </div>

                  </div>
                </div>
              </Reveal>
            )}

            {verifyStatus === 'invalid' && (
              <Reveal width="100%" direction="up" distance={30}>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-red-200">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <h2 className="text-3xl font-institutional font-bold text-red-900 uppercase">Document Non Authentifié</h2>
                  <p className="text-red-700 mt-2 font-medium">L'identifiant fourni ne correspond à aucun enregistrement valide sur la blockchain nationale.</p>
                  
                  <div className="bg-white rounded-xl p-6 w-full mt-8 shadow-sm border border-red-100 text-left">
                    <p className="font-bold text-red-900 mb-4 uppercase tracking-widest text-xs">Protocoles de signalement</p>
                    <ul className="text-sm text-red-800/80 space-y-3 list-none">
                      <li className="flex items-start gap-3"><span className="material-symbols-outlined text-red-400 text-lg">check_circle</span> Assurez-vous de l'exactitude des caractères saisis.</li>
                      <li className="flex items-start gap-3"><span className="material-symbols-outlined text-red-400 text-lg">gavel</span> Le document a potentiellement fait l'objet d'une révocation.</li>
                      <li className="flex items-start gap-3"><span className="material-symbols-outlined text-red-400 text-lg">report_problem</span> Signalez l'anomalie aux autorités compétentes en cas de doute.</li>
                    </ul>
                    <button className="w-full mt-6 bg-red-600 text-white rounded-lg py-3 text-sm font-bold hover:bg-red-700 transition-colors shadow-md shadow-red-600/20">
                      Générer un rapport d'anomalie
                    </button>
                  </div>

                  <button onClick={() => setVerifyStatus('idle')} className="mt-8 text-xs text-red-800 font-bold uppercase tracking-widest hover:underline opacity-80 hover:opacity-100">
                    Réessayer
                  </button>
                </div>
              </Reveal>
            )}
          </div>
        )}
      </div>

      {/* BLOC 3: HISTORIQUE DES CONTRÔLES */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6 border-t border-outline-variant/10 pt-8">
          <h3 className="text-xl font-headline font-bold text-on-surface">Historique des Contrôles</h3>
          <span className="text-[10px] bg-surface-container-high px-2 py-1 rounded font-bold text-outline">TEMPS RÉEL</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
           <div className="bg-surface-container-low px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
              <h4 className="text-xs uppercase font-bold text-outline tracking-widest">Dernières vérifications effectuées</h4>
              <button className="text-xs text-primary font-bold hover:underline">Exporter le registre</button>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-lowest text-[10px] uppercase tracking-widest text-outline font-bold border-b border-outline-variant/10">
                   <tr>
                      <th className="px-6 py-3 font-semibold">Horodatage</th>
                      <th className="px-6 py-3 font-semibold">Demandeur</th>
                      <th className="px-6 py-3 font-semibold">Titulaire</th>
                      <th className="px-6 py-3 font-semibold">Résultat API</th>
                      <th className="px-6 py-3 font-semibold">Référence</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                   {loadingHistory ? (
                      <TableSkeleton columns={5} rows={3} />
                   ) : history.length > 0 ? history.map((row, i) => (
                      <tr key={i} className="hover:bg-surface-container-low transition-colors">
                         <td className="px-6 py-3 text-outline font-mono">{new Date(row.createdAt).toLocaleString()}</td>
                         <td className="px-6 py-3 font-bold text-on-surface-variant truncate max-w-[150px]">{row.institution}</td>
                         <td className="px-6 py-3 font-bold text-on-surface">{row.carte?.citoyen?.prenom} {row.carte?.citoyen?.nom}</td>
                         <td className="px-6 py-3">
                            <div className={`px-2 py-1 rounded inline-flex items-center gap-1.5 font-bold text-[10px] ${
                               row.resultat === 'VALIDE' ? 'bg-green-50 text-green-700' : 
                               row.resultat === 'INVALIDE' ? 'bg-red-50 text-red-700' : 
                               'bg-on-background text-white'
                            }`}>
                               <span className={`w-1.5 h-1.5 rounded-full ${row.resultat === 'VALIDE' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></span>
                               {row.resultat === 'VALIDE' ? 'AUTHENTIQUE' : row.resultat === 'INVALIDE' ? 'FRAUDE' : 'RÉVOQUÉ'}
                            </div>
                         </td>
                         <td className="px-6 py-3">
                            <span className="font-mono text-[10px] bg-surface-container-low px-1.5 py-0.5 rounded text-outline">{row.carte?.numeroCarte}</span>
                         </td>
                      </tr>
                   )) : (
                     <tr>
                       <td colSpan={5} className="px-6 py-12 text-center text-outline italic">Aucun log de vérification disponible</td>
                     </tr>
                   )}
                </tbody>
             </table>
           </div>
        </div>
      </div>
      
    </div>
  );
};

export default Verifications;
