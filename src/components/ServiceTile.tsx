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
        return 'bg-warning text-warning-foreground';
      case 'alert':
        return 'bg-destructive text-destructive-foreground';
      case 'clear':
        return 'bg-success text-success-foreground';
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

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`service-tile group relative ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-2 -right-2 min-w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold px-2 ${getBadgeStyle()} shadow-md z-10`}>
          {getBadgeText()}
        </div>
      )}
      
      <div className={`service-tile-icon group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-10 h-10 ${iconColor}`} />
      </div>
      <span className="text-xl font-semibold text-foreground text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

export default ServiceTile;
