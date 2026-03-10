import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LogOut, User, FolderOpen, Tag, Moon, Sun, Keyboard, Clock, X, Star, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useRecentStore } from '@/stores/recentStore';
import { useToast } from '@/components/ui/toaster';
import { authService } from '@/services/auth.service';
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshToken, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { recents, removeRecent, clearRecents } = useRecentStore();
  const { toast } = useToast();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      toast({ description: '已退出登录' });
      navigate('/login');
    } catch (err: any) {
      logout();
      navigate('/login');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/documents', icon: FileText, label: '我的文档' },
    { path: '/folders', icon: FolderOpen, label: '文件夹' },
    { path: '/tags', icon: Tag, label: '标签管理' },
    { path: '/bookmarks', icon: Star, label: '我的收藏' },
  ];

  const NavigationContent = () => (
    <>
      <div className="p-4">
        <Link to="/documents" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="font-semibold text-lg">在线文档</span>
        </Link>
      </div>
      <nav className="mt-4 px-2">
        {navItems.map((item) => (
          <Link key={item.path} to={item.path}>
            <Button
              variant={isActive(item.path) ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        ))}
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
                onClick={() => {
                  navigate(`/documents/${recent.id}`);
                  setMobileMenuOpen(false);
                }}
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
    </>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* 侧边栏 - 桌面端 */}
      <aside className="w-64 border-r bg-muted/40 hidden md:block overflow-y-auto">
        <NavigationContent />
      </aside>

      {/* 移动端侧边栏 */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>导航菜单</SheetTitle>
          </SheetHeader>
          <div className="h-full overflow-y-auto">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <FileText className="h-6 w-6 text-primary md:hidden" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenShortcuts}
              title="快捷键 (?)"
              className="hidden sm:inline-flex"
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
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-white" />
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
