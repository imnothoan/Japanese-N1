export const classifyErrorType = (question: string) => {
  if (question.includes("particle") || question.includes("助詞")) return "particles";
  if (question.includes("文法")) return "similar_grammar";
  if (question.match(/[一-龯]/)) return "kanji_confusion";
  return "general";
};
