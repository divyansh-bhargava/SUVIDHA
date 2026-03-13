import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ServiceTileProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  iconColor?: string;
  disabled?: boolean;
  badge?: {
    count?: number;
    type: 'pending' | 'clear' | 'alert';
  };
}

const ServiceTile: React.FC<ServiceTileProps> = ({ 
  icon: Icon, 
  label, 
  onClick, 
  iconColor = 'text-primary',
  disabled = false,
  badge
}) => {
  const getBadgeStyle = () => {
    if (!badge) return '';
    switch (badge.type) {
      case 'pending':
        return 'bg-warning text-warning-foreground shadow-lg';
      case 'alert':
        return 'bg-destructive text-destructive-foreground shadow-lg';
      case 'clear':
        return 'bg-success text-success-foreground shadow-lg';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getBadgeText = () => {
    if (!badge) return '';
    if (badge.count && badge.count > 0) {
      return badge.count.toString();
    }
    return badge.type === 'clear' ? '✓' : '!';
  };

  const getIconBgColor = () => {
    if (iconColor.includes('yellow')) return 'bg-yellow-500/10 group-hover:bg-yellow-500/20';
    if (iconColor.includes('blue')) return 'bg-blue-500/10 group-hover:bg-blue-500/20';
    if (iconColor.includes('orange')) return 'bg-orange-500/10 group-hover:bg-orange-500/20';
    return 'bg-primary/10 group-hover:bg-primary/20';
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl
        transition-all duration-200 cursor-pointer min-h-[160px]
        bg-white dark:bg-card border-2 border-border
        hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1
        active:scale-95 group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-2 -right-2 min-w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold px-2 ${getBadgeStyle()} z-10 animate-bounce-subtle border-2 border-white dark:border-card`}>
          {getBadgeText()}
        </div>
      )}
      
      {/* Icon Container */}
      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 ${getIconBgColor()} group-hover:scale-110 group-hover:rotate-3`}>
        <Icon className={`w-10 h-10 ${iconColor}`} />
      </div>
      
      {/* Label */}
      <span className="text-lg font-bold text-foreground text-center leading-tight px-2">
        {label}
      </span>
    </button>
  );
};

export default ServiceTile;
