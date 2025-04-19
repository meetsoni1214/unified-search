
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from 'lucide-react';

interface SearchResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

const SearchResultDialog = ({ isOpen, onClose, title, content }: SearchResultDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-morphism border-none">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="prose prose-invert mt-4 prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white/90 prose-code:text-blue-300 prose-em:text-gray-300 prose-a:text-blue-400">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchResultDialog;
