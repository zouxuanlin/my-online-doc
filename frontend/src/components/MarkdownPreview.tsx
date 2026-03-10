import { useThemeStore } from '@/stores/themeStore';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export default function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const { theme } = useThemeStore();

  return (
    <div
      className={`markdown-preview ${className || ''}`}
      data-color-mode={theme}
      style={{
        padding: '1rem',
        backgroundColor: 'transparent',
      }}
    >
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
        ) : (
          <p className="text-muted-foreground">无内容</p>
        )}
      </div>
    </div>
  );
}

// 简单的 Markdown 渲染函数
function renderMarkdown(md: string): string {
  if (!md) return '';

  let html = md;

  // 转义 HTML 防止 XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 代码块 (```code```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre class="bg-muted p-4 rounded-md overflow-x-auto my-4"><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`;
  });

  // 行内代码 (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm">$1</code>');

  // 标题 (# ~ ######)
  html = html.replace(/^###### (.*$)/gim, '<h6 class="text-sm font-semibold mt-4 mb-2">$1</h6>');
  html = html.replace(/^##### (.*$)/gim, '<h5 class="text-base font-semibold mt-4 mb-2">$1</h5>');
  html = html.replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-5 mb-2">$1</h4>');
  html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-7 mb-3 pb-2 border-b">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4 pb-2 border-b">$1</h1>');

  // 粗体 (**text** 或 __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // 斜体 (*text* 或 _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 删除线 (~~text~~)
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // 链接 ([text](url))
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // 图片 (![alt](url))
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded-md" />');

  // 引用 (> text)
  html = html.replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 text-muted-foreground bg-muted/50">$1</blockquote>');

  // 无序列表 (- 或 * 或 +)
  html = html.replace(/^[\-\*\+] (.*$)/gim, '<li class="ml-4 list-disc">$1</li>');
  // 包裹 ul 标签
  html = html.replace(/(<li.*<\/li>\n?)+/g, '<ul class="my-4 space-y-1">$&</ul>');

  // 有序列表 (1. text)
  html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>');

  // 水平线 (--- 或 *** 或 ___)
  html = html.replace(/^---$|^___$|\*\*\*$/gim, '<hr class="my-6 border-t" />');

  // 段落 (空行分隔)
  html = html.replace(/\n\n([^<\n]+)(?=\n\n|$)/g, '<p class="my-4 leading-relaxed">$1</p>');

  // 换行
  html = html.replace(/\n/g, '<br />');

  return html;
}
