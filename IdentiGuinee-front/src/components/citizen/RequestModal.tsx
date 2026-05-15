import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../../lib/axios';
import { citoyenService } from '../../services/citoyen.service';
import { demandeService } from '../../services/demande.service';
import { geoService, type GeoItem } from '../../services/geo.service';
import SignatureCanvas from 'react-signature-canvas';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSuccess: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, profile, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [regions, setRegions] = useState<GeoItem[]>([]);
  const [prefectures, setPrefectures] = useState<GeoItem[]>([]);
  const [sousPrefectures, setSousPrefectures] = useState<GeoItem[]>([]);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [hasFileError, setHasFileError] = useState(false);

  const sigCanvas = React.useRef<SignatureCanvas>(null);
  const [signatureBlob, setSignatureBlob] = useState<Blob | null>(null);
  
  const availableMotifs = React.useMemo(() => {
    if (!profile?.cartes || profile.cartes.length === 0) {
      return [{ value: 'PREMIERE_DEMANDE', label: 'Première demande' }];
    }
    
    const hasActiveCard = profile.cartes.find((c: any) => c.statut === 'ACTIVE');
    const hasExpiredCard = profile.cartes.find((c: any) => c.statut === 'EXPIREE');
    
    const options = [{ value: 'DUPLICATA', label: 'Duplicata (Perte)' }];
    
    if (hasExpiredCard) {
      options.push({ value: 'RENOUVELLEMENT', label: 'Renouvellement' });
    } else if (hasActiveCard && hasActiveCard.dateExpiration) {
       const sixMonthsFromNow = new Date();
       sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
       if (new Date(hasActiveCard.dateExpiration) <= sixMonthsFromNow) {
           options.push({ value: 'RENOUVELLEMENT', label: 'Renouvellement' });
       }
    }
    return options;
  }, [profile]);

  const [formData, setFormData] = useState({
    motif: availableMotifs[0]?.value || 'PREMIERE_DEMANDE',
    taille: profile?.taille || '',
    regionId: profile?.regionId || '',
    prefectureId: profile?.prefectureId || '',
    sousPrefectureId: profile?.sousPrefectureId || '',
    quartier: profile?.quartier || '',
    secteurVillage: profile?.secteurVillage || '',
    extraitId: '',
  });

  // Chargement initial des régions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await geoService.getRegions();
        setRegions(res.data || []);
      } catch (error) { console.error("Erreur régions:", error); }
    };
    if (isOpen) fetchRegions();
  }, [isOpen]);

  // Chargement des préfectures
  useEffect(() => {
    const fetchPrefectures = async () => {
      if (!formData.regionId) {
        setPrefectures([]);
        return;
      }
      setLoadingGeo(true);
      try {
        const res = await geoService.getPrefectures(formData.regionId);
        setPrefectures(res.data || []);
      } catch (error) { console.error("Erreur préfectures:", error); }
      finally { setLoadingGeo(false); }
    };
    fetchPrefectures();
  }, [formData.regionId]);

  // Chargement des sous-préfectures
  useEffect(() => {
    const fetchSousPrefectures = async () => {
      if (!formData.prefectureId) {
        setSousPrefectures([]);
        return;
      }
      setLoadingGeo(true);
      try {
        const res = await geoService.getSousPrefectures(formData.prefectureId);
        setSousPrefectures(res.data || []);
      } catch (error) { console.error("Erreur sous-préfectures:", error); }
      finally { setLoadingGeo(false); }
    };
    fetchSousPrefectures();
  }, [formData.prefectureId]);

  if (!isOpen) return null;



  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedPhoto = e.target.files[0];
      setPhoto(selectedPhoto);
      setPhotoPreview(URL.createObjectURL(selectedPhoto));
    }
  };

  const clearSignature = () => {
    sigCanvas.current?.clear();
    setSignatureBlob(null);
  };

  const handleSubmit = async () => {
    if (!file && formData.motif !== 'DUPLICATA') {
      toast.error("Veuillez télécharger votre extrait d'acte de naissance.");
      return;
    }

    if (!photo) {
      toast.error("Veuillez fournir une photo d'identité conforme.");
      return;
    }

    if (!signatureBlob) {
      toast.error("Veuillez remplir votre signature numérisée.");
      return;
    }

    setLoading(true);
    try {
      // 1. Update Profile (Height + Photo + Geo)
      const profileData = new FormData();
      profileData.append('taille', formData.taille);
      profileData.append('regionId', formData.regionId);
      profileData.append('prefectureId', formData.prefectureId);
      profileData.append('sousPrefectureId', formData.sousPrefectureId);
      profileData.append('quartier', formData.quartier);
      profileData.append('secteurVillage', formData.secteurVillage);
      if (photo) profileData.append('photo', photo);
      if (signatureBlob) {
        const file = new File([signatureBlob], "signature.png", { type: "image/png" });
        profileData.append('signature', file);
      }

      await citoyenService.updateMyProfile(profileData);

      // 2. Create Demande
      const data = new FormData();
      if (file) data.append('extrait', file);
      data.append('type', formData.motif);
      
      // On construit une adresse texte pour la table Demande par compatibilité
      const regionNom = regions.find(r => r.id === formData.regionId)?.nom || '';
      const prefectureNom = prefectures.find(p => p.id === formData.prefectureId)?.nom || '';
      const adresseTexte = `${formData.quartier}, ${prefectureNom}, ${regionNom}`;
      data.append('adresse', adresseTexte);
      if (formData.extraitId) data.append('extraitNaissanceId', formData.extraitId);

      await demandeService.create(data);
      toast.success('Demande soumise avec succès !');
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Erreur lors de la soumission';
      toast.error(errorMsg);
      // Retourner à l'étape des documents si c'est une erreur de fichier
      if (errorMsg.toLowerCase().includes('file') || errorMsg.toLowerCase().includes('large')) {
        setHasFileError(true);
        setStep(4);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/30 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/20">
        {/* Tricolor Accent line */}
        
        {/* Header - Compact & Elegant */}
        <div className="p-6 pb-4 shrink-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-headline font-bold text-primary leading-tight">Nouvelle Démarche</h3>
              <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Portail Identité Souveraine</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
          
          {/* Stepper - Compact */}
          <div className="flex items-center justify-between px-6 relative max-w-md mx-auto">
             <div className="absolute top-4 left-10 right-10 h-[1px] bg-outline-variant/30 -z-10"></div>
             {[
               { n: 1, l: 'Détails' },
               { n: 2, l: 'Photo' },
               { n: 3, l: 'Signature' },
               { n: 4, l: 'Documents' },
               { n: 5, l: 'Validation' }
             ].map(s => (
                <div key={s.n} className="flex flex-col items-center gap-1.5 min-w-[50px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all border-2 ${step >= s.n ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30' : 'bg-white border-outline-variant/30 text-outline'}`}>
                    {step > s.n ? <span className="material-symbols-outlined text-xs">check</span> : s.n}
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${step >= s.n ? 'text-primary' : 'text-outline/40'}`}>{s.l}</span>
                </div>
             ))}
          </div>
        </div>

        {/* Content - Compact Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-6 pt-2 custom-scrollbar">
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
               <div className="bg-primary/5 p-3 rounded-2xl border border-primary/10 text-on-surface-variant text-[11px] leading-relaxed flex gap-3 items-center">
                 <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-sm fill-icon">shield_person</span>
                 </div>
                 <p>Votre <strong>Identité Officielle</strong> est automatiquement associée à cette demande pour garantir la sécurité du processus.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Taille (cm)</label>
                   <div className="relative">
                      <input 
                       type="number"
                       value={formData.taille}
                       disabled={formData.motif !== 'PREMIERE_DEMANDE'}
                       onChange={(e) => setFormData({...formData, taille: e.target.value})}
                       placeholder="Ex: 175"
                       className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/60">CM</span>
                   </div>
                 </div>
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Motif de demande</label>
                   <select 
                    value={formData.motif}
                    onChange={(e) => setFormData({...formData, motif: e.target.value})}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface"
                   >
                     {availableMotifs.map(m => (
                       <option key={m.value} value={m.value}>{m.label}</option>
                     ))}
                   </select>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Région</label>
                    <select 
                      value={formData.regionId}
                      disabled={formData.motif !== 'PREMIERE_DEMANDE'}
                      onChange={(e) => setFormData({...formData, regionId: e.target.value, prefectureId: '', sousPrefectureId: ''})}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-50"
                    >
                      <option value="">Sélectionner une région</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.nom}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Préfecture</label>
                    <select 
                      value={formData.prefectureId}
                      disabled={formData.motif !== 'PREMIERE_DEMANDE' || !formData.regionId || loadingGeo}
                      onChange={(e) => setFormData({...formData, prefectureId: e.target.value, sousPrefectureId: ''})}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-50"
                    >
                      <option value="">Sélectionner une préfecture</option>
                      {prefectures.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                    </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Sous-Préfecture</label>
                    <select 
                      value={formData.sousPrefectureId}
                      disabled={formData.motif !== 'PREMIERE_DEMANDE' || !formData.prefectureId || loadingGeo}
                      onChange={(e) => setFormData({...formData, sousPrefectureId: e.target.value})}
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-50"
                    >
                      <option value="">Sélectionner une sous-préfecture</option>
                      {sousPrefectures.map(sp => <option key={sp.id} value={sp.id}>{sp.nom}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Quartier</label>
                    <input 
                      type="text"
                      value={formData.quartier}
                      disabled={formData.motif !== 'PREMIERE_DEMANDE'}
                      onChange={(e) => setFormData({...formData, quartier: e.target.value})}
                      placeholder="Ex: Kaloum"
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 px-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface disabled:opacity-50"
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                 <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1">Secteur / Village</label>
                 <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg">location_on</span>
                    <input 
                      type="text"
                      value={formData.secteurVillage}
                      disabled={formData.motif !== 'PREMIERE_DEMANDE'}
                      onChange={(e) => setFormData({...formData, secteurVillage: e.target.value})}
                      placeholder="Ex: Secteur 3, Rue des palmier"
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-medium text-sm text-on-surface placeholder:text-outline/40 disabled:opacity-50"
                    />
                 </div>
               </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                  <h4 className="font-headline font-bold text-lg text-primary">Photo d'Identité</h4>
                  <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Obligatoire pour la personnalisation de votre carte</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className={`w-36 h-36 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden transition-all ${photoPreview ? 'border-primary ring-4 ring-primary/10' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary'}`}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-outline/30">add_a_photo</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </label>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 max-w-sm">
                  <p className="text-[10px] text-orange-800 font-bold leading-relaxed">
                    💡 <strong>Conseil :</strong> Prenez votre photo sur un fond clair et uni, le visage bien dégagé et de face.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center space-y-1 mb-4">
                  <h4 className="font-headline font-bold text-lg text-primary">Signature Electronique</h4>
                  <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Signez dans le cadre ci-dessous</p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md bg-white border-2 border-dashed border-outline-variant/50 rounded-2xl overflow-hidden shadow-inner relative">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    canvasProps={{className: 'w-full h-48 cursor-crosshair'}}
                    penColor="#000"
                    backgroundColor="rgba(255,255,255,0)"
                  />
                  <div className="absolute inset-x-0 bottom-10 h-[1px] border-b border-dashed border-outline-variant/30 w-3/4 mx-auto pointer-events-none"></div>
                </div>
                <button 
                  onClick={clearSignature}
                  className="px-4 py-2 text-xs font-bold text-outline hover:text-red-500 flex items-center gap-2 transition-colors border border-outline-variant/20 rounded-full"
                >
                  <span className="material-symbols-outlined text-sm">ink_eraser</span> Effacer et recommencer
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
               <div className="text-center space-y-1 mb-4">
                  <h4 className="font-headline font-bold text-lg text-primary">Justificatifs</h4>
                  <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Document requis : Extrait de Naissance (PDF uniquement)</p>
               </div>
               
               <label className={`block border-2 border-dashed rounded-[2.5rem] p-10 transition-all cursor-pointer group text-center ${hasFileError ? 'border-red-500 bg-red-50 shadow-inner' : file ? 'border-primary bg-primary/5 shadow-inner' : 'border-outline-variant/30 bg-surface-container-low hover:border-primary hover:bg-white'}`}>
                 <input 
                  type="file" 
                  className="hidden" 
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (selectedFile && selectedFile.type !== 'application/pdf') {
                      toast.error('Seuls les fichiers PDF sont acceptés pour l\'extrait de naissance.');
                      e.target.value = '';
                      return;
                    }
                    if (selectedFile) {
                      setFile(selectedFile);
                      setHasFileError(false);
                    }
                  }} 
                  accept="application/pdf" 
                 />
                 <div className="flex flex-col items-center gap-3">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${file ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-surface-container-high text-outline group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-105'}`}>
                     <span className="material-symbols-outlined text-3xl">{file ? 'picture_as_pdf' : 'upload_file'}</span>
                   </div>
                   <div className="space-y-1">
                     <p className="font-bold text-sm text-on-surface">{file ? file.name : 'Cliquez pour uploader votre PDF'}</p>
                     <p className="text-[10px] text-outline uppercase tracking-tighter">{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Format PDF requis (Max 50MB)'}</p>
                   </div>
                   {file && !hasFileError && <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-4 py-1 rounded-full animate-fadeIn">Fichier prêt</span>}
                   {hasFileError && <span className="text-[10px] font-black text-red-600 uppercase tracking-widest bg-red-100 px-4 py-1 rounded-full animate-shake">Fichier trop lourd (Max 50MB)</span>}
                 </div>
               </label>

                <div className="space-y-1.5 px-4 animate-fadeIn">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-widest ml-1 text-left block">Numéro de l'Extrait de Naissance</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 text-lg">fingerprint</span>
                    <input 
                      type="text"
                      value={formData.extraitId}
                      onChange={(e) => setFormData({...formData, extraitId: e.target.value})}
                      placeholder="Ex: GN-2024-8849-22"
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl h-11 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:bg-white outline-none transition-all font-bold text-sm text-on-surface"
                    />
                  </div>
                  <p className="text-[9px] text-outline italic ml-1 mt-1">Saisissez l'identifiant unique figurant sur votre document officiel.</p>
                </div>
             </div>
          )}

          {step === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3 justify-center mb-1">
                 <div className="h-[1px] w-10 bg-outline-variant/40"></div>
                 <h4 className="font-headline font-bold text-base text-primary">Vérification Finale</h4>
                 <div className="h-[1px] w-10 bg-outline-variant/40"></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white border border-outline-variant/30 p-4 rounded-3xl shadow-sm text-center">
                    <p className="text-[9px] font-black text-outline uppercase mb-2 tracking-widest">Photo Choisie</p>
                    <div className="w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-primary/20">
                      <img src={photoPreview || (profile?.photoUrl ? `${API_BASE_URL}${profile.photoUrl}` : undefined)} alt="Profil" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] text-primary font-mono mt-1 font-bold bg-primary/5 px-2 py-0.5 rounded inline-block">NIN: {profile?.nin?.substring(0, 12) || 'GN-AUTH'}</p>
                 </div>
                 <div className="bg-primary/5 border border-primary/20 p-4 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-3xl flex items-center justify-center">
                       <span className="material-symbols-outlined text-primary text-xs fill-icon">description</span>
                    </div>
                    <p className="text-[9px] font-black text-primary uppercase mb-2 tracking-widest">Démarche</p>
                    <p className="text-sm font-bold text-primary">{formData.motif.replace('_', ' ')}</p>
                    <p className="text-[10px] text-primary/60 mt-1 font-bold uppercase">Biométrie GN</p>
                 </div>
              </div>

              <div className="bg-surface-container-low p-5 rounded-[2rem] border border-outline-variant/30 shadow-inner">
                 <div className="flex justify-between items-center text-[11px] font-bold">
                    <div className="flex items-center gap-4">
                       <span className="text-outline uppercase tracking-wider">Taille:</span>
                       <span className="text-on-surface bg-white px-3 py-1 rounded-full border border-outline-variant/20">{formData.taille} cm</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-outline uppercase tracking-wider">Sexe:</span>
                       <span className="text-on-surface bg-white px-3 py-1 rounded-full border border-outline-variant/20">{profile?.sexe === 'M' ? 'HOMME' : 'FEMME'}</span>
                    </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-outline-variant/30">
                    <span className="text-[11px] text-outline uppercase font-bold tracking-wider block mb-2">Adresse de résidence :</span>
                    <div className="flex gap-2 items-start">
                       <span className="material-symbols-outlined text-primary text-sm mt-0.5">location_on</span>
                       <span className="text-[11px] text-on-surface font-black uppercase leading-tight">
                         {formData.quartier 
                          ? `${formData.quartier}, ${prefectures.find(p => p.id === formData.prefectureId)?.nom || ''}, ${regions.find(r => r.id === formData.regionId)?.nom || ''}`
                          : 'NON RENSEIGNÉE'}
                       </span>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Integrated & Fixed */}
        <div className="p-6 bg-white shrink-0 border-t border-outline-variant/5 flex items-center justify-between gap-4">
           <button 
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className="px-6 py-2 text-[10px] font-black text-outline hover:text-on-surface transition-colors uppercase tracking-widest"
           >
             {step === 1 ? 'Annuler' : 'Précédent'}
           </button>
           
           <button 
            disabled={loading || (step === 4 && !file && formData.motif !== 'DUPLICATA') || (step === 2 && !photo)}
            onClick={async () => {
              if (step === 3) {
                if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
                  toast.error('Veuillez signer avant de continuer');
                  return;
                }
                const dataURL = sigCanvas.current.getCanvas().toDataURL('image/png');
                const res = await fetch(dataURL);
                const blob = await res.blob();
                setSignatureBlob(blob);
              }
              
              if (step < 5) setStep(step + 1);
              else await handleSubmit();
            }}
            className="flex-1 guinea-gradient-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/25 hover:shadow-xl transition-all disabled:opacity-40 uppercase tracking-widest flex items-center justify-center gap-3 group"
           >
             {loading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
               <>
                 <span className="text-xs">{step === 5 ? 'Confirmer la demande' : 'Continuer'}</span>
                 <span className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
               </>
             )}
           </button>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;
