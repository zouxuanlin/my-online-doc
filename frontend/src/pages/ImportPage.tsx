import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/toaster';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import apiClient from '@/services/api';

interface ImportResult {
  success: number;
  failed: number;
  documents: any[];
  errors: string[];
}

export default function ImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setImporting(true);
    setResult(null);

    try {
      const response = await apiClient.post('/import/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const importResult = response.data.data;
      setResult(importResult);

      toast({
        title: '导入完成',
        description: `成功导入 ${importResult.success} 个文档，失败 ${importResult.failed} 个`,
      });
    } catch (err: any) {
      toast({
        title: '导入失败',
        description: err.message || '导入过程中发生错误',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">数据导入</h1>
        <p className="text-muted-foreground">
          从其他平台导入文档，支持 Markdown、Text 格式
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
            dragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">拖拽文件到此处</h3>
          <p className="text-muted-foreground mb-4">
            支持 .md、.markdown、.txt 格式
          </p>
          <Button onClick={() => inputRef.current?.click()}>
            选择文件
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".md,.markdown,.txt"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {/* 导入说明 */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              导入说明
            </h3>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
              <li>支持 Markdown (.md, .markdown) 和文本 (.txt) 文件</li>
              <li>可以一次选择多个文件进行批量导入</li>
              <li>文件名将作为文档标题，除非文件内有标题</li>
              <li>导入过程中请保持页面打开</li>
              <li>对于大文件，导入可能需要一些时间</li>
            </ul>
          </CardContent>
        </Card>

        {/* 导入结果 */}
        {result && (
          <>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">导入结果</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-600">成功</p>
                      <p className="text-lg font-semibold">{result.success} 个文档</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-600">失败</p>
                      <p className="text-lg font-semibold">{result.failed} 个文档</p>
                    </div>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">错误详情</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 max-h-48 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate('/documents')}>
                <FileText className="h-4 w-4 mr-2" />
                查看文档
              </Button>
              <Button onClick={() => setResult(null)}>
                继续导入
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
