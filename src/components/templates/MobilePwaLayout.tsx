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
      {showHeader && (
        <MobileHeader salesName={salesName} isOnline={isOnline} />
      )}

      {/* Main body: bottom padding accounts for the always-visible bottom nav bar */}
      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-4 pb-24">
        {children}
      </main>

      {showBottomNav && <BottomNavigationBar />}
    </div>
  );
};

export default MobilePwaLayout;
