import { Document } from './document.service';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

// 导出为 Markdown
export function exportAsMarkdown(doc: Document): void {
  const content = `# ${doc.title}\n\n${doc.content || ''}`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  saveAs(blob, `${doc.title}.md`);
}

// 导出为 PDF
export async function exportAsPDF(doc: Document): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // 标题
  pdf.setFontSize(18);
  pdf.text(doc.title, 20, 20);

  // 元数据
  pdf.setFontSize(10);
  pdf.setTextColor(100);
  const date = new Date(doc.updatedAt).toLocaleString('zh-CN');
  pdf.text(`最后修改：${date}`, 20, 30);

  // 内容
  pdf.setFontSize(12);
  pdf.setTextColor(0);

  const content = doc.content || '无内容';
  const lines = pdf.splitTextToSize(content, 170);

  let y = 40;
  const pageHeight = pdf.internal.pageSize.height;
  const lineHeight = 7;

  for (const line of lines) {
    if (y > pageHeight - 20) {
      pdf.addPage();
      y = 20;
    }
    pdf.text(line, 20, y);
    y += lineHeight;
  }

  pdf.save(`${doc.title}.pdf`);
}

// 导出为 HTML
export function exportAsHTML(doc: Document): void {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${doc.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 {
      font-size: 2em;
      margin-bottom: 0.5em;
      border-bottom: 1px solid #eee;
      padding-bottom: 0.3em;
    }
    .meta {
      color: #666;
      font-size: 0.9em;
      margin-bottom: 2em;
    }
    pre {
      background: #f6f8fa;
      padding: 16px;
      border-radius: 6px;
      overflow: auto;
    }
    code {
      background: #f6f8fa;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
    }
    blockquote {
      border-left: 4px solid #dfe2e5;
      padding-left: 16px;
      color: #6a737d;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 16px 0;
    }
    th, td {
      border: 1px solid #dfe2e5;
      padding: 8px 12px;
    }
    th {
      background: #f6f8fa;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <h1>${doc.title}</h1>
  <div class="meta">最后修改：${new Date(doc.updatedAt).toLocaleString('zh-CN')}</div>
  <div>${doc.content || '无内容'}</div>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  saveAs(blob, `${doc.title}.html`);
}

// 导出为 Word (简单实现，使用 RTF 格式)
export function exportAsWord(doc: Document): void {
  const rtf = `{\\rtf1\\ansi\\deff0
{\\fonttbl{\\f0 Times New Roman;}}
\\f0\\fs48 ${doc.title}\\par
\\fs20\\par
\\fs20 最后修改：${new Date(doc.updatedAt).toLocaleString('zh-CN')}\\par
\\par
${(doc.content || '').replace(/\n/g, '\\par ')}
}`;

  const blob = new Blob([rtf], { type: 'application/msword' });
  saveAs(blob, `${doc.title}.doc`);
}

// 导出菜单类型
export type ExportFormat = 'markdown' | 'pdf' | 'html' | 'word';

// 统一导出函数
export async function exportDocument(
  doc: Document,
  format: ExportFormat
): Promise<void> {
  try {
    switch (format) {
      case 'markdown':
        exportAsMarkdown(doc);
        break;
      case 'pdf':
        await exportAsPDF(doc);
        break;
      case 'html':
        exportAsHTML(doc);
        break;
      case 'word':
        exportAsWord(doc);
        break;
      default:
        throw new Error('不支持的导出格式');
    }
  } catch (error: any) {
    throw new Error(`导出失败：${error.message}`);
  }
}

// 批量导出为 ZIP
export async function batchExportDocuments(
  documents: Document[],
  format: ExportFormat = 'markdown'
): Promise<void> {
  const zip = new JSZip();

  for (const doc of documents) {
    let content: string | Blob;
    let filename: string;

    switch (format) {
      case 'markdown':
        content = `# ${doc.title}\n\n${doc.content || ''}`;
        filename = `${doc.title}.md`;
        break;
      case 'html':
        content = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>${doc.title}</title></head><body><h1>${doc.title}</h1><div>${doc.content || '无内容'}</div></body></html>`;
        filename = `${doc.title}.html`;
        break;
      case 'word':
        const rtf = `{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Times New Roman;}}\\f0\\fs48 ${doc.title}\\par\\fs20\\par${(doc.content || '').replace(/\n/g, '\\par ')}}`;
        content = new Blob([rtf], { type: 'application/msword' });
        filename = `${doc.title}.doc`;
        break;
      default:
        // PDF 需要单独处理
        continue;
    }

    zip.file(filename, content);
  }

  // 如果需要导出 PDF，需要单独处理
  if (format === 'pdf') {
    for (const doc of documents) {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      pdf.setFontSize(18);
      pdf.text(doc.title, 20, 20);

      const content = doc.content || '无内容';
      const lines = pdf.splitTextToSize(content, 170);

      let y = 40;
      const pageHeight = pdf.internal.pageSize.height;
      const lineHeight = 7;

      for (const line of lines) {
        if (y > pageHeight - 20) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 20, y);
        y += lineHeight;
      }

      const pdfBlob = await new Promise<Blob>((resolve) => {
        resolve(pdf.output('blob'));
      });

      zip.file(`${doc.title}.pdf`, pdfBlob);
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, `documents-export-${new Date().toISOString().slice(0, 10)}.zip`);
}
