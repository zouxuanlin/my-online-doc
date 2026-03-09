import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileText, LogOut, User, FolderOpen, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/toaster';
import { authService } from '@/services/auth.service';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshToken, logout } = useAuthStore();
  const { success, error: showError } = useToast();

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
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 */}
        <header className="border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 md:hidden">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
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
    </div>
  );
}
