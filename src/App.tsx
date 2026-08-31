/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  RotateCcw, 
  Award, 
  Sparkles, 
  FileText, 
  Check, 
  Layers,
  BarChart3,
  BookmarkCheck,
  Zap
} from 'lucide-react';

interface Question {
  cau: number;
  mang: 'TU' | 'QUET' | 'DOC';
  hoi: string;
  A: string;
  B: string;
  C: string;
  D: string;
  dapAn: 'A' | 'B' | 'C' | 'D';
  doan?: string;
}

const READING_PASSAGE = "Minh is twelve years old. He lives in a small house near the river with his parents and his little sister, Lan. Every Saturday morning, Minh helps his father wash the car. In the afternoon, he plays football with his friends in the park. Lan is only six, so she stays at home and draws pictures. Minh's favourite subject at school is science, but he does not like maths because it is difficult for him. He wants to be a doctor when he grows up.";

const QUESTIONS_DATA: Question[] = [
  {"cau":1,"mang":"TU","hoi":"A person who cooks food in a restaurant is a ___.","A":"chef","B":"driver","C":"farmer","D":"dentist","dapAn":"A"},
  {"cau":2,"mang":"TU","hoi":"You use an ___ when it rains.","A":"envelope","B":"umbrella","C":"armchair","D":"elevator","dapAn":"B"},
  {"cau":3,"mang":"TU","hoi":"The room where you cook is the ___.","A":"bathroom","B":"bedroom","C":"kitchen","D":"garage","dapAn":"C"},
  {"cau":4,"mang":"TU","hoi":"A ___ is an animal with a very long neck.","A":"rabbit","B":"penguin","C":"dolphin","D":"giraffe","dapAn":"D"},
  {"cau":5,"mang":"TU","hoi":"When you are not busy, you are ___.","A":"tired","B":"angry","C":"late","D":"free","dapAn":"D"},
  {"cau":6,"mang":"TU","hoi":"You keep your money in a ___.","A":"blanket","B":"wallet","C":"towel","D":"ticket","dapAn":"B"},
  {"cau":7,"mang":"TU","hoi":"The opposite of \"dangerous\" is ___.","A":"dirty","B":"quiet","C":"safe","D":"heavy","dapAn":"C"},
  {"cau":8,"mang":"QUET","hoi":"Last weekend my family ___ to the beach.","A":"go","B":"goes","C":"went","D":"going","dapAn":"C"},
  {"cau":9,"mang":"QUET","hoi":"Look! The baby ___ now.","A":"sleep","B":"sleeps","C":"slept","D":"is sleeping","dapAn":"D"},
  {"cau":10,"mang":"QUET","hoi":"My brother ___ his homework every evening.","A":"do","B":"does","C":"did","D":"doing","dapAn":"B"},
  {"cau":11,"mang":"QUET","hoi":"There ___ two cats under the table.","A":"is","B":"am","C":"are","D":"be","dapAn":"C"},
  {"cau":12,"mang":"QUET","hoi":"Tom and I ___ in the same class last year.","A":"was","B":"were","C":"are","D":"is","dapAn":"B"},
  {"cau":13,"mang":"QUET","hoi":"She ___ TV at the moment. She is reading a book.","A":"isn't watching","B":"doesn't watched","C":"not watching","D":"don't watch","dapAn":"A"},
  {"cau":14,"mang":"QUET","hoi":"My mother ___ at the hospital. She is a nurse.","A":"works","B":"work","C":"working","D":"worked","dapAn":"A"},
  {"cau":15,"mang":"DOC","doan":READING_PASSAGE,"hoi":"How old is Minh?","A":"Six","B":"Ten","C":"Twelve","D":"Sixteen","dapAn":"C"},
  {"cau":16,"mang":"DOC","hoi":"Who does Minh live with?","A":"His grandparents","B":"His parents and his sister","C":"His friends","D":"His uncle","dapAn":"B"},
  {"cau":17,"mang":"DOC","hoi":"What does Minh do on Saturday morning?","A":"He plays football.","B":"He draws pictures.","C":"He washes the car with his father.","D":"He goes to school.","dapAn":"C"},
  {"cau":18,"mang":"DOC","hoi":"Why does Lan stay at home?","A":"She is very young.","B":"She is ill.","C":"She does not like the park.","D":"She is busy.","dapAn":"A"},
  {"cau":19,"mang":"DOC","hoi":"Which subject does Minh like best?","A":"Science","B":"Maths","C":"English","D":"Music","dapAn":"A"},
  {"cau":20,"mang":"DOC","hoi":"Minh does not like maths because it is ___.","A":"boring","B":"easy","C":"noisy","D":"difficult","dapAn":"D"},
  {"cau":21,"mang":"DOC","hoi":"What job does Minh want when he grows up?","A":"A teacher","B":"A driver","C":"A farmer","D":"A doctor","dapAn":"D"}
];

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbw00EtPyhylfx8ZUg3o7CFvc5g44RK17byvTJqy8kMY6grcfIVpTAT7Enu9NenGnBFR/exec';

