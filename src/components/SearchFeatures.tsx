import { MessageSquare, FileText, Database } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: "Conversations",
    desc: "Search through Slack messages",
    color: "from-[#4A154B]/20 to-[#4A154B]/10"
  },
  {
    icon: FileText,
    title: "Documentation",
    desc: "Access Jira and Confluence",
    color: "from-[#0052CC]/20 to-[#0052CC]/10"
  },
  {
    icon: Database,
    title: "Files",
    desc: "Find documents in Drive",
    color: "from-[#00AC47]/20 to-[#00AC47]/10"
  }
];

export const SearchFeatures = () => {
  return (
    <div className="text-center space-y-8">
      <div className="text-white/70 max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-medium bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
          Search Across All Platforms
        </h2>
        <p className="text-lg text-white/50 leading-relaxed">
          Find everything you need in one place. Access your team's knowledge instantly.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {features.map((item, i) => (
            <div 
              key={i} 
              className="glass-effect p-6 rounded-xl relative overflow-hidden group hover:bg-white/5 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              <div className="relative z-10">
                <item.icon className="w-8 h-8 mb-4 text-white/60" />
                <h3 className="text-white font-medium mb-2">{item.title}</h3>
                <p className="text-sm text-white/50">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
