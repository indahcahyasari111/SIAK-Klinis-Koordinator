import React from 'react';
import { Message, AgentType } from '../types';
import { User, Bot, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
  agentType: AgentType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, agentType }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}>
      <div className={`flex max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200' : 'bg-white border border-slate-200 shadow-sm'}`}>
          {isUser ? <User size={16} className="text-slate-600" /> : <Bot size={16} className={agentType === AgentType.CLINICAL ? 'text-emerald-600' : agentType === AgentType.BILLING ? 'text-blue-600' : agentType === AgentType.OPERATIONAL ? 'text-amber-600' : 'text-slate-800'} />}
        </div>

        {/* Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed ${
            isUser 
              ? 'bg-slate-800 text-white rounded-tr-none' 
              : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
          }`}>
            {message.attachment && (
              <div className="mb-3">
                <img 
                  src={`data:image/png;base64,${message.attachment.data}`} 
                  alt="Uploaded content" 
                  className="max-w-full h-auto max-h-48 rounded-lg border border-slate-200"
                />
              </div>
            )}
            
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-headings:my-2 prose-headings:text-inherit prose-strong:text-inherit">
               <ReactMarkdown>{message.text}</ReactMarkdown>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;