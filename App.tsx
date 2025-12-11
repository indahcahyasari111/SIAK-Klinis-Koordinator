import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Wallet, 
  CalendarClock, 
  Send, 
  Paperclip, 
  X,
  Menu,
  Activity
} from 'lucide-react';
import { AgentType, AGENT_DESCRIPTIONS, AGENT_COLORS, Message } from './types';
import { sendMessageToGemini } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import FinancialDashboard from './components/FinancialDashboard';

const App: React.FC = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType>(AgentType.COORDINATOR);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: '**Selamat datang di SIAK-Klinis.**\n\nSaya adalah Koordinator Sistem Rumah Sakit Anda. Silakan pilih modul di sebelah kiri atau ketik kebutuhan Anda di sini untuk saya arahkan.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<{name: string, data: string} | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const userMsgText = input;
    const userAttachment = attachment; // Capture current state
    
    // Reset input immediately for UX
    setInput('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add User Message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userMsgText,
      timestamp: new Date(),
      attachment: userAttachment ? { type: 'image', data: userAttachment.data } : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    // Call Gemini
    const responseText = await sendMessageToGemini(
      activeAgent, 
      userMsgText, 
      userAttachment?.data
    );

    // Add Bot Response
    const newBotMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newBotMessage]);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64String.split(',')[1];
        setAttachment({
          name: file.name,
          data: base64Data
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleAgentSwitch = (type: AgentType) => {
    setActiveAgent(type);
    // Optional: clear chat or add a divider system message when switching context
    setMessages(prev => [
        ...prev,
        {
            id: Date.now().toString(),
            role: 'model',
            text: `_Beralih ke mode: **${AGENT_DESCRIPTIONS[type]}**_`,
            timestamp: new Date()
        }
    ]);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
        <div className="md:hidden fixed z-20 top-4 left-4">
           <button onClick={() => setSidebarOpen(true)} className="p-2 bg-white shadow-md rounded-full text-slate-600">
             <Menu size={24} />
           </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 absolute md:relative z-30 w-64 h-full bg-slate-900 text-slate-100 flex flex-col shadow-xl`}>
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <Activity className="text-emerald-400" />
            <span>SIAK-Klinis</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <button
            onClick={() => handleAgentSwitch(AgentType.COORDINATOR)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeAgent === AgentType.COORDINATOR ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={20} />
            <div className="text-left">
              <div className="text-sm font-medium">Koordinator</div>
              <div className="text-xs opacity-70">Pusat & Routing</div>
            </div>
          </button>

          <button
            onClick={() => handleAgentSwitch(AgentType.CLINICAL)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeAgent === AgentType.CLINICAL ? 'bg-emerald-900/50 text-emerald-100 border border-emerald-800' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Stethoscope size={20} className={activeAgent === AgentType.CLINICAL ? 'text-emerald-400' : ''} />
            <div className="text-left">
              <div className="text-sm font-medium">Rekam Medis (RME)</div>
              <div className="text-xs opacity-70">Diagnosis AI & Data</div>
            </div>
          </button>

          <button
            onClick={() => handleAgentSwitch(AgentType.BILLING)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeAgent === AgentType.BILLING ? 'bg-blue-900/50 text-blue-100 border border-blue-800' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <Wallet size={20} className={activeAgent === AgentType.BILLING ? 'text-blue-400' : ''} />
            <div className="text-left">
              <div className="text-sm font-medium">Keuangan (BLU)</div>
              <div className="text-xs opacity-70">Tagihan & BPJS</div>
            </div>
          </button>

          <button
            onClick={() => handleAgentSwitch(AgentType.OPERATIONAL)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeAgent === AgentType.OPERATIONAL ? 'bg-amber-900/50 text-amber-100 border border-amber-800' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
          >
            <CalendarClock size={20} className={activeAgent === AgentType.OPERATIONAL ? 'text-amber-400' : ''} />
            <div className="text-left">
              <div className="text-sm font-medium">Operasional</div>
              <div className="text-xs opacity-70">Jadwal & Logistik</div>
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-700">
           <div className="text-xs text-slate-500 text-center">
             &copy; 2024 SIAK-Klinis<br/>
             Powered by Gemini AI & Vertex
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center gap-3 ml-8 md:ml-0">
             <div className={`w-3 h-3 rounded-full ${AGENT_COLORS[activeAgent].replace('bg-', 'bg-')}`}></div>
             <div>
               <h2 className="font-semibold text-slate-800">{AGENT_DESCRIPTIONS[activeAgent]}</h2>
               <p className="text-xs text-slate-500 hidden md:block">
                 {activeAgent === AgentType.CLINICAL ? 'Mode Aman: Enkripsi E2E Aktif' : activeAgent === AgentType.BILLING ? 'Koneksi: Cloud SQL Keuangan' : 'Sistem Aktif'}
               </p>
             </div>
          </div>
          <button onClick={clearChat} className="text-xs text-slate-400 hover:text-red-500 transition-colors">
            Hapus Riwayat
          </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            {/* Show Dashboard only on Billing tab */}
            {activeAgent === AgentType.BILLING && (
               <FinancialDashboard />
            )}

            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} agentType={activeAgent} />
            ))}
            
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-sm ml-2 animate-pulse mb-4">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                <span>SIAK sedang berpikir...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200">
          <div className="max-w-4xl mx-auto relative">
            {/* Attachment Preview */}
            {attachment && (
              <div className="absolute -top-16 left-0 bg-white p-2 rounded-lg shadow-md border border-slate-200 flex items-center gap-3 animate-fade-in-up">
                 <div className="h-10 w-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                    <img src={`data:image/png;base64,${attachment.data}`} className="object-cover w-full h-full" alt="preview" />
                 </div>
                 <span className="text-sm text-slate-600 truncate max-w-[150px]">{attachment.name}</span>
                 <button onClick={() => {setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = '';}} className="text-slate-400 hover:text-red-500">
                   <X size={16} />
                 </button>
              </div>
            )}

            <div className="flex gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className={`p-3 rounded-lg transition-colors flex-shrink-0 border ${
                  activeAgent === AgentType.CLINICAL 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-600'
                }`}
                title={activeAgent === AgentType.CLINICAL ? "Upload Gambar Medis (X-Ray/Lab)" : "Upload Lampiran"}
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                    activeAgent === AgentType.CLINICAL ? "Masukkan catatan klinis atau tanyakan hasil analisis gambar..." :
                    activeAgent === AgentType.BILLING ? "Tanyakan status klaim, CRR, atau draf laporan keuangan..." :
                    "Bagaimana saya dapat membantu operasional rumah sakit hari ini?"
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
              />

              <button
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !attachment)}
                className={`p-3 rounded-lg text-white transition-all shadow-sm flex-shrink-0 ${
                    isLoading || (!input.trim() && !attachment) ? 'bg-slate-300 cursor-not-allowed' :
                    activeAgent === AgentType.CLINICAL ? 'bg-emerald-600 hover:bg-emerald-700' :
                    activeAgent === AgentType.BILLING ? 'bg-blue-600 hover:bg-blue-700' :
                    activeAgent === AgentType.OPERATIONAL ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-slate-800 hover:bg-slate-900'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
            
            {/* Disclaimer */}
            <div className="text-center mt-2">
                <p className="text-[10px] text-slate-400">
                    SIAK-Klinis mematuhi UU PDP. Hasil analisis AI bukan pengganti diagnosis medis profesional. 
                    {activeAgent === AgentType.CLINICAL && <span className="text-emerald-600 font-medium ml-1">Mode Medis Aktif.</span>}
                </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;