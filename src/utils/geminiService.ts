interface GeminiTask {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
}

// 기본 작업 템플릿들
const DEFAULT_TASK_TEMPLATES = {
  '학습/과제': [
    {
      title: 'Google Scholar에서 논문 3개 찾기',
      description:
        '1단계: Google Scholar(https://scholar.google.com/) 접속. 2단계: "주제 키워드" 검색하여 관련 논문 3개 찾기. 3단계: 각 논문의 제목, 저자, 발행연도, 핵심 내용을 Notion에 정리. 참고: 논문 제목 클릭하여 PDF 다운로드 가능한 것 우선 선택.',
      difficulty: 'easy' as const,
      estimatedHours: 2,
    },
    {
      title: '논문 내용 요약 정리',
      description:
        '1단계: 다운로드한 논문 3개 각각 읽기. 2단계: 각 논문의 핵심 내용을 2-3문단으로 요약하여 Notion에 정리. 3단계: 논문 간 공통점과 차이점 비교 분석하여 추가 메모. 참고: 논문의 Abstract, Introduction, Conclusion 부분 중점적으로 읽기.',
      difficulty: 'medium' as const,
      estimatedHours: 3,
    },
    {
      title: '서론 작성 (배경, 목적, 의의)',
      description:
        '1단계: Google Docs에서 새 문서 생성. 2단계: 서론 첫 문단 - 주제의 배경과 중요성 설명 (3문장). 3단계: 서론 둘째 문단 - 연구/과제의 목적 명시 (2문장). 4단계: 서론 셋째 문단 - 기대 효과와 의의 설명 (2문장). 참고: https://docs.google.com/',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: '본론 작성 (핵심 내용, 분석, 논의)',
      description:
        '1단계: 본론 첫 문단 - 수집한 자료들의 핵심 내용 정리 (4문장). 2단계: 본론 둘째 문단 - 자료 분석 결과 및 인사이트 도출 (4문장). 3단계: 본론 셋째 문단 - 논의 및 해석 (3문장). 4단계: 본론 넷째 문단 - 추가 고려사항 (3문장). 5단계: 본론 다섯째 문단 - 종합적 분석 (3문장).',
      difficulty: 'hard' as const,
      estimatedHours: 4,
    },
    {
      title: '결론 및 참고문헌 작성',
      description:
        '1단계: 결론 첫 문단 - 전체 내용 요약 (3문장). 2단계: 결론 둘째 문단 - 제언 및 향후 과제 (2문장). 3단계: 참고문헌 목록 작성 (논문 3개, 웹사이트 2개). 4단계: 표지, 목차 추가. 5단계: PDF로 저장. 참고: Word/Google Docs 내보내기 기능.',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
  ],
  프로젝트: [
    {
      title: 'VSCode 설치 및 프로젝트 폴더 생성',
      description:
        '1단계: VSCode 공식 사이트(https://code.visualstudio.com/)에서 다운로드 및 설치. 2단계: 필수 확장 설치 (Prettier, ESLint, Auto Rename Tag). 3단계: 프로젝트 폴더 생성 (예: calculator-project). 4단계: 터미널에서 npm init -y 실행하여 package.json 생성.',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
    {
      title: '프로젝트 요구사항 분석 및 계획',
      description:
        '1단계: Notion에서 프로젝트 요구사항 문서 생성. 2단계: 필요한 기능 목록 작성 (예: 사칙연산, UI, 배포). 3단계: 기술 스택 선택 (예: React, HTML/CSS/JS). 4단계: 개발 일정 및 마일스톤 설정. 참고: Notion 템플릿.',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: 'Figma에서 와이어프레임 3개 화면 설계',
      description:
        '1단계: Figma(https://figma.com/) 접속하여 새 프로젝트 생성. 2단계: 메인 화면 와이어프레임 설계 (계산기 UI, 버튼 배치). 3단계: 결과 화면 와이어프레임 설계 (계산 결과 표시). 4단계: 에러 화면 와이어프레임 설계 (잘못된 입력 처리). 참고: Figma 무료 템플릿.',
      difficulty: 'medium' as const,
      estimatedHours: 3,
    },
    {
      title: '덧셈 기능 구현',
      description:
        '1단계: VSCode에서 calculator.js 파일 생성. 2단계: add 함수 작성 (매개변수 2개 받아서 합계 반환). 3단계: 함수 테스트 (console.log로 1+2=3 확인). 4단계: 예외처리 추가 (숫자가 아닌 입력 처리). 예시 코드: function add(a, b) { return a + b; }',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: '뺄셈, 곱셈, 나눗셈 기능 구현',
      description:
        '1단계: subtract 함수 작성 (a - b 반환). 2단계: multiply 함수 작성 (a * b 반환). 3단계: divide 함수 작성 (a / b 반환, 0으로 나누기 예외처리). 4단계: 각 함수 테스트 (console.log로 결과 확인). 예시: function subtract(a, b) { return a - b; }',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: '계산기 UI 구현 (HTML/CSS)',
      description:
        '1단계: index.html 파일 생성하여 기본 구조 작성. 2단계: 계산기 버튼들 HTML로 작성 (숫자 0-9, 연산자 +-*/). 3단계: CSS로 계산기 디자인 (그리드 레이아웃, 버튼 스타일링). 4단계: 반응형 디자인 적용 (모바일 대응). 참고: CSS Grid/Flexbox.',
      difficulty: 'hard' as const,
      estimatedHours: 3,
    },
    {
      title: 'JavaScript로 계산기 동작 연결',
      description:
        '1단계: HTML 버튼들에 이벤트 리스너 추가 (addEventListener). 2단계: 숫자 입력 처리 (display에 숫자 표시). 3단계: 연산자 입력 처리 (이전 숫자 저장, 연산자 저장). 4단계: 등호 버튼 처리 (계산 실행, 결과 표시). 5단계: C 버튼 처리 (초기화).',
      difficulty: 'hard' as const,
      estimatedHours: 3,
    },
    {
      title: 'GitHub에 코드 업로드',
      description:
        '1단계: GitHub에서 새 저장소 생성 (calculator-project). 2단계: 터미널에서 git init, git add ., git commit -m "Initial commit". 3단계: git remote add origin [저장소URL], git push -u origin main. 4단계: README.md 파일 작성 (프로젝트 설명, 사용법). 참고: https://github.com/',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
    {
      title: 'Netlify로 배포',
      description:
        '1단계: Netlify(https://netlify.com/) 접속하여 회원가입. 2단계: "New site from Git" 클릭하여 GitHub 저장소 연결. 3단계: 배포 설정 (Build command: 없음, Publish directory: .). 4단계: 배포 확인 및 URL 복사. 5단계: GitHub README에 배포 URL 추가.',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
  ],
  일반: [
    {
      title: 'Notion에서 프로젝트 계획서 작성',
      description:
        '1단계: Notion(https://notion.so/) 접속하여 새 페이지 생성. 2단계: 프로젝트 제목, 목표, 마감일 입력. 3단계: 세부 작업 목록 작성 (체크박스로 5-7개 항목). 4단계: 우선순위 설정 (중요도/긴급도 매트릭스). 5단계: 일정 및 마일스톤 설정. 참고: Notion 할 일 템플릿.',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
    {
      title: '필요한 도구 및 자료 준비',
      description:
        '1단계: 프로젝트에 필요한 도구 목록 작성 (예: VSCode, Figma, GitHub). 2단계: 각 도구 설치 및 계정 생성. 3단계: 참고 자료 수집 (공식 문서, 튜토리얼 링크). 4단계: 작업 환경 정리 (폴더 구조, 파일 정리). 예시: Google Keep 체크리스트.',
      difficulty: 'easy' as const,
      estimatedHours: 2,
    },
    {
      title: '첫 번째 핵심 기능 구현',
      description:
        '1단계: 가장 기본적인 기능부터 시작 (예: 계산기라면 덧셈 기능). 2단계: 해당 기능의 코드 작성 및 테스트. 3단계: 동작 확인 및 디버깅. 4단계: 다음 기능으로 넘어가기 전 최종 점검. 참고: 관련 공식 문서, 예시 코드.',
      difficulty: 'medium' as const,
      estimatedHours: 3,
    },
    {
      title: '두 번째 핵심 기능 구현',
      description:
        '1단계: 두 번째 중요 기능 구현 (예: 계산기 뺄셈 기능). 2단계: 기존 기능과의 연동 확인. 3단계: 전체 동작 테스트. 4단계: 발견된 문제점 수정 및 개선. 참고: 관련 공식 문서, 예시 코드.',
      difficulty: 'medium' as const,
      estimatedHours: 3,
    },
    {
      title: '세 번째 핵심 기능 구현',
      description:
        '1단계: 세 번째 중요 기능 구현 (예: 계산기 곱셈 기능). 2단계: 기존 기능들과의 연동 확인. 3단계: 전체 동작 테스트. 4단계: 발견된 문제점 수정 및 개선. 참고: 관련 공식 문서, 예시 코드.',
      difficulty: 'medium' as const,
      estimatedHours: 3,
    },
    {
      title: 'UI/디자인 개선',
      description:
        '1단계: 현재 구현된 기능들의 UI 점검. 2단계: 사용자 경험 개선 (버튼 크기, 색상, 레이아웃). 3단계: 반응형 디자인 적용 (모바일, 태블릿 대응). 4단계: 접근성 개선 (키보드 네비게이션, 스크린 리더). 참고: CSS Grid/Flexbox, 반응형 디자인 가이드.',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: '테스트 및 최종 점검',
      description:
        '1단계: 모든 기능 동작 테스트 (각 기능별 개별 테스트). 2단계: 전체 플로우 테스트 (시작부터 끝까지). 3단계: 다양한 환경에서 테스트 (다른 브라우저, 기기). 4단계: 발견된 버그 수정 및 최종 점검. 참고: 브라우저 개발자 도구, 크로스 브라우징 테스트.',
      difficulty: 'medium' as const,
      estimatedHours: 2,
    },
    {
      title: '배포 및 제출 준비',
      description:
        '1단계: GitHub에 최종 코드 업로드 (git add, commit, push). 2단계: 배포 플랫폼에 배포 (Netlify, Vercel 등). 3단계: 배포 URL 확인 및 테스트. 4단계: 제출용 문서 작성 (README, 배포 URL, GitHub URL). 5단계: 최종 제출 전 최종 점검.',
      difficulty: 'easy' as const,
      estimatedHours: 1,
    },
  ],
};

// 목표 유형을 판단하는 함수
const categorizeGoal = (goal: string): keyof typeof DEFAULT_TASK_TEMPLATES => {
  const lowerGoal = goal.toLowerCase();

  if (
    lowerGoal.includes('과제') ||
    lowerGoal.includes('학습') ||
    lowerGoal.includes('공부') ||
    lowerGoal.includes('리포트') ||
    lowerGoal.includes('에세이') ||
    lowerGoal.includes('논문')
  ) {
    return '학습/과제';
  }

  if (
    lowerGoal.includes('프로젝트') ||
    lowerGoal.includes('개발') ||
    lowerGoal.includes('앱') ||
    lowerGoal.includes('웹사이트') ||
    lowerGoal.includes('시스템')
  ) {
    return '프로젝트';
  }

  return '일반';
};

// 기본 작업 분해 함수 (API 키 없이 사용)
export const breakdownTaskWithoutAPI = (
  goalTitle: string,
  goalDesc: string,
  goalContext: string,
  deadline: string
) => {
  const category = categorizeGoal(goalTitle);
  const template = DEFAULT_TASK_TEMPLATES[category];
  const contextText = goalContext ? `\n맥락/키워드: ${goalContext}` : '';
  // 목표에 맞게 템플릿을 조정
  const tasks = template.map((task, index) => ({
    ...task,
    title: `${task.title} - ${goalTitle}`,
    description: `${task.description}\n목표 설명: ${goalDesc}${contextText}`,
  }));
  return Promise.resolve(tasks);
};

export const breakdownTask = async (
  apiKey: string,
  goalTitle: string,
  goalDesc: string,
  goalContext: string,
  deadline: string
): Promise<GeminiTask[]> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `
당신은 학생들의 목표를 구체적이고 실행 가능한 작업으로 나누는 전문가입니다.

과제명/프로젝트명: ${goalTitle}
목표 설명: ${goalDesc}
맥락/키워드: ${goalContext}
마감일: ${deadline}

다음 JSON 형식으로 5-7개의 작업 단계를 만들어 주세요:
[
  {
    "title": "작업 제목 (간단명료하게)",
    "description": "구체적인 작업 내용과 방법, 예시(2-3문장, 예: 자료 3개 이상 수집, 각 섹션별 3문단 이상 작성 등)",
    "difficulty": "easy|medium|hard",
    "estimatedHours": 숫자 (예상 소요 시간)
  }
]

중요한 조건:
1. 각 작업은 반드시 구체적이고 실행 가능한 행동으로 작성
   - ❌ "UI 구현" → ✅ "Figma에서 와이어프레임 3개 화면 설계 후, React 컴포넌트 구조를 먼저 잡고, 최소한의 동작부터 구현"
   - ❌ "자료 조사" → ✅ "Google Scholar에서 '키워드' 검색하여 논문 3개 찾고, 각 논문의 핵심 내용을 Notion에 요약 정리"
   - ❌ "코딩" → ✅ "VSCode에서 프로젝트 폴더 생성 후, package.json 설정하고, 첫 번째 함수(예: 계산기 덧셈) 구현"

2. 각 작업의 description에는 반드시 포함:
   - 구체적인 단계별 행동 (1단계: ..., 2단계: ..., 3단계: ...)
   - 사용할 도구/웹사이트/앱 (예: "Figma", "Google Scholar", "VSCode")
   - 구체적인 수량/분량 (예: "3개 화면", "논문 3개", "3문단 이상")
   - 참고할 자료/링크 (예: "React 공식 문서", "Figma 무료 템플릿")
   - 예상 결과물 (예: "와이어프레임 파일", "요약 노트", "동작하는 함수")

3. 작업 순서는 반드시 논리적 의존성을 고려하여 정렬:
   - 1순위: 환경 설정, 준비 작업, 계획 수립 (설치, 세팅, 조사, 분석)
   - 2순위: 설계 및 기획 (와이어프레임, 구조 설계, 개요 작성)
   - 3순위: 핵심 기능 구현 (기본 기능부터 순차적으로)
   - 4순위: UI/UX 작업 (디자인, 스타일링)
   - 5순위: 테스트 및 검토 (디버깅, 수정, 점검)
   - 6순위: 배포 및 완료 (업로드, 제출, 정리)

4. 작업 크기: 하루 안에 완료 가능한 크기
5. 난이도 분배: 같은 순서 내에서는 쉬운 것부터 시작 (easy → medium → hard)
6. 과제명, 목표 설명, 맥락/키워드를 반드시 참고해서 분해
7. 한국어로 작성
8. JSON 형식만 반환 (다른 텍스트 없이)

예시:
- "객체지향 프로그래밍 계산기"라면:
  - "VSCode 설치 및 Java 개발환경 세팅 (JDK 설치, 환경변수 설정)"
  - "계산기 요구사항 분석 (사칙연산 기능, UI 요구사항을 Notion에 정리)"
  - "계산기 클래스 설계 (Calculator 클래스, 사칙연산 메서드 구조 설계)"
  - "덧셈 기능 구현 (add 메서드 작성, 단위 테스트 작성)"
  - "나머지 연산 기능 구현 (subtract, multiply, divide 메서드 작성)"
  - "간단한 콘솔 UI 구현 (Scanner로 입력받아 결과 출력)"
  - "테스트 및 최종 점검 (모든 연산 테스트, 예외처리 추가)"
`;

  try {
    console.log('Gemini API 호출 시작:', { url, goalTitle, deadline });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    console.log('API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 에러 응답:', errorData);
      throw new Error(
        `API 요청 실패: ${response.status} - ${
          errorData.error?.message || '알 수 없는 오류'
        }`
      );
    }

    const data = await response.json();
    console.log('API 응답 데이터:', data);

    const generatedText = data.candidates[0].content.parts[0].text;
    console.log('생성된 텍스트:', generatedText);

    // JSON 파싱
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('JSON 매치 실패:', generatedText);
      throw new Error('올바른 JSON 형식을 찾을 수 없습니다.');
    }

    const tasks = JSON.parse(jsonMatch[0]);
    console.log('파싱된 작업들:', tasks);
    return tasks;
  } catch (error) {
    console.error('Gemini API 에러:', error);
    throw new Error('작업 분해 중 오류가 발생했습니다. API 키를 확인해주세요.');
  }
};
