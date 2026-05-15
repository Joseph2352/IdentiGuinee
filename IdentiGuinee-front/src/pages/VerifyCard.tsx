import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
import { ShieldCheck, ShieldAlert, BadgeCheck, FileText, Globe, Clock, ArrowLeft } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  status: 'VALID' | 'TAMPERED' | 'INVALID';
  message: string;
  data?: {
    carte: {
      nom: string;
      prenom: string;
      numero: string;
      dateExpiration: string;
    };
    blockchain: {
      dateAncrage: number;
      revoquee: boolean;
    };
    isIntegrityOk: boolean;
  };
}

const VerifyCard: React.FC = () => {
  const { numeroCarte } = useParams<{ numeroCarte: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkIntegrity = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/blockchain/integrity/${numeroCarte}`);
        setResult(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors de la vérification');
      } finally {
        setLoading(false);
      }
    };

    if (numeroCarte) {
      checkIntegrity();
    }
  }, [numeroCarte]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium font-outfit">Vérification de l'intégrité sur la blockchain...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center text-sm text-primary hover:underline mb-6 font-outfit">
            <ArrowLeft className="w-4 h-4 mr-1" /> Retour à l'accueil
          </Link>
          <img src="/logo.png" alt="Logo IdentiGuinee" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 font-outfit uppercase tracking-wider">Service de Vérification</h1>
          <p className="text-gray-500 font-outfit">Authentification décentralisée IdentiGuinee</p>
        </div>

        {error || result?.status === 'INVALID' ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-500">
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 text-red-600 rounded-full mb-6">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 font-outfit">Carte Non Trouvée</h2>
              <p className="text-gray-600 font-outfit mb-6">
                {error || result?.message}
              </p>
              <div className="bg-red-50 rounded-2xl p-4 text-sm text-red-700 font-medium">
                Cette carte n'existe pas ou n'est plus valide dans nos registres officiels.
              </div>
            </div>
          </div>
        ) : (
          <div className={`bg-white rounded-3xl shadow-2xl overflow-hidden border ${result?.status === 'VALID' ? 'border-emerald-100' : 'border-red-500'} animate-in fade-in slide-in-from-bottom-6 duration-700`}>
            {/* Header Statut */}
            <div className={`p-6 text-center text-white ${result?.status === 'VALID' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-red-600'}`}>
              <div className="inline-flex items-center gap-2 text-xl font-bold font-outfit">
                {result?.status === 'VALID' ? (
                  <>
                    <BadgeCheck className="w-8 h-8" />
                    CARTE AUTHENTIFIÉE
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8" />
                    CARTE CORROMPUE
                  </>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Informations du Citoyen */}
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest font-outfit">Citoyen</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 leading-tight font-outfit">{result?.data?.carte.prenom} {result?.data?.carte.nom}</p>
                      <p className="text-sm text-gray-500">N° {result?.data?.carte.numero}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-outfit block mb-1">Expiration</label>
                    <p className="text-sm font-bold text-gray-900">{result?.data?.carte.dateExpiration ? new Date(result?.data?.carte.dateExpiration).toLocaleDateString() : '---'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-outfit block mb-1">Status</label>
                    <p className={`text-sm font-bold ${result?.data?.blockchain.revoquee ? 'text-red-600' : 'text-emerald-600'}`}>
                      {result?.data?.blockchain.revoquee ? 'RÉVOQUÉE' : 'ACTIVE'}
                    </p>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Preuve Blockchain */}
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Globe className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-blue-900 font-outfit">Certification Blockchain</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-outfit">
                      <span className="text-blue-700 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Date d'Ancrage</span>
                      <span className="font-bold text-blue-900">
                        {result?.data?.blockchain.dateAncrage ? new Date(result.data.blockchain.dateAncrage * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Inconnu'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-outfit">
                      <span className="text-blue-700 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Intégrité des données</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${result?.data?.isIntegrityOk ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {result?.data?.isIntegrityOk ? 'CONFORME' : 'ALTIÉRÉ'}
                      </span>
                    </div>
                  </div>
                </div>

                {result?.status === 'TAMPERED' && (
                  <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm font-medium border border-red-100">
                    ⚠ Les données locales ont été modifiées après l'émission. Ne vous fiez pas à ce document physique !
                  </div>
                )}
              </div>
              
              <p className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest font-outfit">
                Généré par IdentiGuinee Chain Gateway
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCard;
