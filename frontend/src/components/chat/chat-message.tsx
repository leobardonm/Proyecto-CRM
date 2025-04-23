import { cn } from '@/lib/utils';
import { FiUser } from 'react-icons/fi';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  className?: string;
}

export function ChatMessage({ role, content, className }: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex w-full gap-4 p-4 rounded-lg',
        role === 'assistant' 
          ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50' 
          : 'bg-[#2e3b4e]',
        className
      )}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow',
          role === 'assistant'
            ? 'border-blue-500/20 bg-blue-500/10 text-blue-400'
            : 'border-purple-500/20 bg-purple-500/10 text-purple-400'
        )}
      >
        {role === 'assistant' ? 'AI' : <FiUser className="w-4 h-4" />}
      </div>
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <p className="text-gray-200">{content}</p>
        </div>
      </div>
    </div>
  );
} 