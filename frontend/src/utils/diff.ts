import * as Diff from 'diff';

export interface DiffResult {
  count?: number;
  added?: boolean;
  removed?: boolean;
  value: string;
}

export interface LineDiffResult {
  count?: number;
  added?: boolean;
  removed?: boolean;
  value: string;
}

// 文本对比
export const compareText = (oldText: string, newText: string): DiffResult[] => {
  return Diff.diffChars(oldText, newText);
};

// 按行对比
export const compareLines = (oldText: string, newText: string): LineDiffResult[] => {
  return Diff.diffLines(oldText, newText);
};

// 对比单词
export const compareWords = (oldText: string, newText: string): DiffResult[] => {
  return Diff.diffWords(oldText, newText);
};

// 生成 HTML 格式的对比结果
export const generateDiffHtml = (oldText: string, newText: string): string => {
  const diff = compareText(oldText, newText);

  return diff.map((part) => {
    if (part.added) {
      return `<span class="bg-green-200 dark:bg-green-900">${part.value}</span>`;
    }
    if (part.removed) {
      return `<span class="bg-red-200 dark:bg-red-900 line-through">${part.value}</span>`;
    }
    return part.value;
  }).join('');
};

// 获取变更统计
export const getDiffStats = (oldText: string, newText: string) => {
  const diff = compareLines(oldText, newText);

  let additions = 0;
  let deletions = 0;

  diff.forEach((part) => {
    if (part.added) {
      additions += part.count || 0;
    }
    if (part.removed) {
      deletions += part.count || 0;
    }
  });

  return {
    additions,
    deletions,
    totalChanges: additions + deletions,
  };
};
