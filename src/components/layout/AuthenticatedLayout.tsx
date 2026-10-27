import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileNavigation } from './MobileNavigation';
import { AppHeader } from './AppHeader';

export const AuthenticatedLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-midnight relative text-themeText-primary selection:bg-brand-bright-violet/30 selection:text-white">
      {/* Subtle Atmospheric Gradient Layer */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#5520A8]/15 via-[#17112F]/10 to-transparent blur-[120px] transform-gpu dark:opacity-100 opacity-20" />
        <div className="absolute inset-0 bg-mesh-grid dark:opacity-40 opacity-10 mask-radial" />
      </div>

      {/* Desktop Sidebar (Left column in flex row, fixed height) */}
      <div className="hidden lg:block shrink-0 sticky top-0 h-screen z-20">
        <DesktopSidebar />
      </div>

      {/* Mobile Drawer (visible on mobile/tablet when triggered) */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area (Right column in flex row, fills remaining width) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen z-10 overflow-x-hidden">
        {/* Top Header */}
        <AppHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Dynamic Nested Route View */}
        <main className="flex-1 w-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
