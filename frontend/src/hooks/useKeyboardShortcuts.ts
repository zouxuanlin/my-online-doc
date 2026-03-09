import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsOptions {
  onNewDocument?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onToggleSidebar?: () => void;
  onShowShortcuts?: () => void;
}

export function useKeyboardShortcuts({
  onNewDocument,
  onSave,
  onSearch,
  onToggleSidebar,
  onShowShortcuts,
}: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();

  useEffect(() => {
    let gKeyPressed = false;
    let gKeyTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框中的快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        // 但允许 Cmd/Ctrl + S 保存
        if (!(e.key === 's' && (e.metaKey || e.ctrlKey))) {
          return;
        }
      }

      // Cmd/Ctrl + / 或 ? - 显示快捷键帮助
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        onShowShortcuts?.();
        return;
      }

      // ? - 显示快捷键帮助（直接在任意位置按）
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !gKeyPressed) {
        e.preventDefault();
        onShowShortcuts?.();
        return;
      }

      // Cmd/Ctrl + K - 搜索
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onSearch?.();
        return;
      }

      // Cmd/Ctrl + N - 新建文档
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        onNewDocument?.();
        return;
      }

      // Cmd/Ctrl + S - 保存
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
        return;
      }

      // Cmd/Ctrl + B - 切换侧边栏
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // G 键 - 等待下一个键
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) {
        gKeyPressed = true;
        gKeyTimeout = setTimeout(() => {
          gKeyPressed = false;
        }, 800);
        return;
      }

      // G + D - 跳转到文档列表
      if (e.key === 'd' && gKeyPressed) {
        e.preventDefault();
        navigate('/documents');
        gKeyPressed = false;
        clearTimeout(gKeyTimeout);
        return;
      }

      // G + F - 跳转到文件夹
      if (e.key === 'f' && gKeyPressed) {
        e.preventDefault();
        navigate('/folders');
        gKeyPressed = false;
        clearTimeout(gKeyTimeout);
        return;
      }

      // G + T - 跳转到标签
      if (e.key === 't' && gKeyPressed) {
        e.preventDefault();
        navigate('/tags');
        gKeyPressed = false;
        clearTimeout(gKeyTimeout);
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(gKeyTimeout);
    };
  }, [onNewDocument, onSave, onSearch, onToggleSidebar, onShowShortcuts, navigate]);
}
