import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
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

        {/* 404 */}
        <Route path="*" element={<Navigate to="/documents" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
