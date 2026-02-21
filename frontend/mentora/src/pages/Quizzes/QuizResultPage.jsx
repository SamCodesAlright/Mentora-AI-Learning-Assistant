import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import quizService from "../../services/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";

const QuizResultPage = () => {
  const { quizId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await quizService.getQuizResults(quizId);
        setResults(data);
      } catch (error) {
        toast.error("Failed to fetch quiz results.");
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !results.data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Quiz results not found</p>
        </div>
      </div>
    );
  }

  const {
    data: { quiz, results: detailedResults },
  } = results;

  const score = quiz.score;
  const totalQuestions = detailedResults.length;
  const correctAnswers = detailedResults.filter((r) => r.isCorrect).length;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score) => {
    if (score >= 80) return "from-emerald-500 to-teal-500";
    if (score >= 60) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-red-500";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "You are Crazy Good! 🤩";
    if (score >= 80) return "Excellent Work! Keep it up! 😎";
    if (score >= 70) return "Noice! You can do better! 👌";
    if (score >= 60) return "Not Bad! 🙂";
    return "You good for nothing. Piece of shit! Just Give Up 🤡";
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to={`/documents/${quiz.document._id}`}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to Document
        </Link>
      </div>

      <PageHeader title={`${quiz.title || "Quiz"} Results`} />

      {/* Score Card */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 shadow-lg shadow-emerald-500/25">
            <Trophy className="w-7 h-7 text-emerald-600" strokeWidth={2} />
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Your Score
            </p>
            <div
              className={`inline-block text-5xl font-bold bg-linear-to-r ${getScoreColor(
                score,
              )} bg-clip-text text-transparent mb-2`}
            >
              {score}%
            </div>
            <p className="text-lg font-medium text-slate-700">
              {getScoreMessage(score)}
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <Target className="w-4 h-4 text-slate-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-slate-700">
                {totalQuestions} Total
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <CheckCircle2
                className="w-4 h-4 text-emerald-600"
                strokeWidth={2}
              />
              <span className="text-sm font-semibold text-emerald-700">
                {correctAnswers} Correct
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-200">
              <XCircle className="w-4 h-4 text-rose-600" strokeWidth={2} />
              <span className="text-sm font-semibold text-rose-700">
                {incorrectAnswers} Incorrect
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Review */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-5 h-5 text-slate-600" strokeWidth={2} />
          <h3 className="text-lg font-semibold text-slate-900">
            Detailed Review
          </h3>
        </div>

        {detailedResults.map((result, index) => {
          const getIndexFromAnswer = (answer) => {
            if (answer === null || answer === undefined) return -1;

            const opts = result.options || [];

            // If stored as index (0-based or 1-based)
            if (typeof answer === "number") {
              if (answer >= 0 && answer < opts.length) return answer;
              if (answer - 1 >= 0 && answer - 1 < opts.length)
                return answer - 1;
            }

            if (typeof answer === "string") {
              const trimmed = answer.trim();
              // If stored as "O2"
              if (/^O\d+$/i.test(trimmed)) {
                const idx = parseInt(trimmed.slice(1), 10) - 1;
                return Number.isNaN(idx) ? -1 : idx;
              }
              // Exact text match
              const exact = opts.findIndex((opt) => opt === trimmed);
              if (exact !== -1) return exact;
              // Case-insensitive text match
              const ci = opts.findIndex(
                (opt) =>
                  (opt || "").toString().trim().toLowerCase() ===
                  trimmed.toLowerCase(),
              );
              if (ci !== -1) return ci;
              // Numeric inside string like "Option 2" (assume 1-based)
              const numMatch = trimmed.match(/\d+/);
              if (numMatch) {
                const idx = parseInt(numMatch[0], 10) - 1;
                if (!Number.isNaN(idx) && idx >= 0 && idx < opts.length)
                  return idx;
              }
            }

            return -1;
          };

          const userAnswerIndex = getIndexFromAnswer(result.selectedAnswer);
          const correctAnswerIndex = getIndexFromAnswer(result.correctAnswer);

          const isCorrect = result.isCorrect;

          return (
            <div
              className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 p-6"
              key={index}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg mb-3">
                    <span className="text-xs font-semibold text-slate-600">
                      Question {index + 1}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 leading-relaxed">
                    {result.question}
                  </h4>
                </div>
                <div
                  className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    isCorrect
                      ? "bg-emerald-50 border-2 border-emerald-200"
                      : "bg-rose-50 border-2 border-rose-200"
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  ) : (
                    <XCircle
                      className="w-5 h-5 text-rose-600"
                      strokeWidth={2.5}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {result.options.map((option, optIndex) => {
                  const isCorrectOption = optIndex === correctAnswerIndex;
                  const isUserAnswer = optIndex === userAnswerIndex;
                  const isWrongAnswer = isUserAnswer && !isCorrect;

                  return (
                    <div
                      key={optIndex}
                      className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                        isCorrectOption
                          ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10"
                          : isWrongAnswer
                            ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500"
                            : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm ${
                            isUserAnswer ? "font-semibold" : "font-medium"
                          } ${
                            isCorrectOption
                              ? "text-emerald-900"
                              : isWrongAnswer
                                ? "text-rose-900"
                                : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>

                        <div className="flex items-center gap-2">
                          {isCorrectOption && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700">
                              <CheckCircle2
                                className="w-3 h-3"
                                strokeWidth={2.5}
                              />
                              Correct
                            </span>
                          )}
                          {isUserAnswer && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                                isCorrect
                                  ? "bg-emerald-100 border border-emerald-300 text-emerald-700"
                                  : "bg-rose-100 border border-rose-300 text-rose-700"
                              }`}
                            >
                              {isCorrect ? (
                                <CheckCircle2
                                  className="w-3 h-3"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <XCircle
                                  className="w-3 h-3"
                                  strokeWidth={2.5}
                                />
                              )}
                              Your Answer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              {result.explanation && (
                <div className="p-4 bg-linear-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center mt-0.5">
                      <BookOpen
                        className="w-4 h-4 text-slate-600"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {result.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResultPage;
