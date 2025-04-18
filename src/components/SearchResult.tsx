
import { ExternalLink, Slack, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SearchResultProps {
  platform: 'slack' | 'jira' | 'confluence' | 'drive';
  title: string;
  preview: string;
  timestamp: string;
  link: string;
}

const platformIcons = {
  slack: Slack,
  jira: FileText,
  confluence: FileText,
  drive: FileText,
};

const platformColors = {
  slack: 'text-[#4A154B]',
  jira: 'text-[#0052CC]',
  confluence: 'text-[#0052CC]',
  drive: 'text-[#00AC47]',
};

const SearchResult = ({ platform, title, preview, timestamp, link }: SearchResultProps) => {
  const Icon = platformIcons[platform];
  const colorClass = platformColors[platform];

  return (
    <div className="glass-effect rounded-lg p-4 transition-all hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className={`mt-1 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
            <p className="text-gray-400 text-sm line-clamp-2">{preview}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-400 hover:text-white"
          onClick={() => window.open(link, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          Open
        </Button>
      </div>
    </div>
  );
};

export default SearchResult;
