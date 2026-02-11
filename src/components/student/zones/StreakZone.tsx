import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Flame,
  Coins,
  Trophy,
  Star,
  Gift,
  Calendar,
  TrendingUp,
  Zap,
  Award,
  Target,
  ShoppingBag,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Reward {
  id: string;
  name: string;
  description: string;
  cost: number;
  reward_type: string;
  icon: string;
}

const streakDays = [
  { day: 'Mon', active: true, coins: 10 },
  { day: 'Tue', active: true, coins: 10 },
  { day: 'Wed', active: true, coins: 10 },
  { day: 'Thu', active: true, coins: 10 },
  { day: 'Fri', active: true, coins: 15 },
  { day: 'Sat', active: false, coins: 0 },
  { day: 'Sun', active: false, coins: 0 },
];

const recentEarnings = [
  { source: 'Daily Login Streak', coins: 15, icon: Flame, time: '2 hours ago' },
  { source: 'Completed Math Quiz', coins: 25, icon: Target, time: '3 hours ago' },
  { source: 'Lesson Completed', coins: 10, icon: Star, time: 'Yesterday' },
  { source: 'Perfect Score Bonus', coins: 50, icon: Trophy, time: 'Yesterday' },
  { source: 'Class Participation', coins: 5, icon: Award, time: '2 days ago' },
];

