import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function LinkHelp() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          <Info className="h-3.5 w-3.5 mr-1" />
          如何使用链接
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>文档双向链接使用指南</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">什么是双向链接？</h3>
            <p className="text-muted-foreground">
              双向链接是一种文档关联方式，通过在文档内容中使用 <code className="bg-muted px-1.5 py-0.5 rounded">[[文档名]]</code> 格式引用其他文档。
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">使用方法</h3>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>点击编辑器上方的"文档链接"按钮</li>
              <li>在弹出的对话框中搜索并选择要链接的文档</li>
              <li>系统会自动插入 <code className="bg-muted px-1.5 py-0.5 rounded">[[文档名]]</code> 格式的链接</li>
              <li>保存文档后，链接即可点击跳转</li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold mb-2">示例</h3>
            <div className="bg-muted p-3 rounded-md font-mono text-xs">
              <p># 我的项目笔记</p>
              <p>这个项目参考了 [[需求文档]] 和 [[技术方案]]。</p>
              <p>详细说明请查看 [[会议记录 2024-01-15]]。</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">知识图谱</h3>
            <p className="text-muted-foreground">
              当您创建了多个文档链接后，可以在"知识图谱"页面可视化查看文档之间的关联关系。
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
