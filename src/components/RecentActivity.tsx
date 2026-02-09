import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Zap, Droplets, Flame, Building2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Activity {
  id: string;
  service: 'electricity' | 'water' | 'gas' | 'municipal';
  action: string;
  actionHi: string;
  status: 'completed' | 'in_progress' | 'action_required';
  date: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    service: 'electricity',
    action: 'Electricity Bill – Paid',
    actionHi: 'बिजली बिल – भुगतान हो गया',
    status: 'completed',
    date: '2024-01-28',
  },
  {
    id: '2',
    service: 'water',
    action: 'Water Complaint – In Review',
    actionHi: 'पानी शिकायत – समीक्षाधीन',
    status: 'in_progress',
    date: '2024-01-27',
  },
  {
    id: '3',
    service: 'municipal',
    action: 'Address Update – Approved',
    actionHi: 'पता अपडेट – स्वीकृत',
    status: 'completed',
    date: '2024-01-25',
  },
];

const serviceIcons: Record<string, LucideIcon> = {
  electricity: Zap,
  water: Droplets,
  gas: Flame,
  municipal: Building2,
};

const serviceColors: Record<string, string> = {
  electricity: 'text-yellow-500 bg-yellow-500/10',
  water: 'text-blue-500 bg-blue-500/10',
  gas: 'text-orange-500 bg-orange-500/10',
  municipal: 'text-primary bg-primary/10',
};

const statusConfig: Record<string, { icon: LucideIcon; color: string; label: string; labelHi: string }> = {
  completed: {
    icon: CheckCircle2,
    color: 'text-success bg-success/10',
    label: 'Completed',
    labelHi: 'पूर्ण',
  },
  in_progress: {
    icon: Clock,
    color: 'text-warning bg-warning/10',
    label: 'In Progress',
    labelHi: 'प्रगति पर',
  },
  action_required: {
    icon: AlertCircle,
    color: 'text-destructive bg-destructive/10',
    label: 'Action Required',
    labelHi: 'कार्रवाई आवश्यक',
  },
};

const RecentActivity: React.FC = () => {
  const { language } = useApp();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
        <Clock className="w-6 h-6 text-primary" />
        {language === 'en' ? 'Recent Activity' : 'हाल की गतिविधि'}
      </h3>
      
      <div className="space-y-3">
        {mockActivities.map((activity) => {
          const ServiceIcon = serviceIcons[activity.service];
          const serviceColor = serviceColors[activity.service];
          const status = statusConfig[activity.status];
          const StatusIcon = status.icon;
          
          return (
            <div
              key={activity.id}
              className="kiosk-card p-4 flex items-center justify-between hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                {/* Service Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${serviceColor}`}>
                  <ServiceIcon className="w-6 h-6" />
                </div>
                
                {/* Action Text */}
                <div>
                  <p className="font-semibold text-foreground">
                    {language === 'en' ? activity.action : activity.actionHi}
                  </p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${status.color}`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'en' ? status.label : status.labelHi}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
