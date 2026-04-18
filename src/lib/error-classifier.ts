export const classifyErrorType = (question: string) => {
  const lower = question.toLowerCase();
  if (lower.includes("particle") || question.includes("助詞")) return "particles";
  if (question.includes("文法") || lower.includes("grammar")) return "similar_grammar";
  if (lower.includes("summary") || lower.includes("passage") || question.includes("本文")) return "reading_comprehension";
  if (lower.includes("listen") || question.includes("会話")) return "listening_comprehension";
  if (question.match(/[一-龯]/)) return "kanji_confusion";
  return "general";
};

type MistakeLike = {
  error_type: string;
  module: string;
};

export const getTargetedRetrySet = (mistakes: MistakeLike[]) => {
  const counts = new Map<string, { errorType: string; module: string; count: number }>();

  for (const mistake of mistakes) {
    const key = `${mistake.error_type}::${mistake.module}`;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
      counts.set(key, current);
      continue;
    }
    counts.set(key, {
      errorType: mistake.error_type,
      module: mistake.module,
      count: 1,
    });
  }

  return [...counts.values()].sort((a, b) => b.count - a.count);
};
