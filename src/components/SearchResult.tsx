
import { ExternalLink, FileText, Clock, MessageSquare, FileCode, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SearchResultProps {
  platform: 'slack' | 'jira' | 'confluence' | 'drive';
  title: string;
  preview: string;
  timestamp: string;
  link: string;
  score?: number;
  content?: string;
  onClick?: () => void;
}

const platformIcons = {
  slack: MessageSquare,
  jira: FileCode,
  confluence: FileText,
  drive: FileSpreadsheet,
};

const platformColors = {
  slack: 'text-[#4A154B]',
  jira: 'text-[#0052CC]',
  confluence: 'text-[#0052CC]',
  drive: 'text-[#00AC47]',
};

const SearchResult = ({ platform, title, preview, timestamp, link, score, onClick }: SearchResultProps) => {
  const Icon = platformIcons[platform] || FileText;
  const colorClass = platformColors[platform] || 'text-gray-500';

  return (
    <div 
      className="glass-morphism rounded-lg p-4 transition-all hover:bg-white/5 cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-1 ${colorClass} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gradient mb-1">{title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{preview}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{timestamp}</span>
              {score !== undefined && (
                <span className="ml-2 bg-white/5 px-2 py-0.5 rounded-full">
                  Score: {score.toFixed(4)}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/5"
          onClick={(e) => {
            e.stopPropagation();
            window.open(link, '_blank');
          }}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open
        </Button>
      </div>
    </div>
  );
};

export default SearchResult;
