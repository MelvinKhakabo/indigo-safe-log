import { Incident } from '../App';
import { FileTextIcon, PlusIcon, PaperclipIcon } from '../components/icons';

interface DashboardScreenProps {
  incidents: Incident[];
  navigateToChat: () => void;
}

const DashboardScreen = ({ incidents, navigateToChat }: DashboardScreenProps) => {
  return (
    <div className="max-w-md mx-auto p-4 pt-8">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Amani Vault</h1>
        <p className="text-slate-600 mt-2">
          Your safety and privacy are our priority. You are anonymous here.
        </p>
      </header>

      <main>
        <div className="mb-8">
          <button
            onClick={navigateToChat}
            className="w-full bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            style={{ minHeight: '44px', padding: '12px 24px' }}
          >
            <PlusIcon className="h-6 w-6 mr-2" />
            <span className="text-lg font-semibold">Log New Incident</span>
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-2">
            Previous Incidents
          </h2>
          {incidents.length > 0 ? (
            <ul className="space-y-3">
              {incidents.map((incident) => (
                <li key={incident.id} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center min-w-0">
                       <FileTextIcon className="h-5 w-5 text-indigo-500 mr-3 flex-shrink-0" />
                       <div className="min-w-0">
                          <p className="font-semibold text-slate-800 truncate">{incident.title}</p>
                          <p className="text-sm text-slate-500 truncate">{incident.preview}</p>
                       </div>
                    </div>
                    <div className="flex items-center flex-shrink-0 pl-3">
                      {incident.attachments && incident.attachments.length > 0 && (
                        <PaperclipIcon className="h-4 w-4 text-slate-400 mr-2" />
                      )}
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(incident.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 px-4 bg-white rounded-lg border border-dashed border-slate-300">
                <p className="text-slate-500">You have no logged incidents.</p>
                <p className="text-sm text-slate-400 mt-1">Click the button above to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardScreen;