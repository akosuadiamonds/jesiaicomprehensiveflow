import React from 'react';
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
  Target
} from 'lucide-react';
import { toast } from 'sonner';

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

const rewards = [
  { name: 'Bronze Badge', coins: 100, icon: '🥉', unlocked: true },
  { name: 'Silver Badge', coins: 500, icon: '🥈', unlocked: true },
  { name: 'Gold Badge', coins: 1000, icon: '🥇', unlocked: false, progress: 65 },
  { name: 'Champion Badge', coins: 2500, icon: '👑', unlocked: false, progress: 26 },
];

const StreakZone: React.FC = () => {
  const totalCoins = 650;
  const currentStreak = 5;

  const handleClaimReward = () => {
    toast.success('🎁 Reward claimed!', {
      description: 'Keep up the great work!',
    });
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

        <Card className="bg-gradient-to-br from-purple-400 to-violet-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Weekly Goal</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-4xl font-bold">55</p>
                  <p className="text-purple-100">/ 100 coins</p>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Target className="w-8 h-8" />
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
          <CardDescription>
            Log in every day to maintain your streak and earn bonus coins!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between gap-2">
            {streakDays.map((day, index) => (
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
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      <earning.icon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{earning.source}</p>
                      <p className="text-xs text-muted-foreground">{earning.time}</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    +{earning.coins} 🪙
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards & Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Rewards & Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    reward.unlocked 
                      ? 'bg-gradient-to-r from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-950/20 border-amber-300 dark:border-amber-800' 
                      : 'bg-muted/50 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-3xl ${!reward.unlocked && 'grayscale opacity-50'}`}>
                        {reward.icon}
                      </span>
                      <div>
                        <p className="font-semibold">{reward.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {reward.coins} coins required
                        </p>
                      </div>
                    </div>
                    {reward.unlocked ? (
                      <Badge className="bg-green-500">Unlocked ✓</Badge>
                    ) : (
                      <Badge variant="outline">{reward.progress}%</Badge>
                    )}
                  </div>
                  {!reward.unlocked && (
                    <Progress value={reward.progress} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default StreakZone;
