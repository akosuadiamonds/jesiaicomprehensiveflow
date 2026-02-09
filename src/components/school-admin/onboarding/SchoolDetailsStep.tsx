import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Northern', 'Volta', 'Upper East', 'Upper West', 'Bono',
  'Bono East', 'Ahafo', 'Savannah', 'North East', 'Oti',
  'Western North',
];

const SchoolDetailsStep: React.FC = () => {
  const { setCurrentStep } = useOnboarding();
  const [schoolName, setSchoolName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const isValid = schoolName.trim() && city.trim() && region && phone.trim();

  const handleContinue = () => {
    // Store in localStorage for later use when creating institution
    localStorage.setItem('jesi_institution_details', JSON.stringify({
      name: schoolName, address, city, region, phone, email
    }));
    setCurrentStep('admin-select-package');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setCurrentStep('role')}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="space-y-2">
        <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-primary-foreground" />
        </div>
        <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
          School Details
        </h2>
        <p className="text-muted-foreground">
          Tell us about your institution
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="schoolName">School Name *</Label>
          <Input
            id="schoolName"
            placeholder="e.g. Accra Academy"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g. Accra"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region *</Label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0244 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="info@school.edu.gh"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleContinue}
        disabled={!isValid}
        className="w-full"
        size="lg"
        variant="hero"
      >
        Continue
      </Button>
    </div>
  );
};

export default SchoolDetailsStep;
