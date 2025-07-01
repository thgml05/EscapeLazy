
interface GeminiTask {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedHours: number;
}

export const breakdownTask = async (apiKey: string, goal: string, deadline: string): Promise<GeminiTask[]> => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
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
    console.log('Gemini API 호출 시작:', { url, goal, deadline });
    
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

    console.log('API 응답 상태:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 에러 응답:', errorData);
      throw new Error(`API 요청 실패: ${response.status} - ${errorData.error?.message || '알 수 없는 오류'}`);
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
