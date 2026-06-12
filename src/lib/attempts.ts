export interface TestAttempt {
  id: string;
  subjectId: string;
  subjectName: string;
  paperNumber: number;
  paperName?: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unattempted: number;
  timeSpentSeconds: number;
  submittedAt: string;
  answers: Record<string, string | null>; // Maps question.id -> selectedOption ("A", "B", "C", "D" or null)
}

export function loadAttempts(): TestAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("agri_test_attempts");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Guard against corrupt data (non-array)
    return Array.isArray(parsed) ? (parsed as TestAttempt[]) : [];
  } catch {
    // Corrupt or missing — wipe and start fresh
    try { localStorage.removeItem("agri_test_attempts"); } catch {}
    return [];
  }
}

export function saveAttempt(attempt: Omit<TestAttempt, "id" | "submittedAt">): TestAttempt {
  const attempts = loadAttempts();
  const newAttempt: TestAttempt = {
    ...attempt,
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2),
    submittedAt: new Date().toISOString(),
  };

  // Overwrite any existing attempt for the same paper (one result per paper)
  const existingIdx = attempts.findIndex(
    (a) => a.subjectId === attempt.subjectId && a.paperNumber === attempt.paperNumber,
  );
  if (existingIdx !== -1) {
    attempts[existingIdx] = newAttempt;
  } else {
    attempts.push(newAttempt);
  }

  if (typeof window !== "undefined") {
    safeLocalStorageSet("agri_test_attempts", JSON.stringify(attempts));
  }
  return newAttempt;
}

/**
 * Safe localStorage.setItem — if QuotaExceededError is thrown,
 * drops the oldest attempt and retries once before silently failing.
 */
function safeLocalStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    if (e instanceof DOMException && e.name === "QuotaExceededError") {
      try {
        // Drop oldest attempt to free space and retry
        const current = loadAttempts();
        if (current.length > 0) {
          current.shift();
          localStorage.setItem(key, JSON.stringify(current));
        }
      } catch {
        // If still failing, give up silently — don't crash the app
        console.warn("[attempts] localStorage quota exceeded, could not save attempt");
      }
    }
  }
}

export function getGeneralStats(attempts: TestAttempt[]) {
  if (attempts.length === 0) {
    return {
      totalTests: 0,
      averageScore: 0,
      averageAccuracy: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      bestSubject: "—",
    };
  }

  const totalTests = attempts.length;
  let totalScore = 0;
  let totalCorrect = 0;
  let totalQuestions = 0;
  let totalAttempted = 0;
  const subjectScores: Record<string, { total: number; count: number }> = {};

  attempts.forEach((a) => {
    totalScore += a.score;
    totalCorrect += a.correctAnswers;
    totalQuestions += a.totalQuestions;
    totalAttempted += a.correctAnswers + a.incorrectAnswers;

    if (!subjectScores[a.subjectName]) {
      subjectScores[a.subjectName] = { total: 0, count: 0 };
    }
    // Calculate score percentage for this attempt
    const maxScore = a.totalQuestions;
    const percentage = maxScore > 0 ? (a.score / maxScore) * 100 : 0;
    subjectScores[a.subjectName].total += percentage;
    subjectScores[a.subjectName].count += 1;
  });

  // Average score as percentage
  const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) * 100 : 0;
  const averageAccuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;

  let bestSubject = "—";
  let highestAverage = -Infinity;
  Object.entries(subjectScores).forEach(([name, data]) => {
    const avg = data.total / data.count;
    if (avg > highestAverage) {
      highestAverage = avg;
      bestSubject = name;
    }
  });

  return {
    totalTests,
    averageScore: Math.round(averageScore * 10) / 10,
    averageAccuracy: Math.round(averageAccuracy * 10) / 10,
    totalCorrect,
    totalQuestions,
    bestSubject,
  };
}
