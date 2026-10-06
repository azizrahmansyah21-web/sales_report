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
    <div className="min-h-screen bg-slate-200/60 flex justify-center py-0 md:py-6 antialiased">
      {/* Mobile Device Frame */}
      <main className="w-full max-w-md bg-[#f8fafc] min-h-screen md:min-h-[844px] md:max-h-[920px] md:rounded-3xl shadow-2xl relative flex flex-col overflow-hidden border border-slate-300/60">
        {/* Sticky Mobile Header */}
        {showHeader && (
          <MobileHeader salesName={salesName} isOnline={isOnline} />
        )}

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto pb-24 px-4 py-4 scroll-smooth">
          {children}
        </div>

        {/* Fixed Mobile Bottom Navigation */}
        {showBottomNav && <BottomNavigationBar />}
      </main>
    </div>
  );
};

export default MobilePwaLayout;
