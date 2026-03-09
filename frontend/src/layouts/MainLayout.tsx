import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LogOut, User, FolderOpen, Tag, Moon, Sun, Keyboard, Clock, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useRecentStore } from '@/stores/recentStore';
import { useToast } from '@/components/ui/toaster';
import { authService } from '@/services/auth.service';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshToken, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { recents, removeRecent, clearRecents } = useRecentStore();
  const { success, error: showError } = useToast();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // 快捷键处理
  const handleSearch = () => {
    // 触发搜索焦点，如果有搜索框的话
    const searchInput = document.querySelector('input[placeholder*="搜索"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  };

  const handleNewDocument = () => {
    if (location.pathname.startsWith('/documents')) {
      const newButton = document.querySelector('button:contains("新建文档")') as HTMLButtonElement;
      if (newButton) newButton.click();
    }
  };

  useKeyboardShortcuts({
    onSearch: handleSearch,
    onNewDocument: handleNewDocument,
    onToggleSidebar: () => setShortcutsOpen(true),
    onShowShortcuts: () => setShortcutsOpen(true),
  });

  const handleOpenShortcuts = () => setShortcutsOpen(true);

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      logout();
      success('已退出登录');
      navigate('/login');
    } catch (err: any) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 */}
      <aside className="w-64 border-r bg-muted/40 hidden md:block">
        <div className="p-4">
          <Link to="/documents" className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-lg">在线文档</span>
          </Link>
        </div>
        <nav className="mt-4 px-2">
          <Link to="/documents">
            <Button
              variant={isActive('/documents') ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              我的文档
            </Button>
          </Link>
          <Link to="/folders">
            <Button
              variant={isActive('/folders') ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              文件夹
            </Button>
          </Link>
          <Link to="/tags">
            <Button
              variant={isActive('/tags') ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
            >
              <Tag className="h-4 w-4 mr-2" />
              标签管理
            </Button>
          </Link>
          <Link to="/bookmarks">
            <Button
              variant={isActive('/bookmarks') ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
            >
              <Star className="h-4 w-4 mr-2" />
              我的收藏
            </Button>
          </Link>
        </nav>

        {/* 最近浏览 */}
        {recents.length > 0 && (
          <div className="mt-6 px-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>最近浏览</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clearRecents}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1">
              {recents.map((recent) => (
                <button
                  key={recent.id}
                  onClick={() => navigate(`/documents/${recent.id}`)}
                  className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted group flex items-center justify-between"
                >
                  <span className="truncate flex-1">{recent.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecent(recent.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenShortcuts}
              title="快捷键 (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user?.name || user?.email}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">退出</span>
            </Button>
          </div>
        </header>

        {/* 内容区 */}
        {children}
      </div>

      {/* 快捷键帮助对话框 */}
      <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </div>
  );
}
