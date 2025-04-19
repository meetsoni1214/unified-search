
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface SearchResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const SearchResultDialog = ({ isOpen, onClose, title, content }: SearchResultDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto neo-blur border-none p-0">
        <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
          <DialogHeader className="p-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-gradient">
                <FileText className="h-5 w-5" />
                <span className="truncate">{title}</span>
              </DialogTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-gray-400 hover:text-white hover:bg-white/5"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
        </div>
        
        <div className="divide-y divide-white/5">
          <div className="p-6 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white/90 prose-code:text-blue-300 prose-code:bg-white/5 prose-code:p-1 prose-code:rounded prose-em:text-gray-300 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
          
          <div className="p-4 bg-black/20 flex justify-end gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-white/5"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchResultDialog;
