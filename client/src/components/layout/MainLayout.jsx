import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingAiWidget from '../ai/FloatingAiWidget';

// Primary application shell providing consistent navigation, content container, and footer
export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-brand-charcoal antialiased">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <FloatingAiWidget />
    </div>
  );
}
