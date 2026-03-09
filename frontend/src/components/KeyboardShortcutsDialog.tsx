import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Keyboard } from 'lucide-react';

interface ShortcutItem {
  keys: string[];
  description: string;
}

const shortcuts: ShortcutItem[] = [
  {
    keys: ['⌘', 'K'],
    description: '搜索文档',
  },
  {
    keys: ['⌘', 'N'],
    description: '新建文档',
  },
  {
    keys: ['⌘', 'S'],
    description: '保存文档',
  },
  {
    keys: ['⌘', 'B'],
    description: '切换侧边栏',
  },
  {
    keys: ['⌘', '/'],
    description: '显示快捷键帮助',
  },
  {
    keys: ['G', 'D'],
    description: '跳转到文档列表',
  },
  {
    keys: ['G', 'F'],
    description: '跳转到文件夹',
  },
  {
    keys: ['G', 'T'],
    description: '跳转到标签管理',
  },
  {
    keys: ['?'],
    description: '显示快捷键帮助',
  },
];

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            键盘快捷键
          </DialogTitle>
          <DialogDescription>
            使用快捷键快速操作，提高效率
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between"
            >
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 text-xs font-medium bg-muted border rounded-md min-w-[28px] text-center"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
