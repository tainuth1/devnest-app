import WelcomeCard from "@/shared/components/ui/welcome-card";
import React from "react";

const AuthenticationLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen gap-0 bg-gray-50 p-2 md:gap-4 md:p-4 lg:gap-8 lg:p-8">
      <WelcomeCard />
      {children}
    </div>
  );
};

export default AuthenticationLayout;
