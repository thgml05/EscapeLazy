import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, Achievement, UserStats } from '@/types/project';
import { getUserStats } from '@/utils/rewardService';
import {
  Trophy,
  Star,
  Target,
  TrendingUp,
  Award,
  Zap,
  Flame,
  Crown,
  Medal,
  Gift,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface RewardSystemProps {
  project?: any;
}

export const RewardSystem = ({ project }: RewardSystemProps) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    setStats(getUserStats());
  }, []);

  if (!stats) return null;

  const getLevelProgress = () => {
    const currentLevelPoints = (stats.currentLevel - 1) * 100;
    const nextLevelPoints = stats.currentLevel * 100;
    const progress =
      ((stats.totalPoints - currentLevelPoints) /
        (nextLevelPoints - currentLevelPoints)) *
      100;
    return Math.min(100, Math.max(0, progress));
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (level >= 5) return <Medal className="w-5 h-5 text-orange-500" />;
    if (level >= 3) return <Star className="w-5 h-5 text-blue-500" />;
    return <Target className="w-5 h-5 text-gray-500" />;
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 7) return <Zap className="w-5 h-5 text-yellow-500" />;
    if (streak >= 3) return <Flame className="w-5 h-5 text-orange-500" />;
    return <TrendingUp className="w-5 h-5 text-green-500" />;
  };

  return (
    <>
      <Card className="p-6 rounded-2xl border-2 border-gray-200 shadow-large bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            나의 성과
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBadgeModal(true)}
            className="rounded-xl border-2 border-gray-200 hover:border-coral-300"
          >
            <Award className="w-4 h-4 mr-2" />
            칭호 보기
          </Button>
        </div>

        {/* 레벨 및 포인트 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getLevelIcon(stats.currentLevel)}
              <span className="text-lg font-bold text-gray-800">
                레벨 {stats.currentLevel}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getLevelProgress()}%` }}
              />
            </div>
            <p className="text-sm text-gray-600">
              {stats.totalPoints} / {stats.currentLevel * 100} 포인트
            </p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Target className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold text-gray-800">
                완료한 작업
              </span>
            </div>
            <p className="text-2xl font-bold text-blue-600 mb-1">
              {stats.completedTasks}
            </p>
            <p className="text-sm text-gray-600">총 {stats.totalTasks}개 중</p>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getStreakIcon(stats.streakDays)}
              <span className="text-lg font-bold text-gray-800">연속 완료</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mb-1">
              {stats.streakDays}일
            </p>
            <p className="text-sm text-gray-600">연속으로 작업 완료!</p>
          </div>
        </div>

        {/* 최근 획득한 칭호 */}
        {stats.badges.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              최근 획득한 칭호
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.badges
                .slice(-3)
                .reverse()
                .map((badge) => (
                  <div
                    key={badge.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      setSelectedBadge(badge);
                      setShowBadgeModal(true);
                    }}
                  >
                    <span className="text-lg">{badge.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {badge.name}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 업적 진행도 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            업적 진행도
          </h3>
          <div className="space-y-3">
            {stats.achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">
                      {achievement.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {achievement.unlocked ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <Gift className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        +{achievement.points}점
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {achievement.condition}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 칭호 상세 모달 */}
      <Dialog open={showBadgeModal} onOpenChange={setShowBadgeModal}>
        <DialogContent className="sm:max-w-2xl rounded-2xl border-0 shadow-large bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              나의 칭호 컬렉션
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              획득한 칭호들을 확인해보세요!
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {stats.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedBadge?.id === badge.id
                    ? 'border-coral-400 bg-coral-50'
                    : 'border-gray-200 bg-white hover:border-coral-300'
                }`}
                onClick={() => setSelectedBadge(badge)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        획득:{' '}
                        {new Date(badge.earnedAt).toLocaleDateString('ko-KR')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