type ScreenState = 'SELECT_NAME' | 'DOING_QUIZ' | 'RESULT';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('SELECT_NAME');
  const [selectedName, setSelectedName] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B' | 'C' | 'D'>>({});
  const hasSubmittedRef = useRef(false);

  // Scroll to top when changing questions or screen
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentIndex, screen]);

  // Handler for starting the quiz
  const handleStartQuiz = () => {
    if (!selectedName) return;
    setScreen('DOING_QUIZ');
    setCurrentIndex(0);
  };

  // Select an answer for the current question
  const handleSelectOption = (optionKey: 'A' | 'B' | 'C' | 'D') => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionKey
    }));
  };

  // Next question or Submit
  const handleNextOrSubmit = () => {
    if (currentIndex < QUESTIONS_DATA.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setScreen('RESULT');
    }
  };

  // Compute scores
  const calculateScores = () => {
    let totalScore = 0;
    let tuScore = 0;
    let quetScore = 0;
    let docScore = 0;

    QUESTIONS_DATA.forEach((q, idx) => {
      const studentAns = answers[idx];
      const isCorrect = studentAns === q.dapAn;

      if (isCorrect) {
        totalScore += 1;
        if (q.mang === 'TU') tuScore += 1;
        else if (q.mang === 'QUET') quetScore += 1;
        else if (q.mang === 'DOC') docScore += 1;
      }
    });

    return {
      totalScore,
      tuScore,
      quetScore,
      docScore
    };
  };

  // When reaching RESULT screen, automatically send payload to Google Sheet Webhook
  useEffect(() => {
    if (screen === 'RESULT' && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;

      const { totalScore, tuScore, quetScore, docScore } = calculateScores();

      const payload = {
        ten: selectedName || "Duy Sang",
        lop: "7",
        diem: totalScore,
        tongCau: QUESTIONS_DATA.length,
        chiTiet: {
          TU: tuScore,
          QUET: quetScore,
          DOC: docScore
        },
        url: typeof window !== 'undefined' ? window.location.href : ''
      };

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      })
        .then(() => {
          console.log("Kết quả đã được gửi thành công:", payload);
        })
        .catch((error) => {
          console.error("Lỗi khi gửi kết quả về Google Sheet:", error);
        });
    }
  }, [screen, selectedName, answers]);

  // Restart quiz
  const handleRestart = () => {
    hasSubmittedRef.current = false;
    setSelectedName('');
    setCurrentIndex(0);
    setAnswers({});
    setScreen('SELECT_NAME');
  };

  const currentQ = QUESTIONS_DATA[currentIndex];
  const isLastQuestion = currentIndex === QUESTIONS_DATA.length - 1;
  const currentAnswer = answers[currentIndex];
  const { totalScore, tuScore, quetScore, docScore } = calculateScores();

  return (
    <div id="english-quiz-root" className="min-h-screen flex flex-col bg-sky-50/70 font-sans text-slate-800 p-3 sm:p-6 lg:p-8">
      <div className="max-w-6xl w-full mx-auto flex flex-col gap-5 sm:gap-6 flex-1">
        
        {/* Bento Header */}
        <header id="quiz-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-5 rounded-3xl shadow-sm border-2 border-sky-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-200 shrink-0">
              7
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
                BÀI TẬP TIẾNG ANH — LỚP 7
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                Kiểm tra kiến thức Tổng hợp (21 câu)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto bg-slate-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-2xl border border-slate-100 sm:border-0">
            <div className="text-right">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Học sinh</div>
              <div className="text-sm sm:text-base font-bold text-blue-600">
                {selectedName || "Chưa chọn tên"}
              </div>
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-sky-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-xs overflow-hidden">
              <img 
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedName || 'Student7'}`} 
                alt="avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* 1. MÀN HÌNH CHỌN TÊN */}
        {screen === 'SELECT_NAME' && (
          <div id="screen-select-name" className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-center my-auto">
            {/* Left Bento Welcome Card */}
            <div className="lg:col-span-7 bg-white rounded-[32px] p-6 sm:p-10 shadow-md border-b-4 border-sky-200 border-2 border-sky-100 flex flex-col justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100 mb-4">
                  <Sparkles className="w-3.5 h-3.5" /> Chào mừng bạn học sinh
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  Sẵn sàng kiểm tra kiến thức Tiếng Anh Lớp 7!
                </h2>
                <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
                  Bài làm gồm 21 câu trắc nghiệm được biên soạn chuẩn kiến thức Lớp 7, bao gồm từ vựng, cấu trúc câu và đoạn văn đọc hiểu.
                </p>
              </div>

              {/* Bento Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-100">
                  <div className="text-blue-600 font-bold text-xs flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" /> 21 Câu hỏi
                  </div>
                  <div className="text-xs text-slate-600">Trắc nghiệm 4 lựa chọn</div>
                </div>

                <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-100">
                  <div className="text-amber-700 font-bold text-xs flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5" /> 3 Phân loại
                  </div>
                  <div className="text-xs text-slate-600">Từ vựng, ngữ pháp, đọc</div>
                </div>

                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-100">
                  <div className="text-emerald-700 font-bold text-xs flex items-center gap-1.5 mb-1">
                    <BarChart3 className="w-3.5 h-3.5" /> Chấm điểm tức thì
                  </div>
                  <div className="text-xs text-slate-600">Kèm đáp án chi tiết</div>
                </div>
              </div>
            </div>

            {/* Right Bento Action Card */}
            <div className="lg:col-span-5 bg-white rounded-[32px] p-6 sm:p-8 shadow-md border-b-4 border-blue-300 border-2 border-sky-100 flex flex-col justify-center gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  Bắt đầu làm bài
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Vui lòng chọn đúng họ tên của em trong danh sách bên dưới:
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label 
                    htmlFor="student-name-select" 
                    className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                  >
                    Chọn tên của em <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="relative">
                    <select
                      id="student-name-select"
                      value={selectedName}
                      onChange={(e) => setSelectedName(e.target.value)}
                      className="w-full h-14 px-4 py-3 bg-slate-50 border-2 border-slate-200 hover:border-blue-400 focus:border-blue-600 focus:bg-white rounded-2xl text-slate-900 text-base font-semibold transition outline-none cursor-pointer appearance-none shadow-xs"
                    >
                      <option value="" disabled>-- Vui lòng chọn tên --</option>
                      <option value="Duy Sang">Duy Sang</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <ChevronRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </div>

                <button
                  id="btn-start-quiz"
                  type="button"
                  onClick={handleStartQuiz}
                  disabled={!selectedName}
                  className={`w-full h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
                    selectedName
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-blue-200 hover:shadow-blue-300 active:scale-95'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  <span>Bắt đầu làm bài</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MÀN HÌNH LÀM BÀI (BENTO GRID) */}
        {screen === 'DOING_QUIZ' && currentQ && (
          <div id="screen-doing-quiz" className="flex flex-col gap-5 flex-1">
            {/* Bento Progress Banner */}
            <div className="bg-white rounded-[24px] p-4 sm:p-5 shadow-sm border-2 border-sky-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-bold text-slate-700">
                <span className="flex items-center gap-2 text-blue-600">
                  <FileText className="w-4 h-4" />
                  Tiến độ làm bài
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                  Câu {currentIndex + 1} / {QUESTIONS_DATA.length}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all duration-300 shadow-inner"
                  style={{ width: `${((currentIndex + 1) / QUESTIONS_DATA.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Bento Grid: Passage & Question */}
            <div className={`grid grid-cols-1 ${currentQ.mang === 'DOC' ? 'lg:grid-cols-12' : 'grid-cols-1'} gap-5 flex-grow`}>
              
              {/* Reading Passage Bento Tile (DOC questions) */}
              {currentQ.mang === 'DOC' && (
                <div id="reading-passage-box" className="lg:col-span-5 bg-white rounded-[32px] p-6 shadow-md border-b-4 border-amber-200 border-2 border-amber-100 flex flex-col gap-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full w-fit text-xs font-bold uppercase tracking-wide">
                    <span>📖</span> Đoạn văn đọc hiểu
                  </div>
                  <div className="text-slate-700 leading-relaxed text-sm sm:text-base italic bg-amber-50/40 p-4 rounded-2xl border border-amber-100 select-text overflow-y-auto">
                    {READING_PASSAGE}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-auto">
                    Đoạn văn áp dụng chung cho câu 15 đến câu 21.
                  </div>
                </div>
              )}

              {/* Question & 4 Choices Bento Tile */}
              <div className={`${currentQ.mang === 'DOC' ? 'lg:col-span-7' : 'w-full'} flex flex-col gap-5`}>
                <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-md border-b-4 border-blue-200 border-2 border-sky-100 flex-grow flex flex-col justify-between gap-6">
                  <div>
                    <div className="inline-block px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 mb-3">
                      Câu hỏi {currentQ.cau}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {currentQ.hoi}
                    </h2>
                  </div>

                  {/* 2x2 Bento Option Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {(['A', 'B', 'C', 'D'] as const).map((key) => {
                      const isSelected = currentAnswer === key;
                      const optionText = currentQ[key];

                      return (
                        <button
                          key={key}
                          id={`option-btn-${key}`}
                          type="button"
                          onClick={() => handleSelectOption(key)}
                          className={`group flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 shadow-sm text-blue-900'
                              : 'border-slate-100 hover:border-blue-400 hover:bg-blue-50/50 bg-white text-slate-800'
                          }`}
                        >
                          <span className={`w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl font-bold text-sm sm:text-base shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-blue-500 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-blue-500 group-hover:text-white'
                          }`}>
                            {key}
                          </span>
                          <span className="text-sm sm:text-base font-semibold flex-1">
                            {optionText}
                          </span>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Bento Control Bar */}
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border-2 border-sky-100 shadow-sm">
                  <div className="flex gap-2">
                    <div className="px-3.5 py-1.5 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 border border-slate-200">
                      ID: CÂU_{currentQ.cau}
                    </div>
                  </div>

                  <button
                    id="btn-next-question"
                    type="button"
                    onClick={handleNextOrSubmit}
                    disabled={!currentAnswer}
                    className={`px-8 sm:px-10 py-3.5 sm:py-4 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center gap-2 ${
                      currentAnswer
                        ? isLastQuestion
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-lg shadow-emerald-200 active:scale-95'
                          : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-lg shadow-blue-200 active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>{isLastQuestion ? 'Nộp bài 🚀' : 'Câu tiếp theo →'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MÀN HÌNH KẾT QUẢ (BENTO GRID) */}
        {screen === 'RESULT' && (
          <div id="screen-result" className="flex flex-col gap-6 flex-1">
            
            {/* Bento Grid Top Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Score Hero Bento Card */}
              <div className="lg:col-span-6 bg-white rounded-[32px] p-6 sm:p-8 shadow-md border-b-4 border-blue-300 border-2 border-sky-100 flex flex-col justify-between text-center items-center">
                <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner mb-3">
                  <Award className="w-9 h-9" />
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
                    Kết quả của học sinh <span className="text-blue-600">{selectedName}</span>
                  </h2>
                  <div className="mt-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                    <p className="text-xs uppercase font-extrabold tracking-wider text-blue-600 mb-1">
                      Tổng số câu trả lời chính xác
                    </p>
                    <div className="text-3xl sm:text-5xl font-black text-slate-900">
                      Em đúng <span className="text-blue-600">{totalScore}</span>/21 câu
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-500 mt-2">
                      Đạt {Math.round((totalScore / 21) * 100)}% tổng số điểm
                    </div>
                  </div>
                </div>

                <div className="mt-6 w-full flex justify-center">
                  <button
                    id="btn-restart-quiz"
                    type="button"
                    onClick={handleRestart}
                    className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-base rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Làm lại từ đầu</span>
                  </button>
                </div>
              </div>

              {/* 3 Categories Breakdown Bento Card */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="text-base font-bold text-slate-800 px-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  Đánh giá chi tiết theo từng mảng
                </div>

                {/* 1. Từ vựng (TU) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-b-4 border-indigo-200 border-2 border-indigo-50 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <BookmarkCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Mảng 1</div>
                      <div className="text-base font-extrabold text-slate-800">Từ vựng</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-indigo-600">{tuScore}/7</div>
                    <div className="text-[11px] font-semibold text-slate-400">câu đúng</div>
                  </div>
                </div>

                {/* 2. Đọc kỹ câu (QUET) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-b-4 border-sky-200 border-2 border-sky-50 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Mảng 2</div>
                      <div className="text-base font-extrabold text-slate-800">Đọc kỹ câu</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-sky-600">{quetScore}/7</div>
                    <div className="text-[11px] font-semibold text-slate-400">câu đúng</div>
                  </div>
                </div>

                {/* 3. Đọc hiểu (DOC) */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border-b-4 border-emerald-200 border-2 border-emerald-50 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase">Mảng 3</div>
                      <div className="text-base font-extrabold text-slate-800">Đọc hiểu</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-600">{docScore}/7</div>
                    <div className="text-[11px] font-semibold text-slate-400">câu đúng</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Question Review Box */}
            <div id="question-review-list" className="bg-white rounded-[32px] p-6 sm:p-8 shadow-md border-2 border-sky-100 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Danh sách đáp án 21 câu hỏi
                </h3>
                <div className="flex gap-2 text-xs font-bold">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {totalScore} Đúng
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                    {21 - totalScore} Sai
                  </span>
                </div>
              </div>

              {/* Review Question Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {QUESTIONS_DATA.map((q, idx) => {
                  const studentChoice = answers[idx];
                  const isCorrect = studentChoice === q.dapAn;
                  const correctText = q[q.dapAn];
                  const studentText = studentChoice ? q[studentChoice] : "Chưa chọn";

                  return (
                    <div 
                      key={q.cau}
                      id={`review-item-${q.cau}`}
                      className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 ${
                        isCorrect 
                          ? 'border-emerald-200 bg-emerald-50/30' 
                          : 'border-rose-200 bg-rose-50/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700">
                            Câu {q.cau}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {isCorrect ? (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3.5 h-3.5" /> Sai
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm font-bold text-slate-900 leading-snug">
                          {q.hoi}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
                        <div className={`p-2 rounded-xl border ${
                          isCorrect 
                            ? 'bg-emerald-100/60 border-emerald-200 text-emerald-900' 
                            : 'bg-rose-100/60 border-rose-200 text-rose-900 font-medium'
                        }`}>
                          <span className="font-bold">Em chọn:</span> {studentChoice ? `${studentChoice}. ${studentText}` : "Chưa chọn"}
                        </div>

                        <div className="p-2 rounded-xl border bg-white border-slate-200 text-slate-800">
                          <span className="font-bold text-emerald-700">Đáp án đúng:</span> {q.dapAn}. {correctText}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Restart Button */}
              <div className="pt-4 flex justify-center">
                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại từ đầu</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bento Footer */}
        <footer id="quiz-footer" className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest py-3 mt-auto">
          <span>Tiếng Anh 7</span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span>Trắc nghiệm 21 câu</span>
          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          <span>Dành cho học sinh</span>
        </footer>

      </div>
    </div>
  );
}
