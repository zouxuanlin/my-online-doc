import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileImage, FileVideo, FileAudio, FileCode, File, X } from 'lucide-react';

interface FilePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  fileName: string;
}

const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.wmv'];
const audioExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];
const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.go', '.rs', '.rb', '.php', '.html', '.css', '.scss', '.less', '.json', '.xml', '.yaml', '.yml', '.md', '.sql', '.sh', '.bash'];

export default function FilePreview({ open, onOpenChange, fileUrl, fileName }: FilePreviewProps) {
  const [previewError, setPreviewError] = useState(false);

  const isImage = () => imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  const isVideo = () => videoExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  const isAudio = () => audioExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  const isCode = () => codeExtensions.some(ext => fileName.toLowerCase().endsWith(ext));

  const getFileIcon = () => {
    if (isImage()) return <FileImage className="h-12 w-12 text-blue-500" />;
    if (isVideo()) return <FileVideo className="h-12 w-12 text-purple-500" />;
    if (isAudio()) return <FileAudio className="h-12 w-12 text-green-500" />;
    if (isCode()) return <FileCode className="h-12 w-12 text-orange-500" />;
    return <File className="h-12 w-12 text-gray-500" />;
  };

  const renderPreview = () => {
    if (previewError) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          {getFileIcon()}
          <p className="mt-4 text-muted-foreground">无法预览此文件</p>
          <p className="text-sm text-muted-foreground">{fileName}</p>
        </div>
      );
    }

    if (isImage()) {
      return (
        <div className="flex items-center justify-center max-h-[60vh]">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-[60vh] object-contain"
            onError={() => setPreviewError(true)}
          />
        </div>
      );
    }

    if (isVideo()) {
      return (
        <div className="max-w-3xl mx-auto">
          <video controls className="w-full max-h-[60vh]">
            <source src={fileUrl} />
            您的浏览器不支持视频预览
          </video>
        </div>
      );
    }

    if (isAudio()) {
      return (
        <div className="max-w-md mx-auto py-8">
          <div className="flex items-center justify-center mb-4">
            {getFileIcon()}
          </div>
          <audio controls className="w-full">
            <source src={fileUrl} />
            您的浏览器不支持音频预览
          </audio>
        </div>
      );
    }

    if (isCode()) {
      return (
        <div className="max-h-[60vh] overflow-auto">
          <pre className="text-sm bg-muted p-4 rounded-lg">
            <code>
              <FetchFileContent url={fileUrl} onError={() => setPreviewError(true)} />
            </code>
          </pre>
        </div>
      );
    }

    // 默认预览
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {getFileIcon()}
        <p className="mt-4 font-medium">{fileName}</p>
        <p className="text-sm text-muted-foreground">此文件类型不支持预览</p>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{fileName}</span>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        {renderPreview()}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => window.open(fileUrl, '_blank')}>
            在新窗口打开
          </Button>
          <Button onClick={() => {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.click();
          }}>
            下载
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 用于获取文件内容的组件
function FetchFileContent({ url, onError }: { url: string; onError: () => void }) {
  const [content, setContent] = useState<string>('加载中...');

  useState(() => {
    fetch(url)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(() => {
        setContent('无法加载文件内容');
        onError();
      });
  });

  return <>{content}</>;
}
