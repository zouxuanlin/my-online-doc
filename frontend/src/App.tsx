import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import MainLayout from '@/layouts/MainLayout';
import AuthGuard from '@/components/AuthGuard';
import GuestGuard from '@/components/GuestGuard';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DocumentsPage from '@/pages/DocumentsPage';
import DocumentDetailPage from '@/pages/DocumentDetailPage';
import DocumentEditPage from '@/pages/DocumentEditPage';
import FoldersPage from '@/pages/FoldersPage';
import TagsPage from '@/pages/TagsPage';
import BookmarksPage from '@/pages/BookmarksPage';
import SharedWithMePage from '@/pages/SharedWithMePage';
import KnowledgeGraphPage from '@/pages/KnowledgeGraphPage';
import TemplatesPage from '@/pages/TemplatesPage';
import ImportPage from '@/pages/ImportPage';
import PublicDocumentPage from '@/pages/PublicDocumentPage';

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          {/* 公开路由 */}
          <Route
            path="/login"
            element={
              <GuestGuard>
                <LoginPage />
              </GuestGuard>
            }
          />
          <Route
            path="/register"
            element={
              <GuestGuard>
                <RegisterPage />
              </GuestGuard>
            }
          />
          {/* 公开文档查看页面（无需认证） */}
          <Route
            path="/documents/public/:slug"
            element={<PublicDocumentPage />}
          />

          {/* 保护的路由 */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <MainLayout>
                  <Navigate to="/documents" replace />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/documents"
            element={
              <AuthGuard>
                <MainLayout>
                  <DocumentsPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/documents/:id"
            element={
              <AuthGuard>
                <MainLayout>
                  <DocumentDetailPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/documents/:id/edit"
            element={
              <AuthGuard>
                <MainLayout>
                  <DocumentEditPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/documents/new"
            element={
              <AuthGuard>
                <MainLayout>
                  <DocumentEditPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/folders"
            element={
              <AuthGuard>
                <MainLayout>
                  <FoldersPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/tags"
            element={
              <AuthGuard>
                <MainLayout>
                  <TagsPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/tags/:tagId"
            element={
              <AuthGuard>
                <MainLayout>
                  <DocumentsPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <AuthGuard>
                <MainLayout>
                  <BookmarksPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/shared"
            element={
              <AuthGuard>
                <MainLayout>
                  <SharedWithMePage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/knowledge-graph"
            element={
              <AuthGuard>
                <MainLayout>
                  <KnowledgeGraphPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/templates"
            element={
              <AuthGuard>
                <MainLayout>
                  <TemplatesPage />
                </MainLayout>
              </AuthGuard>
            }
          />
          <Route
            path="/import"
            element={
              <AuthGuard>
                <MainLayout>
                  <ImportPage />
                </MainLayout>
              </AuthGuard>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/documents" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
