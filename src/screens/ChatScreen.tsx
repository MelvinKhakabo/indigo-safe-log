import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ChevronLeftIcon, PrinterIcon, Share2Icon, XIcon, PaperclipIcon, MusicIcon, VideoIcon, FileIcon } from '../components/icons';
import { useIsMobile } from '../hooks/use-is-mobile';
import { Incident } from '../App';

type Attachment = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

interface ChatScreenProps {
  addIncident: (incident: Omit<Incident, 'id' | 'date'>) => void;
  navigateToDashboard: () => void;
}

const IncidentReport = ({ title, preview, attachments, onPrint, onCancel }) => {
  return (
    <div className="absolute inset-0 bg-slate-50 z-20 p-4 flex flex-col print:p-0 print:bg-white">
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3 print:text-3xl">Incident Report</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-600">Date</h3>
            <p className="text-slate-800">{new Date().toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600">Title</h3>
            <p className="text-slate-800 font-medium">{title}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600">Details</h3>
            <p className="text-slate-800 whitespace-pre-wrap">{preview}</p>
          </div>
          {attachments && attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-slate-600">Attachments</h3>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {attachments.map((file, index) => (
                  <div key={index} className="relative group border rounded-lg overflow-hidden">
                    {file.type.startsWith('image/') ? (
                      <img src={file.dataUrl} alt={file.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-slate-100 flex flex-col items-center justify-center p-2">
                        {file.type.startsWith('audio/') ? (
                          <MusicIcon className="h-8 w-8 text-slate-500" />
                        ) : file.type.startsWith('video/') ? (
                          <VideoIcon className="h-8 w-8 text-slate-500" />
                        ) : (
                          <FileIcon className="h-8 w-8 text-slate-500" />
                        )}
                        <p className="text-xs text-center text-slate-600 mt-2 truncate">{file.name}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <footer className="p-4 border-t border-slate-200 bg-white sticky bottom-0 flex items-center justify-end gap-4 print:hidden">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-700 rounded-md hover:bg-slate-100 flex items-center gap-2"
        >
          <XIcon className="h-4 w-4" />
          Cancel
        </button>
        <button
          onClick={onPrint}
          className="w-full sm:w-auto bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          style={{ minHeight: '44px', padding: '0 24px' }}
        >
          <PrinterIcon className="h-5 w-5 mr-2" />
          <span className="font-semibold">Print or Save as PDF</span>
        </button>
      </footer>
    </div>
  );
};

const ChatScreen = ({ addIncident, navigateToDashboard }: ChatScreenProps) => {
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const totalAttachments = attachments.length + files.length;

    if (totalAttachments > 5) {
      toast.error('You can upload a maximum of 5 files.');
      return;
    }

    files.forEach(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`File ${file.name} is too large. Max 10MB allowed.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAttachments(prev => [...prev, { name: file.name, type: file.type, size: file.size, dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
    
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const finishAndSave = useCallback(() => {
    if (title.trim() && preview.trim()) {
      addIncident({ title, preview, attachments });
      setIsPreviewing(false);
    } else {
      toast.error('Please provide a title and a brief preview for the incident.');
    }
  }, [title, preview, attachments, addIncident]);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const afterPrint = () => {
      finishAndSave();
    };

    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('afterprint', afterPrint);
    };
  }, [finishAndSave]);

  const handleSave = async () => {
    if (!title.trim() || !preview.trim()) {
      toast.error('Please provide a title and a brief preview for the incident.');
      return;
    }

    const reportText = `Incident Report\n\nDate: ${new Date().toLocaleString()}\nTitle: ${title}\nDetails: ${preview}`;

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: 'Incident Report',
          text: reportText,
        });
        toast.success('Incident ready for sharing!');
        finishAndSave();
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          toast.error('Could not share incident. Please try saving as PDF.');
          setIsPreviewing(true);
        }
      }
    } else {
      setIsPreviewing(true);
    }
  };

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-white relative">
      {isPreviewing && (
        <IncidentReport
          title={title}
          preview={preview}
          attachments={attachments}
          onPrint={handlePrint}
          onCancel={() => setIsPreviewing(false)}
        />
      )}
      <header className="flex items-center p-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
        <button onClick={navigateToDashboard} className="p-2 rounded-full hover:bg-slate-200">
          <ChevronLeftIcon className="h-6 w-6 text-slate-600" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 text-center flex-1">Log New Incident</h1>
        <div className="w-8 h-8"></div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-6">
          <p className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg">Provide incident details and optionally attach up to 5 files (images, audio, video). Max 10MB per file.</p>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Incident Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Verbal harassment on bus"
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="preview" className="block text-sm font-medium text-slate-700 mb-1">Incident Details</label>
            <textarea
              id="preview"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="Describe what happened in detail."
              rows={4}
              className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Attachments ({attachments.length}/5)</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
              {attachments.map((file, index) => (
                <div key={index} className="relative group border rounded-lg overflow-hidden">
                  {file.type.startsWith('image/') ? (
                    <img src={file.dataUrl} alt={file.name} className="w-full h-20 object-cover" />
                  ) : (
                    <div className="w-full h-20 bg-slate-100 flex flex-col items-center justify-center p-1">
                      {file.type.startsWith('audio/') ? (
                        <MusicIcon className="h-6 w-6 text-slate-500" />
                      ) : file.type.startsWith('video/') ? (
                        <VideoIcon className="h-6 w-6 text-slate-500" />
                      ) : (
                        <FileIcon className="h-6 w-6 text-slate-500" />
                      )}
                      <p className="text-xs text-center text-slate-600 mt-1 truncate">{file.name}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => handleRemoveAttachment(index)} 
                    className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-bl-lg opacity-75 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,audio/*,video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={attachments.length >= 5}
              className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{minHeight: '44px'}}
            >
              <PaperclipIcon className="h-5 w-5 mr-2" />
              Add Attachments
            </button>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white flex items-center justify-center rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          style={{ minHeight: '44px' }}
          disabled={!title.trim() || !preview.trim()}
        >
           {isMobile && navigator.share ? (
             <Share2Icon className="h-5 w-5 mr-2" />
           ) : (
             <PrinterIcon className="h-5 w-5 mr-2" />
           )}
          <span className="font-semibold">{isMobile && navigator.share ? 'Share & Save' : 'Preview & Save'}</span>
        </button>
      </footer>
    </div>
  );
};

export default ChatScreen;