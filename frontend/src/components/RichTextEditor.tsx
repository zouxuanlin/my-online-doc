import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  editable?: boolean;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-x rounded-t-md p-2 bg-muted flex flex-wrap gap-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        粗体
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        斜体
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('strike') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        删除线
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('code') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        代码
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        H3
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        列表
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        编号
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        引用
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('codeBlock') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        代码块
      </button>
      <button
        onClick={() => {
          const url = window.prompt('输入链接地址');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`px-2 py-1 rounded text-sm ${editor.isActive('link') ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/20'}`}
      >
        链接
      </button>
      <button
        onClick={() => {
          const url = window.prompt('输入图片地址');
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        className="px-2 py-1 rounded text-sm hover:bg-muted-foreground/20"
      >
        图片
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTable().run()}
        className="px-2 py-1 rounded text-sm hover:bg-muted-foreground/20"
      >
        表格
      </button>
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="px-2 py-1 rounded text-sm disabled:opacity-50 hover:bg-muted-foreground/20"
      >
        撤销
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="px-2 py-1 rounded text-sm disabled:opacity-50 hover:bg-muted-foreground/20"
      >
        重做
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, editable = true }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border rounded-md h-full flex flex-col">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-auto p-4 prose max-w-none" />
    </div>
  );
}