const StreakZone: React.FC = () => {
  const { user } = useAuth();
  const totalCoins = 650;
  const currentStreak = 5;

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [confirmReward, setConfirmReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);

  const fetchRewards = async () => {
    setIsLoadingRewards(true);
    const { data } = await supabase
      .from('student_rewards')
      .select('*')
      .order('cost', { ascending: true });
    setRewards(data || []);

    if (user) {
      const { data: redeemed } = await supabase
        .from('student_redeemed_rewards')
        .select('reward_id')
        .eq('student_id', user.id);
      setRedeemedIds((redeemed || []).map(r => r.reward_id));
    }
    setIsLoadingRewards(false);
  };

  useEffect(() => {
    fetchRewards();
  }, [user]);

  const handleRedeem = async (reward: Reward) => {
    if (!user) return;
    if (totalCoins < reward.cost) {
      toast.error("Not enough coins! Keep earning! 💪");
      return;
    }

    setIsRedeeming(true);
    try {
      // Insert redemption record
      const { error } = await supabase
        .from('student_redeemed_rewards')
        .insert({ student_id: user.id, reward_id: reward.id });

      if (error) throw error;

      // Record coin spend transaction
      await supabase
        .from('coin_transactions')
        .insert({
          student_id: user.id,
          amount: reward.cost,
          transaction_type: 'spend',
          source: 'reward_redemption',
          description: `Redeemed: ${reward.name}`,
        });

      setRedeemedIds(prev => [...prev, reward.id]);
      setConfirmReward(null);
      toast.success(`🎉 You redeemed "${reward.name}"!`, {
        description: `${reward.cost} coins spent`,
      });
    } catch (err) {
      toast.error('Failed to redeem. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Coins</p>
                <p className="text-4xl font-bold mt-1">{totalCoins}</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Coins className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-400 to-rose-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Current Streak</p>
                <p className="text-4xl font-bold mt-1">{currentStreak} days 🔥</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Flame className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-emerald-400 to-green-500 text-white border-0 cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => setIsShopOpen(true)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Rewards Shop</p>
                <p className="text-xl font-bold mt-1">Redeem Coins 🎁</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Streak Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            This Week's Streak
          </CardTitle>
          <CardDescription>Log in every day to maintain your streak and earn bonus coins!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {streakDays.map((day) => (
              <div
                key={day.day}
                className={`flex-1 text-center p-3 rounded-xl transition-all ${
                  day.active
                    ? 'bg-gradient-to-b from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/30 border-2 border-amber-300 dark:border-amber-700'
                    : 'bg-muted border-2 border-transparent'
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">{day.day}</p>
                <div className={`text-2xl mb-1 ${day.active ? '' : 'grayscale opacity-30'}`}>
                  {day.active ? '🔥' : '⭕'}
                </div>
                {day.active && (
                  <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                    +{day.coins}
                  </Badge>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Complete 7 days for a bonus reward!</span>
            </div>
            <Badge variant="outline">2 days left</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEarnings.map((earning, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <earning.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{earning.source}</p>
                      <p className="text-xs text-muted-foreground">{earning.time}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-600">+{earning.coins} 🪙</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* My Rewards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              My Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            {redeemedIds.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🎁</div>
                <p className="text-muted-foreground text-sm">No rewards redeemed yet</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => setIsShopOpen(true)}>
                  Browse Rewards
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rewards.filter(r => redeemedIds.includes(r.id)).map((reward) => (
                  <div key={reward.id} className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <p className="font-semibold text-sm">{reward.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">{reward.reward_type}</Badge>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Weekly Leaderboard
          </CardTitle>
          <CardDescription>Top earners this week — can you make it to #1?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Ama K.', coins: 320, avatar: '👑', highlight: true },
              { rank: 2, name: 'Kwame A.', coins: 285, avatar: '🥈', highlight: false },
              { rank: 3, name: 'Abena M.', coins: 260, avatar: '🥉', highlight: false },
              { rank: 4, name: 'Yaw B.', coins: 210, avatar: '🔥', highlight: false },
              { rank: 5, name: 'Efua S.', coins: 195, avatar: '⭐', highlight: false },
              { rank: 6, name: 'Kofi D.', coins: 180, avatar: '💪', highlight: false },
              { rank: 7, name: 'You', coins: totalCoins > 0 ? 155 : 0, avatar: '🧑‍🎓', highlight: true },
            ].map((player) => (
              <div
                key={player.rank}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  player.highlight
                    ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-950/20 border border-amber-200 dark:border-amber-800'
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <span className="w-7 text-center font-bold text-sm text-muted-foreground">#{player.rank}</span>
                <span className="text-xl">{player.avatar}</span>
                <span className={`flex-1 font-medium text-sm ${player.name === 'You' ? 'text-primary font-bold' : ''}`}>
                  {player.name}
                </span>
                <Badge className="bg-amber-500 hover:bg-amber-600">{player.coins} 🪙</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card className="bg-gradient-to-r from-secondary/50 to-secondary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            How to Earn Coins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: 'Daily Login', coins: '10-20', emoji: '📅' },
              { action: 'Complete Lesson', coins: '5-15', emoji: '📚' },
              { action: 'Quiz Score 80%+', coins: '20-30', emoji: '✅' },
              { action: 'Perfect Score', coins: '50', emoji: '🏆' },
            ].map((item, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-background/50">
                <span className="text-3xl">{item.emoji}</span>
                <p className="font-medium text-sm mt-2">{item.action}</p>
                <p className="text-xs text-muted-foreground">+{item.coins} coins</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Shop Dialog */}
      <Dialog open={isShopOpen} onOpenChange={setIsShopOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Rewards Shop
            </DialogTitle>
            <DialogDescription>
              Spend your coins on rewards! You have <span className="font-bold text-amber-500">{totalCoins} 🪙</span>
            </DialogDescription>
          </DialogHeader>

          {isLoadingRewards ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => {
                const isRedeemed = redeemedIds.includes(reward.id);
                const canAfford = totalCoins >= reward.cost;
                return (
                  <div
                    key={reward.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isRedeemed
                        ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
                        : canAfford
                          ? 'border-border hover:border-primary/50 cursor-pointer'
                          : 'border-border opacity-60'
                    }`}
                    onClick={() => !isRedeemed && canAfford && setConfirmReward(reward)}
                  >
                    <span className="text-3xl">{reward.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{reward.name}</p>
                      <p className="text-xs text-muted-foreground">{reward.description}</p>
                      <Badge variant="outline" className="text-xs capitalize mt-1">{reward.reward_type}</Badge>
                    </div>
                    {isRedeemed ? (
                      <Badge className="bg-green-500">Owned ✓</Badge>
                    ) : (
                      <Badge variant="secondary" className="whitespace-nowrap">{reward.cost} 🪙</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Redeem Dialog */}
      <Dialog open={!!confirmReward} onOpenChange={() => setConfirmReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem Reward?</DialogTitle>
            <DialogDescription>
              Spend <span className="font-bold text-amber-500">{confirmReward?.cost} coins</span> to get "{confirmReward?.name}"?
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <span className="text-6xl">{confirmReward?.icon}</span>
            <p className="mt-2 text-sm text-muted-foreground">{confirmReward?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmReward(null)}>Cancel</Button>
            <Button onClick={() => confirmReward && handleRedeem(confirmReward)} disabled={isRedeeming}>
              {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Redeem for {confirmReward?.cost} 🪙
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StreakZone;
