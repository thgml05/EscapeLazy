
interface GeminiTask {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
}

export const breakdownTask = async (apiKey: string, goal: string, deadline: string): Promise<GeminiTask[]> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  const prompt = `
주어진 목표를 학생이 수행할 수 있는 구체적인 작업 단계로 나누어 주세요.

목표: ${goal}
마감일: ${deadline}

다음 JSON 형식으로 5-7개의 작업 단계를 만들어 주세요:
[
  {
    "title": "작업 제목 (간단명료하게)",
    "description": "구체적인 작업 내용과 방법 (2-3문장)",
    "difficulty": "easy|medium|hard",
    "estimatedHours": 숫자 (예상 소요 시간)
  }
]

조건:
- 각 작업은 하루 안에 완료 가능한 크기로 나누기
- 난이도는 고르게 분배 (쉬운 것부터 시작)
- 구체적이고 실행 가능한 작업으로 작성
- 한국어로 작성
- JSON 형식만 반환 (다른 텍스트 없이)
`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // JSON 파싱
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('올바른 JSON 형식을 찾을 수 없습니다.');
    }
    
    const tasks = JSON.parse(jsonMatch[0]);
    return tasks;
  } catch (error) {
    console.error('Gemini API 에러:', error);
    throw new Error('작업 분해 중 오류가 발생했습니다. API 키를 확인해주세요.');
  }
};
