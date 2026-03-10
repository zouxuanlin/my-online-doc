import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { diff, compareLines, getDiffStats } from '@/utils/diff';
import { X } from 'lucide-react';

interface VersionDiffViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  oldContent: string;
  newContent: string;
  oldVersion: string;
  newVersion: string;
}

export default function VersionDiffViewer({
  open,
  onOpenChange,
  oldContent,
  newContent,
  oldVersion,
  newVersion,
}: VersionDiffViewerProps) {
  const lineDiffs = compareLines(oldContent, newContent);
  const stats = getDiffStats(oldContent, newContent);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>版本对比</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 统计信息 */}
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-sm">新增 {stats.additions} 行</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-sm">删除 {stats.deletions} 行</span>
            </div>
            <div className="text-sm text-muted-foreground">
              从版本 {oldVersion} 到 {newVersion}
            </div>
          </div>

          {/* 对比视图 */}
          <div className="grid md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {/* 旧版本 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  版本 {oldVersion}
                </h4>
                <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                  {lineDiffs
                    .filter((part) => !part.added)
                    .map((part, i) => (
                      <div
                        key={i}
                        className={part.removed ? 'bg-red-200 dark:bg-red-900/50 -mx-3 px-3' : ''}
                      >
                        {part.removed ? (
                          <span className="line-through text-red-600 dark:text-red-400">{part.value}</span>
                        ) : (
                          <span className="text-muted-foreground">{part.value}</span>
                        )}
                      </div>
                    ))}
                </pre>
              </CardContent>
            </Card>

            {/* 新版本 */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  版本 {newVersion}
                </h4>
                <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                  {lineDiffs
                    .filter((part) => !part.removed)
                    .map((part, i) => (
                      <div
                        key={i}
                        className={part.added ? 'bg-green-200 dark:bg-green-900/50 -mx-3 px-3' : ''}
                      >
                        {part.added ? (
                          <span className="text-green-600 dark:text-green-400">{part.value}</span>
                        ) : (
                          <span className="text-muted-foreground">{part.value}</span>
                        )}
                      </div>
                    ))}
                </pre>
              </CardContent>
            </Card>
          </div>

          {/* 合并视图 */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">合并视图</h4>
              <pre className="text-sm bg-muted p-3 rounded overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                {lineDiffs.map((part, i) => (
                  <div
                    key={i}
                    className={`${part.added ? 'bg-green-200 dark:bg-green-900/50 -mx-3 px-3' : ''} ${part.removed ? 'bg-red-200 dark:bg-red-900/50 -mx-3 px-3' : ''}`}
                  >
                    {part.added && (
                      <span className="text-green-600 dark:text-green-400 font-medium">+ </span>
                    )}
                    {part.removed && (
                      <span className="text-red-600 dark:text-red-400 font-medium">- </span>
                    )}
                    {part.added ? (
                      <span className="text-green-600 dark:text-green-400">{part.value}</span>
                    ) : part.removed ? (
                      <span className="text-red-600 dark:text-red-400 line-through">{part.value}</span>
                    ) : (
                      <span className="text-muted-foreground">{part.value}</span>
                    )}
                  </div>
                ))}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
