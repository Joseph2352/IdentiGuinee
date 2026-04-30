import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Html5Qrcode } from 'html5-qrcode';
import Reveal from '../components/animations/Reveal';
import Counter from '../components/animations/Counter';
import { verificationService } from '../services/verification.service';

const Verification: React.FC = () => {
  const [method, setMethod] = useState<'qr' | 'manual'>('qr');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'authentic' | 'invalid'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [resultData, setResultData] = useState<any>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authentic' || status === 'invalid') {
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [status]);

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
    
    // Ensure cleanup of previous element content if any
    const readerElement = document.getElementById('reader');
    if (readerElement) readerElement.innerHTML = '';

    try {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
        },
        (decodedText) => {
          handleVerify(decodedText);
          stopScanner();
        },
        () => {
          // parse errors are normal
        }
      );
    } catch (err: any) {
      console.error("Impossible de démarrer la caméra:", err);
      
      // Handle the specific "Device in use" error with a better message
      if (err?.name === 'NotReadableError' || err?.message?.includes('Device in use')) {
        toast.error("La caméra est déjà utilisée par une autre application ou un autre onglet.");
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
      } catch (err) {
        console.error("Erreur d'arrêt scanner:", err);
      }
    }
  };

  const playSuccessSound = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, context.currentTime); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, context.currentTime + 0.1); // A4
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, context.currentTime + 0.3);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.3);
    
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleVerify = async (scannedValue?: string) => {
    let rawValue = scannedValue || searchQuery;
    let identifiantToSend = "";
    
    try {
      // Si la valeur commence par '{', (Ancien format JSON)
      if (rawValue.trim().startsWith('{')) {
        const parsedData = JSON.parse(rawValue);
        if (parsedData.numeroCarte) {
          identifiantToSend = parsedData.numeroCarte;
        } else if (parsedData.id) {
          // On passe l'UUID. Le backend a maintenant été renforcé pour gérer
          // la recherche par 'id' interne en fallback si 'numeroCarte' échoue.
          identifiantToSend = parsedData.id;
        }
      } else {
        // Saisie manuelle classique (GN-XXXX) ou lien URL scanné
        identifiantToSend = rawValue;
      }
    } catch (e) {
      identifiantToSend = rawValue;
    }

    if (!identifiantToSend) {
      toast.error('Veuillez saisir un UID ou scanner un code valide');
      return;
    }

    setStatus('scanning');
    try {
      // La recherche se fait STRICTEMENT via le paramètre numeroCarte comme demandé
      const response = await verificationService.verifierCarte({ numeroCarte: identifiantToSend });
      setResultData(response.data);
      setStatus('authentic');
      playSuccessSound();
      toast.success('Document authentifié');
    } catch (error: any) {
      setStatus('invalid');
      toast.error(error.response?.data?.message || 'Document non trouvé ou invalide');
    }
  };

  const formatUID = (value: string) => {
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    let formatted = cleaned;
    if (cleaned.startsWith('GN')) {
      const rest = cleaned.substring(2);
      const groups = rest.match(/.{1,4}/g) || [];
      formatted = 'GN' + (groups.length > 0 ? '-' + groups.join('-') : '');
    } else {
      const groups = cleaned.match(/.{1,4}/g) || [];
      formatted = groups.join('-');
    }
    return formatted.substring(0, 17); // Max length for GN-XXXX-XXXX-XXXX
  };

  return (
    <main className="max-w-7xl mx-auto px-6 pt-32 pb-12 bg-surface min-h-screen">
      <Reveal width="100%">
        <div className="mb-12 text-center flex flex-col items-center">
          <h1 className="font-institutional text-5xl font-bold text-on-surface mb-4 italic">Vérification de Document</h1>
          <p className="text-on-surface-variant max-w-2xl text-lg">Validez l'authenticité des titres d'identité via le registre national sécurisé par blockchain.</p>
        </div>
      </Reveal>

      <div className="flex flex-col items-center gap-12">
        {/* Verification Interface - Centered */}
        <div className="w-full max-w-2xl space-y-8">
          <Reveal direction="up" distance={50}>
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
                    {/* HTML5 QR Reader Container */}
                    <div id="reader" className={`w-full h-full absolute inset-0 z-0 ${isCameraActive ? 'opacity-100 scale-105' : 'opacity-0'} transition-all duration-700`}></div>

                    {/* CSS to hide library artifacts and add custom animations */}
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

                    {/* Premium UI Overlay */}
                    <div 
                      className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
                      onClick={() => !isCameraActive && startScanner()}
                    >
                      {/* Cinematic Focus Mask (Shown only when camera is active) */}
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
                            {/* Inner soft glow around scan zone */}
                            <rect x="25%" y="20%" width="50%" height="60%" rx="12" fill="none" stroke="rgba(0,148,96,0.3)" strokeWidth="1" />
                          </svg>
                        </div>
                      )}

                      {/* Moving Laser Line (Framer Motion) */}
                      {isCameraActive && (
                        <Reveal delay={0} direction="up" distance={0} width="100%">
                          <div className="absolute top-[20%] left-[25%] w-[50%] h-[60%] pointer-events-none z-20 overflow-hidden rounded-xl">
                            <div className="w-full h-1 bg-brand-green/60 shadow-[0_0_15px_#009460] absolute top-0 animate-scan-line-slow"></div>
                            {/* Subtle scan gradient */}
                            <div className="w-full h-20 bg-gradient-to-b from-brand-green/20 to-transparent absolute top-0 animate-scan-line-slow opacity-30"></div>
                          </div>
                        </Reveal>
                      )}

                      {/* Precision Glowing Corners */}
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
                
                <div className="mt-8 flex items-center gap-4 p-5 bg-surface-container-low rounded-lg border border-surface-variant">
                  <span className="material-symbols-outlined text-outline text-2xl">info</span>
                  <p className="text-sm text-on-surface-variant leading-relaxed">Assurez-vous que l'éclairage est suffisant pour une lecture optimale du condensat cryptographique par les nœuds blockchain.</p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Results Area - Below Scanner */}
        {status !== 'idle' && (
          <div ref={resultRef} className="w-full max-w-3xl space-y-8 animate-fadeInUp">
            {status === 'authentic' && (
              <Reveal direction="up" distance={50}>
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
                      {/* Drapeau de la Guinée en CSS */}
                      <div className="flex h-10 w-16 shadow-md rounded-sm overflow-hidden border border-black/10 opacity-90">
                        <div className="flex-1 bg-[#CE1126]"></div>
                        <div className="flex-1 bg-[#FCD116]"></div>
                        <div className="flex-1 bg-[#009460]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col items-center justify-center p-2">
                      {/* THE REAL BACKEND GENERATED CARD WITH 3D FLIP */}
                      <div className="relative w-full max-w-[580px] aspect-[1.586/1] perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                        <div className={`card-flip-inner shadow-xl rounded-xl ${isFlipped ? 'card-flipped' : ''}`}>
                           
                           {/* FRONT FACE (RECTO) */}
                           <div className="card-face border border-white/20">
                              {resultData?.carteRectoUrl ? (
                                <div className="w-full h-full rounded-xl overflow-hidden bg-white">
                                  <img 
                                   src={`http://localhost:4000${resultData.carteRectoUrl}`} 
                                   alt="CNI Recto Authentifiée" 
                                   className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                 /* FALLBACK RÉACT DESIGN PRÉMIUM (COPIÉ DE L'ESPACE CITOYEN) */
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
                  </div>
                </div>
              </Reveal>
            )}

            {status === 'invalid' && (
              <Reveal direction="up" distance={30}>
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-4xl mb-6 shadow-xl shadow-red-200">
                    <span className="material-symbols-outlined">warning</span>
                  </div>
                  <h2 className="text-3xl font-institutional font-bold text-red-900 uppercase">Document Non Authentifié</h2>
                  <p className="text-red-700 mt-4 max-w-lg font-medium leading-relaxed">
                    Cet identifiant n'a pas été trouvé dans le registre national souverain. 
                    Veuillez vérifier la saisie ou contacter les autorités compétentes.
                  </p>
                  <button onClick={() => setStatus('idle')} className="mt-8 px-8 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors shadow-lg">RÉESSAYER</button>
                </div>
              </Reveal>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Verification;
