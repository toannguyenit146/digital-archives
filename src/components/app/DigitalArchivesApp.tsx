// src/components/app/DigitalArchivesApp.tsx - Main App Component
import React, { useState } from 'react';
import { LoginScreen } from '../auth/LoginScreen';
import { MainApp } from './MainApp';
import { User } from '../../types/auth';

export const DigitalArchivesApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    console.log('App received login for user:', loggedInUser);
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    console.log('App handling logout');
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return <MainApp user={user} onLogout={handleLogout} />;
};
