import { useEffect, useState } from 'react';
import DashboardScreen from './screens/DashboardScreen';
import ChatScreen from './screens/ChatScreen';
import { Toaster, toast } from 'sonner';

export interface Incident {
  id: string;
  title: string;
  date: string;
  preview: string;
  attachments: { name: string; type: string; dataUrl: string }[];
}

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'chat'>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    try {
      const savedIncidents = localStorage.getItem('incidents');
      return savedIncidents ? JSON.parse(savedIncidents) : [];
    } catch (error) {
      console.error("Failed to parse incidents from localStorage", error);
      const savedIncidents = localStorage.getItem('incidents');
      if (savedIncidents) {
        localStorage.setItem('incidents_backup', savedIncidents);
      }
      localStorage.removeItem('incidents');
      toast.error('Could not load previous incidents. Starting fresh.');
      return [];
    }
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      try {
        localStorage.setItem('userId', crypto.randomUUID());
      } catch (error) {
         console.error("Failed to generate and save user ID", error);
      }
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('incidents', JSON.stringify(incidents));
    } catch (error) {
      console.error("Failed to save incidents to localStorage", error);
      toast.error('Failed to save new incident due to storage limitations.');
    }
  }, [incidents]);

  const addIncident = (incident: Omit<Incident, 'id' | 'date'>) => {
    const newIncident: Incident = {
      ...incident,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setIncidents(prevIncidents => [newIncident, ...prevIncidents]);
    toast.success('New incident logged successfully!');
    setCurrentScreen('dashboard');
  };

  const navigateTo = (screen: 'dashboard' | 'chat') => {
    setCurrentScreen(screen);
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-900">
      <Toaster position="top-center" richColors />
      {currentScreen === 'dashboard' && (
        <DashboardScreen incidents={incidents} navigateToChat={() => navigateTo('chat')} />
      )}
      {currentScreen === 'chat' && (
        <ChatScreen addIncident={addIncident} navigateToDashboard={() => navigateTo('dashboard')} />
      )}
    </div>
  );
};

export default App;