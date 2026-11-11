import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="page-body min-h-0 flex-1 overflow-y-auto bg-(--color-lavender-bg)" style={{ padding: '16px 20px' }}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
