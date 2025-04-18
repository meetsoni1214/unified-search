
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface APIKeysModalProps {
  onKeysChange: (keys: {
    pineconeApiKey: string;
    pineconeIndexName: string;
    openaiApiKey: string;
  }) => void;
}

const APIKeysModal = ({ onKeysChange }: APIKeysModalProps) => {
  const [pineconeApiKey, setPineconeApiKey] = useState("");
  const [pineconeIndexName, setPineconeIndexName] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Load saved keys from localStorage on component mount
  useEffect(() => {
    const savedPineconeKey = localStorage.getItem("pinecone_api_key") || "";
    const savedPineconeIndex = localStorage.getItem("pinecone_index_name") || "";
    const savedOpenaiKey = localStorage.getItem("openai_api_key") || "";
    
    setPineconeApiKey(savedPineconeKey);
    setPineconeIndexName(savedPineconeIndex);
    setOpenaiApiKey(savedOpenaiKey);
    
    if (savedPineconeKey && savedPineconeIndex && savedOpenaiKey) {
      onKeysChange({
        pineconeApiKey: savedPineconeKey,
        pineconeIndexName: savedPineconeIndex,
        openaiApiKey: savedOpenaiKey
      });
    }
  }, [onKeysChange]);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem("pinecone_api_key", pineconeApiKey);
    localStorage.setItem("pinecone_index_name", pineconeIndexName);
    localStorage.setItem("openai_api_key", openaiApiKey);
    
    // Notify parent component
    onKeysChange({
      pineconeApiKey,
      pineconeIndexName,
      openaiApiKey
    });
    
    setIsOpen(false);
    toast({
      title: "API keys saved",
      description: "Your API keys have been saved for this session",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Key className="h-4 w-4" />
          <span>API Keys</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>API Configuration</DialogTitle>
          <DialogDescription>
            Enter your Pinecone and OpenAI API keys to enable semantic search.
            <br />
            <span className="text-yellow-500 font-medium">
              Note: Keys are stored locally in your browser and are not sent to our servers.
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="pineconeApiKey">Pinecone API Key</Label>
            <Input
              id="pineconeApiKey"
              value={pineconeApiKey}
              onChange={(e) => setPineconeApiKey(e.target.value)}
              placeholder="Enter your Pinecone API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pineconeIndexName">Pinecone Index Name</Label>
            <Input
              id="pineconeIndexName"
              value={pineconeIndexName}
              onChange={(e) => setPineconeIndexName(e.target.value)}
              placeholder="Enter your Pinecone index name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
            <Input
              id="openaiApiKey"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="Enter your OpenAI API key for embeddings"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default APIKeysModal;
