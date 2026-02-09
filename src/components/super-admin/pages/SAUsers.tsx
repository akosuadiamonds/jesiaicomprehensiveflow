import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search } from 'lucide-react';

interface UserRow {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  user_role: string | null;
  school_name: string | null;
  selected_plan: string | null;
  created_at: string;
}

const SAUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setUsers((data as any[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = users.filter((u) => {
    const matchesSearch = !search || 
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (u.school_name || '').toLowerCase().includes(search.toLowerCase());
    const matchesTab = tab === 'all' || u.user_role === tab;
    return matchesSearch && matchesTab;
  });

  const roleBadge = (role: string | null) => {
    switch (role) {
      case 'teacher': return <Badge className="bg-blue-100 text-blue-700 border-0">Teacher</Badge>;
      case 'learner': return <Badge className="bg-purple-100 text-purple-700 border-0">Student</Badge>;
      case 'school_admin': return <Badge className="bg-orange-100 text-orange-700 border-0">School Admin</Badge>;
      case 'super_admin': return <Badge className="bg-red-100 text-red-700 border-0">Super Admin</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">Manage all platform users</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({users.length})</TabsTrigger>
          <TabsTrigger value="teacher">Teachers ({users.filter(u => u.user_role === 'teacher').length})</TabsTrigger>
          <TabsTrigger value="learner">Students ({users.filter(u => u.user_role === 'learner').length})</TabsTrigger>
          <TabsTrigger value="school_admin">School Admins ({users.filter(u => u.user_role === 'school_admin').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No users found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>School</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell>
                    <TableCell>{roleBadge(u.user_role)}</TableCell>
                    <TableCell className="text-muted-foreground">{u.school_name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{u.selected_plan || 'none'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SAUsers;
