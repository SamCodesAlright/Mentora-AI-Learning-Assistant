import Quiz from "../models/Quiz.js";

// @desc     Get all quizzes of a document
// @route    GET /api/quizzes/:documentId
// @access   Private
export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Get single quiz related to a document
// @route    GET /api/quizzes/quiz/:id
// @access   Private
export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Submit Quiz Answers
// @route    POST /api/quizzes/:id/submit
// @access   Private
export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of answers",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz already completed",
        statusCode: 400,
      });
    }

    // Processing answers and calculating score
    let correctCount = 0;
    const userAnswers = [];

    // Helper to normalize an answer into a 0-based index
    const resolveIndex = (ans, options) => {
      const opts = Array.isArray(options) ? options : [];
      if (typeof ans === "number") {
        if (ans >= 0 && ans < opts.length) return ans;
        if (ans - 1 >= 0 && ans - 1 < opts.length) return ans - 1;
      }
      if (typeof ans === "string") {
        const trimmed = ans.trim();
        // Format like "O2"
        const oMatch = trimmed.match(/^O(\d+)$/i);
        if (oMatch) {
          const idx = parseInt(oMatch[1], 10) - 1;
          if (idx >= 0 && idx < opts.length) return idx;
        }
        // Exact text match
        const exact = opts.findIndex((opt) => opt === trimmed);
        if (exact !== -1) return exact;
        // Case-insensitive text match
        const ci = opts.findIndex(
          (opt) => (opt || "").toString().trim().toLowerCase() === trimmed.toLowerCase(),
        );
        if (ci !== -1) return ci;
        // Any number within string (e.g., "Option 2") assumed 1-based
        const numMatch = trimmed.match(/\d+/);
        if (numMatch) {
          const idx = parseInt(numMatch[0], 10) - 1;
          if (idx >= 0 && idx < opts.length) return idx;
        }
      }
      return -1;
    };

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const options = question.options || [];
        const userIdx = resolveIndex(selectedAnswer, options);
        const correctIdx = resolveIndex(question.correctAnswer, options);

        const isCorrect = userIdx !== -1 && correctIdx !== -1
          ? userIdx === correctIdx
          : selectedAnswer === question.correctAnswer;

        if (isCorrect) correctCount++;

        userAnswers.push({
          questionIndex,
          selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });
      }
    });

    // Calculating score
    const score = Math.round((correctCount / quiz.totalQuestions) * 100);

    // Update Quiz
    quiz.userAnswers = userAnswers;
    quiz.score = score;
    quiz.completedAt = new Date();

    await quiz.save();

    res.status(200).json({
      success: true,
      data: {
        quizId: quiz._id,
        score,
        correctCount,
        totalQuestions: quiz.totalQuestions,
        percentage: score,
        userAnswers,
      },
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Get Quiz Results
// @route    GET /api/quizzes/:id/results
// @access   Private
export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed",
        statusCode: 400,
      });
    }

    // Constructing the detailed results
    const detailedResults = quiz.questions.map((question, index) => {
      const userAnswer = quiz.userAnswers.find(
        (a) => a.questionIndex === index
      );

      return {
        questionIndex: index,
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        selectedAnswer: userAnswer?.selectedAnswer || null,
        isCorrect: userAnswer?.isCorrect || false,
        explanation: question.explanation,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        quiz: {
          id: quiz._id,
          title: quiz.title,
          document: quiz.documentId,
          score: quiz.score,
          totalQuestions: quiz.totalQuestions,
          completedAt: quiz.completedAt,
        },
        results: detailedResults,
      },
      message: "Quiz results fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Delete Quiz
// @route    DELETE /api/quizzes/:id
// @access   Private
export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    await quiz.deleteOne();

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
