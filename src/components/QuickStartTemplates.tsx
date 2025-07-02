import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, Code, FileText, Target, Zap } from 'lucide-react';

interface QuickStartTemplatesProps {
  onSelectTemplate: (goal: string) => void;
}

const templates = [
  {
    icon: BookOpen,
    title: '학습/과제',
    description: '리포트, 에세이, 논문 작성',
    examples: [
      '객체지향 프로그래밍 과제',
      '마케팅 리포트 작성',
      '영어 에세이 작성',
    ],
  },
  {
    icon: Code,
    title: '프로젝트',
    description: '개발, 앱, 웹사이트 제작',
    examples: ['포트폴리오 웹사이트', '모바일 앱 개발', '데이터 분석 프로젝트'],
  },
  {
    icon: FileText,
    title: '업무/일반',
    description: '업무 계획, 개인 목표',
    examples: ['분기별 업무 계획', '운동 루틴 만들기', '집 정리 정리'],
  },
];

export const QuickStartTemplates = ({
  onSelectTemplate,
}: QuickStartTemplatesProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-coral-100 to-sage-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Zap className="w-6 h-6 text-coral-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">빠른 시작</h3>
        <p className="text-sm text-gray-600">
          자주 사용하는 목표 유형을 선택하세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {templates.map((template, index) => (
          <Card
            key={index}
            className="p-4 rounded-2xl border-2 border-gray-200 hover:border-coral-300 transition-all duration-200 cursor-pointer hover:shadow-md"
            onClick={() => onSelectTemplate(template.examples[0])}
          >
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coral-100 to-sage-100 rounded-xl flex items-center justify-center">
                <template.icon className="w-5 h-5 text-coral-600" />
              </div>

              <div>
                <h4 className="font-semibold text-gray-800 mb-1">
                  {template.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                <div className="space-y-1">
                  {template.examples.map((example, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-xs text-gray-600 hover:text-coral-600 hover:bg-coral-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate(example);
                      }}
                    >
                      {example}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
