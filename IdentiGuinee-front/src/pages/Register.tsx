import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import RegisterForm from '../components/auth/RegisterForm';

const Register: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout 
      activeTab="signup" 
      onTabChange={(tab) => {
        if (tab === 'login') navigate('/login');
      }}
    >
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-title font-bold text-gray-800">Créer mon Identité Numérique</h2>
          <p className="text-[10px] text-gray-400 uppercase font-bold">Processus certifié conforme aux lois guinéennes</p>
        </div>
        
        <RegisterForm />
      </div>
    </AuthLayout>
  );
};

export default Register;
