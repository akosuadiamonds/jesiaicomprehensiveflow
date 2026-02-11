import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  User, 
  BookOpen,
  Settings,
  Bell,
  Shield,
  Coins,
  Trophy,
  Edit2,
  Save,
  X,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

const StudentProfilePage: React.FC = () => {
  const { profile, user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone_number: profile?.phone_number || '',
    school_name: profile?.school_name || '',
  });

  // Term override: stored in localStorage per user
  const storageKey = user ? `jesi_term_override_${user.id}` : '';
  const [termOverride, setTermOverride] = useState<string>(() => {
    if (!storageKey) return '';
    return localStorage.getItem(storageKey) || '';
  });

  const getInitials = () => {
    const first = profile?.first_name?.[0] || '';
    const last = profile?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'S';
  };

  const handleSave = async () => {
    const { error } = await updateProfile(formData);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully! ✨');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone_number: profile?.phone_number || '',
      school_name: profile?.school_name || '',
    });
    setIsEditing(false);
  };

  const handleTermChange = (value: string) => {
    if (value === 'auto') {
      localStorage.removeItem(storageKey);
      setTermOverride('');
      toast.success('Term set to automatic detection');
    } else {
      localStorage.setItem(storageKey, value);
      setTermOverride(value);
      toast.success(`Term changed to ${value === '1' ? 'First' : value === '2' ? 'Second' : 'Third'} Term`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-amber-400/20 to-orange-500/20 border-0">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-3xl font-bold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-muted-foreground">{user?.email}</p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge variant="secondary" className="gap-1">
                  <Coins className="w-3 h-3" />
                  650 coins
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <Trophy className="w-3 h-3" />
                  Silver Badge
                </Badge>
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500">
                  Achiever Plan
                </Badge>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="gap-2">
            <User className="w-4 h-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="w-4 h-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-2">
            <Shield className="w-4 h-4" />
            Subscription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school">School Name</Label>
                  <Input
                    id="school"
                    value={formData.school_name}
                    onChange={(e) => setFormData({ ...formData, school_name: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Enter school name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(profile?.subjects || ['Mathematics', 'English', 'Science']).map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6 space-y-6">
          {/* Term Override */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Academic Term
              </CardTitle>
              <CardDescription>
                Change your term to learn ahead of your class or revisit previous material
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Learning Term</Label>
                <Select value={termOverride || 'auto'} onValueChange={handleTermChange}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">🔄 Auto-detect (based on date)</SelectItem>
                    <SelectItem value="1">📚 First Term (Sep - Dec)</SelectItem>
                    <SelectItem value="2">📖 Second Term (Jan - Mar)</SelectItem>
                    <SelectItem value="3">📝 Third Term (Apr - Jul)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {termOverride
                    ? `You are learning ${termOverride === '1' ? 'First' : termOverride === '2' ? 'Second' : 'Third'} Term content regardless of the current date.`
                    : 'The platform automatically detects the current term based on the Ghana school calendar.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Class announcements', desc: 'Get notified about new announcements', enabled: true },
                { label: 'New resources', desc: 'When teachers upload new materials', enabled: true },
                { label: 'Quiz reminders', desc: 'Remind me about upcoming quizzes', enabled: false },
                { label: 'Streak alerts', desc: 'Remind me to maintain my streak', enabled: true },
              ].map((setting, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.desc}</p>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-300 dark:border-amber-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 mb-2">
                      Most Popular
                    </Badge>
                    <h3 className="text-2xl font-bold">Achiever Plan</h3>
                    <p className="text-muted-foreground">GHS 15/month</p>
                  </div>
                  <div className="text-4xl">🏆</div>
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    'Full Learn Zone access',
                    'Unlimited practice questions',
                    'Join unlimited classrooms',
                    'AI-powered mock exams',
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full">
                  Upgrade to Champion
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentProfilePage;
