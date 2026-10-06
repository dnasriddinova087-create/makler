import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { BrokersPage } from './pages/BrokersPage';
import { ContractsPage } from './pages/ContractsPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { ChatPage } from './pages/ChatPage';
import { BrokerDashboardPage } from './pages/BrokerDashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AuthModal } from './components/AuthModal';
import { Property } from './types';

export const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [catalogFilters, setCatalogFilters] = useState<any>({});
  const [chatBrokerId, setChatBrokerId] = useState<string | null>(null);
  const [chatPropertyId, setChatPropertyId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const handleNavigate = (tab: string, extra?: any) => {
    if (tab === 'properties' && extra) {
      setCatalogFilters(extra);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProperty = (prop: Property) => {
    setSelectedProperty(prop);
    setCurrentTab('property-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartChat = (brokerId: string, propertyId?: string) => {
    setChatBrokerId(brokerId);
    setChatPropertyId(propertyId || null);
    setCurrentTab('chat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'properties') setCatalogFilters({});
          setCurrentTab(tab);
        }}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      <div style={{ flexGrow: 1 }}>
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectProperty={handleSelectProperty}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'properties' && (
          <PropertiesPage
            initialFilters={catalogFilters}
            onSelectProperty={handleSelectProperty}
          />
        )}

        {currentTab === 'property-detail' && selectedProperty && (
          <PropertyDetailPage
            propertyId={selectedProperty.id}
            onBack={() => setCurrentTab('properties')}
            onStartChat={handleStartChat}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'brokers' && (
          <BrokersPage
            onSelectProperty={handleSelectProperty}
            onStartChat={(brokerId) => handleStartChat(brokerId)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'contracts' && (
          <ContractsPage onOpenAuth={() => setAuthModalOpen(true)} />
        )}

        {currentTab === 'favorites' && (
          <FavoritesPage
            onSelectProperty={handleSelectProperty}
            onNavigate={handleNavigate}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'chat' && (
          <ChatPage
            initialBrokerId={chatBrokerId}
            initialPropertyId={chatPropertyId}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'broker-dashboard' && <BrokerDashboardPage />}

        {currentTab === 'admin' && <AdminPage />}
      </div>

      <Footer onNavigate={handleNavigate} />

      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
