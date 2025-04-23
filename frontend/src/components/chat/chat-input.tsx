import { useRef, useState } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({ onSubmit, isLoading, className }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSubmit(input);
    setInput('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('flex w-full items-center gap-2 p-4 bg-[#1e293b]', className)}
    >
      <textarea
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Type your message..."
        className="flex-1 resize-none rounded-lg border border-gray-600 bg-[#2e3b4e] px-3 py-2 text-sm text-gray-200 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        rows={1}
        disabled={isLoading}
      />
      <Button
        type="submit"
        disabled={!input.trim() || isLoading}
        className="shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
} 