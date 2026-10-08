import React from "react";
import MobileHeader from "@/components/organisms/MobileHeader";
import BottomNavigationBar from "@/components/organisms/BottomNavigationBar";

export interface MobilePwaLayoutProps {
  children: React.ReactNode;
  salesName?: string;
  isOnline?: boolean;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export const MobilePwaLayout: React.FC<MobilePwaLayoutProps> = ({
  children,
  salesName = "Bagus Triyanto",
  isOnline = true,
  showHeader = true,
  showBottomNav = true,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Responsive Top Header */}
      {showHeader && (
        <MobileHeader salesName={salesName} isOnline={isOnline} />
      )}

      {/* Main Responsive Body Container (Centers and breathes gracefully on desktop) */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar (Hidden on desktop md:) */}
      {showBottomNav && <BottomNavigationBar />}
    </div>
  );
};

export default MobilePwaLayout;
