export function stripTaskSummary(text: string) {
  return (
    text
      // remove task summary block
      .replace(/<task_summary>[\s\S]*<\/task_summary>/, "")
      // remove intro phrases
      .replace(/The key steps I took:([\s\S]*?)(?=\d+\.\s|$)/i, "")
      // remove boilerplate closing sentences
      .replace(/This implementation provides[\s\S]*/i, "")
      // collapse whitespace
      .trim()
  );
}
