import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export type FilterType = 'school' | 'district' | 'region' | 'class' | 'subject' | 'age' | 'gender' | 'disability' | 'academic_year' | 'rural_urban' | 'week' | 'month';

interface FilterConfig {
  type: FilterType;
  label: string;
  options: { value: string; label: string }[];
}

const FILTER_OPTIONS: Record<FilterType, { label: string; options: { value: string; label: string }[] }> = {
  school: {
    label: 'School',
    options: [
      { value: 'all', label: 'All Schools' },
      { value: 'school_a', label: 'Accra Academy' },
      { value: 'school_b', label: 'Presec Legon' },
      { value: 'school_c', label: 'Wesley Girls' },
      { value: 'school_d', label: 'Mfantsipim' },
      { value: 'school_e', label: 'Achimota School' },
    ],
  },
  district: {
    label: 'District',
    options: [
      { value: 'all', label: 'All Districts' },
      { value: 'accra_metro', label: 'Accra Metro' },
      { value: 'kumasi_metro', label: 'Kumasi Metro' },
      { value: 'tamale_metro', label: 'Tamale Metro' },
      { value: 'cape_coast', label: 'Cape Coast Metro' },
      { value: 'tema_metro', label: 'Tema Metro' },
    ],
  },
  region: {
    label: 'Region',
    options: [
      { value: 'all', label: 'All Regions' },
      { value: 'greater_accra', label: 'Greater Accra' },
      { value: 'ashanti', label: 'Ashanti' },
      { value: 'northern', label: 'Northern' },
      { value: 'western', label: 'Western' },
      { value: 'eastern', label: 'Eastern' },
      { value: 'central', label: 'Central' },
      { value: 'volta', label: 'Volta' },
    ],
  },
  class: {
    label: 'Class',
    options: [
      { value: 'all', label: 'All Classes' },
      { value: '1', label: 'Class 1' },
      { value: '2', label: 'Class 2' },
      { value: '3', label: 'Class 3' },
      { value: '4', label: 'Class 4' },
      { value: '5', label: 'Class 5' },
      { value: '6', label: 'Class 6' },
      { value: '7', label: 'Class 7' },
      { value: '8', label: 'Class 8' },
      { value: '9', label: 'Class 9' },
    ],
  },
  subject: {
    label: 'Subject',
    options: [
      { value: 'all', label: 'All Subjects' },
      { value: 'math', label: 'Mathematics' },
      { value: 'english', label: 'English' },
      { value: 'science', label: 'Science' },
      { value: 'social_studies', label: 'Social Studies' },
      { value: 'ict', label: 'ICT' },
      { value: 'french', label: 'French' },
    ],
  },
  age: {
    label: 'Age',
    options: [
      { value: 'all', label: 'All Ages' },
      { value: '6-8', label: '6 - 8 years' },
      { value: '9-11', label: '9 - 11 years' },
      { value: '12-14', label: '12 - 14 years' },
      { value: '15-17', label: '15 - 17 years' },
      { value: '18+', label: '18+ years' },
    ],
  },
  gender: {
    label: 'Gender',
    options: [
      { value: 'all', label: 'All Genders' },
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  disability: {
    label: 'Disability',
    options: [
      { value: 'all', label: 'All' },
      { value: 'none', label: 'No Disability' },
      { value: 'visual', label: 'Visual' },
      { value: 'hearing', label: 'Hearing' },
      { value: 'physical', label: 'Physical' },
      { value: 'learning', label: 'Learning' },
    ],
  },
  academic_year: {
    label: 'Academic Year',
    options: [
      { value: 'all', label: 'All Years' },
      { value: '2025-2026', label: '2025/2026' },
      { value: '2024-2025', label: '2024/2025' },
      { value: '2023-2024', label: '2023/2024' },
    ],
  },
  rural_urban: {
    label: 'Rural/Urban',
    options: [
      { value: 'all', label: 'All' },
      { value: 'rural', label: 'Rural' },
      { value: 'urban', label: 'Urban' },
      { value: 'peri_urban', label: 'Peri-Urban' },
    ],
  },
  week: {
    label: 'Week',
    options: [
      { value: 'all', label: 'All Weeks' },
      { value: 'this_week', label: 'This Week' },
      { value: 'last_week', label: 'Last Week' },
      { value: '2_weeks', label: 'Last 2 Weeks' },
      { value: '4_weeks', label: 'Last 4 Weeks' },
    ],
  },
  month: {
    label: 'Month',
    options: [
      { value: 'all', label: 'All Months' },
      { value: 'jan', label: 'January' },
      { value: 'feb', label: 'February' },
      { value: 'mar', label: 'March' },
      { value: 'apr', label: 'April' },
      { value: 'may', label: 'May' },
      { value: 'jun', label: 'June' },
      { value: 'jul', label: 'July' },
      { value: 'aug', label: 'August' },
      { value: 'sep', label: 'September' },
      { value: 'oct', label: 'October' },
      { value: 'nov', label: 'November' },
      { value: 'dec', label: 'December' },
    ],
  },
};

interface AnalyticsFiltersProps {
  filters: FilterType[];
  values: Record<string, string>;
  onChange: (filterType: string, value: string) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  values,
  onChange,
  showSearch = false,
  searchValue = '',
  onSearchChange,
}) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showSearch && onSearchChange && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-8 w-[180px]"
          />
        </div>
      )}
      {filters.map(filterType => {
        const config = FILTER_OPTIONS[filterType];
        return (
          <Select
            key={filterType}
            value={values[filterType] || 'all'}
            onValueChange={v => onChange(filterType, v)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={config.label} />
            </SelectTrigger>
            <SelectContent>
              {config.options.map(o => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
};

export default AnalyticsFilters;
