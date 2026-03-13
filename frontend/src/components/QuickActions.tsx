import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { CreditCard, MessageSquarePlus, Search, FolderOpen } from 'lucide-react';

const QuickActions: React.FC = () => {
  const { language, t } = useApp();
  const navigate = useNavigate();

  const actions = [
    {
      icon: CreditCard,
      label: language === 'en' ? 'Pay electricity Bill' : 'बिजली बिल भुगतान',
      path: '/service/electricity',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: MessageSquarePlus,
      label: t('registerComplaint'),
      path: '/complaint/register',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Search,
      label: language === 'en' ? 'Track Request' : 'अनुरोध ट्रैक करें',
      path: '/status',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: FolderOpen,
      label: language === 'en' ? 'My Documents' : 'मेरे दस्तावेज़',
      path: '/documents',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          {language === 'en' ? 'Quick Actions' : 'त्वरित कार्रवाई'}
        </h3>
        <p className="text-sm text-muted-foreground italic hidden md:block">
          {language === 'en' ? '"One-tap convenience"' : '"एक-टैप सुविधा"'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="kiosk-card p-5 flex flex-col items-center gap-3 hover:border-primary/30 hover:shadow-lg transition-all group hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className={`w-7 h-7 ${action.color}`} />
            </div>
            <span className="text-base font-semibold text-foreground text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
