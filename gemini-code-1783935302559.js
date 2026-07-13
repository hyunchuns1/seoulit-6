document.addEventListener('DOMContentLoaded', () => {
  // 테마 토글 및 자동 연도 로직 (기존 포트폴리오와 완벽 결합)
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  if (toggle) {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = saved || (prefersDark ? 'dark' : 'light');
    root.setAttribute('data-theme', initial);
    toggle.textContent = initial === 'dark' ? '☀️' : '🌙';

    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      toggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // ==========================================
  // MBTI 데이터셋 및 제어 변수 정의
  // ==========================================
  const questions = [
    { q: "새 프로젝트를 시작할 때 당신의 행동은?", a1: "팀원들과 회의를 소집해 브레인스토밍을 한다 (E)", a2: "먼저 혼자 기술 문서를 분석하고 구조를 생각한다 (I)", type: "EI" },
    { q: "문제가 발생했을 때 더 신뢰하는 정보는?", a1: "기존 로그 데이터와 명확히 검증된 트레이싱 이력 (S)", a2: "시스템 아키텍처의 흐름과 직관적 통찰 (N)", type: "SN" },
    { q: "팀원의 코드 리뷰를 할 때 당신의 성향은?", a1: "구조적 결함이나 규칙 위반을 냉정하게 피드백한다 (T)", a2: "팀원의 의도를 먼저 고려하고 유연하게 조언한다 (F)", type: "TF" },
    { q: "개발 주간 일정을 조율할 때 선호하는 방식은?", a1: "마일스톤과 주차별 작업 태스크를 완벽하게 고정한다 (J)", a2: "진행 상황에 맞춰 스프린트 단위를 유동적으로 변경한다 (P)", type: "JP" },
    // 필요에 따라 아래에 유사 포맷으로 문항을 추가 확장하여 12문항을 맞추면 배치 완료됩니다.
  ];

  // 각 지표별 점수 기록 오브젝트
  let scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  let currentIdx = 0;

  const resultData = {
    "INTJ": { title: "완벽주의 전략가", desc: "독립적이고 전략적인 마인드를 가졌습니다. 인프라의 거대한 청사진을 그리고 자동화하는 아키텍트 직무에 완벽하게 매칭됩니다." },
    "ENFP": { title: "재기발람한 스파크형 크리에이터", desc: "새로운 기술 스택이나 프레임워크 탐색을 좋아하며 뛰어난 소통 능력으로 팀의 에너지를 끌어올립니다." },
    // 필요한 MBTI 결과들을 여기에 사전 선언해두면 자동으로 맵핑됩니다.
  };

  // DOM 선언
  const startScreen = document.getElementById('start-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const loadingScreen = document.getElementById('loading-screen');
  const resultScreen = document.getElementById('result-screen');

  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const questionText = document.getElementById('question-text');
  const optionBtns = document.querySelectorAll('.option-btn');
  const progressIndicator = document.getElementById('progress-indicator');
  const progressText = document.getElementById('progress-text');

  // 이벤트: 시작
  startBtn.addEventListener('click', () => {
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    showQuestion();
  });

  // 질문 매핑 처리
  function showQuestion() {
    const currentQ = questions[currentIdx];
    questionText.textContent = currentQ.q;
    optionBtns[0].textContent = currentQ.a1;
    optionBtns[1].textContent = currentQ.a2;

    // 프로그레스바 수치 갱신 애니메이션
    const percent = ((currentIdx) / questions.length) * 100;
    progressIndicator.style.width = `${percent}%`;
    progressText.textContent = `${currentIdx + 1} / ${questions.length}`;
  }

  // 선택지 클릭 이벤트 리스너 바인딩
  optionBtns.forEach((btn, clickIdx) => {
    btn.addEventListener('click', () => {
      const currentQ = questions[currentIdx];
      const targetIndicator = currentQ.type; // 예: "EI"
      
      if (clickIdx === 0) {
        scores[targetIndicator[0]]++; // 첫 번째 선택지 글자 가산
      } else {
        scores[targetIndicator[1]]++; // 두 번째 선택지 글자 가산
      }

      currentIdx++;
      if (currentIdx < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
    });
  });

  // 결과 연산 및 로딩 연출
  function showResult() {
    quizScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');

    // 1.5초 후 연산 결과 도출 (로딩 시뮬레이션 연출)
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      resultScreen.classList.remove('hidden');

      // 점수 기반 MBTI 스트링 빌드
      let mbti = "";
      mbti += scores.E >= scores.I ? "E" : "I";
      mbti += scores.S >= scores.N ? "S" : "N";
      mbti += scores.T >= scores.F ? "T" : "F";
      mbti += scores.J >= scores.P ? "J" : "P";

      document.getElementById('result-type').textContent = mbti;
      
      // 결과 데이터 매칭 분기 안전장치
      if(resultData[mbti]) {
        document.getElementById('result-title').textContent = resultData[mbti].title;
        document.getElementById('result-desc').textContent = resultData[mbti].desc;
      } else {
        document.getElementById('result-title').textContent = `${mbti} 지표 확인 완료`;
        document.getElementById('result-desc').textContent = "훌륭한 균형 잡힌 성향 분석 결과를 도출했습니다. 해당 도메인 지표를 커스텀 데이터셋에 매핑하여 확장해보세요.";
      }
    }, 1500);
  }

  // 다시 테스트하기 초기화
  restartBtn.addEventListener('click', () => {
    scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    currentIdx = 0;
    resultScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
  });
});