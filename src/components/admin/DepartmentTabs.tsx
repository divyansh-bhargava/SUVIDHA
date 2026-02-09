import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { Zap, Droplets, Flame, Building2 } from 'lucide-react';
import type { Department, DepartmentStats } from '@/types/admin';
import { DEPARTMENT_LABELS } from '@/types/admin';

interface DepartmentTabsProps {
  stats: DepartmentStats[];
  selectedDepartment: Department | 'all';
  onSelect: (department: Department | 'all') => void;
  showAll?: boolean;
}

const DepartmentTabs: React.FC<DepartmentTabsProps> = ({
  stats,
  selectedDepartment,
  onSelect,
  showAll = true,
}) => {
  const { language } = useApp();

  const departmentIcons: Record<Department, React.ReactNode> = {
    electricity: <Zap className="w-5 h-5" />,
    water: <Droplets className="w-5 h-5" />,
    gas: <Flame className="w-5 h-5" />,
    municipal: <Building2 className="w-5 h-5" />,
  };

  const getStatForDepartment = (dept: Department) => {
    return stats.find(s => s.department === dept);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {showAll && (
        <button
          onClick={() => onSelect('all')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
            selectedDepartment === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          {language === 'en' ? 'All Departments' : 'सभी विभाग'}
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-sm">
            {stats.reduce((sum, s) => sum + s.pendingRequests, 0)}
          </span>
        </button>
      )}
      
      {(Object.keys(DEPARTMENT_LABELS) as Department[]).map((dept) => {
        const stat = getStatForDepartment(dept);
        return (
          <button
            key={dept}
            onClick={() => onSelect(dept)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              selectedDepartment === dept
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {departmentIcons[dept]}
            {DEPARTMENT_LABELS[dept][language]}
            {stat && stat.pendingRequests > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-sm ${
                selectedDepartment === dept ? 'bg-white/20' : 'bg-warning/20 text-warning'
              }`}>
                {stat.pendingRequests}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default DepartmentTabs;
