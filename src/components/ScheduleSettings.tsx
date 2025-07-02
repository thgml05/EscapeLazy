import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Calendar, Clock, Settings } from 'lucide-react';

interface ScheduleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: ScheduleSettings) => void;
  currentSettings?: ScheduleSettings;
}

export interface ScheduleSettings {
  workDaysPerWeek: number;
  hoursPerDay: number;
  preferMorning: boolean;
  preferAfternoon: boolean;
  preferEvening: boolean;
  bufferDays: number;
}

const defaultSettings: ScheduleSettings = {
  workDaysPerWeek: 5,
  hoursPerDay: 4,
  preferMorning: true,
  preferAfternoon: true,
  preferEvening: false,
  bufferDays: 1,
};

export const ScheduleSettings = ({
  isOpen,
  onClose,
  onSave,
  currentSettings = defaultSettings,
}: ScheduleSettingsProps) => {
  const [settings, setSettings] = useState<ScheduleSettings>(currentSettings);

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6 rounded-2xl border-2 border-gray-200 shadow-large bg-white">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coral-100 to-sage-100 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-coral-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">일정 설정</h2>
              <p className="text-sm text-gray-600">
                나의 일정에 맞게 조정해보세요
              </p>
            </div>
          </div>

          {/* Work Days Per Week */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              주당 작업일 수
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.workDaysPerWeek]}
                onValueChange={([value]) =>
                  setSettings((prev) => ({ ...prev, workDaysPerWeek: value }))
                }
                max={7}
                min={1}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[2rem]">
                {settings.workDaysPerWeek}일
              </span>
            </div>
          </div>

          {/* Hours Per Day */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              일일 작업 시간
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.hoursPerDay]}
                onValueChange={([value]) =>
                  setSettings((prev) => ({ ...prev, hoursPerDay: value }))
                }
                max={8}
                min={1}
                step={0.5}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[3rem]">
                {settings.hoursPerDay}시간
              </span>
            </div>
          </div>

          {/* Preferred Time */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              선호하는 시간대
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={settings.preferMorning ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    preferMorning: !prev.preferMorning,
                  }))
                }
                className="rounded-xl"
              >
                오전
              </Button>
              <Button
                variant={settings.preferAfternoon ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    preferAfternoon: !prev.preferAfternoon,
                  }))
                }
                className="rounded-xl"
              >
                오후
              </Button>
              <Button
                variant={settings.preferEvening ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    preferEvening: !prev.preferEvening,
                  }))
                }
                className="rounded-xl"
              >
                저녁
              </Button>
            </div>
          </div>

          {/* Buffer Days */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              여유 시간 (일)
            </Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[settings.bufferDays]}
                onValueChange={([value]) =>
                  setSettings((prev) => ({ ...prev, bufferDays: value }))
                }
                max={3}
                min={0}
                step={1}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-600 min-w-[2rem]">
                {settings.bufferDays}일
              </span>
            </div>
            <p className="text-xs text-gray-500">
              예상보다 오래 걸릴 수 있으니 여유 시간을 두세요
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-gradient-to-r from-coral-500 to-coral-600 hover:from-coral-600 hover:to-coral-700 text-white"
            >
              저장
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
