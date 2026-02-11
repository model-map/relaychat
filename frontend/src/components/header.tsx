"use client";

import { useAuth } from "@/context/AuthContext";
import LogOut from "./logoutButton";
import { ModeToggle } from "./shadcn_ui/theme-toggle";
import LoginButton from "./loginButton";

const Header = () => {
  const { isAuth } = useAuth();

  return (
    <div className="min-w-screen px-10 bg-primary-foreground min-h-15 flex items-center">
      {/* LEFT SECTION */}
      <div></div>
      <div className="space-x-4 ml-auto">
        <ModeToggle />
        {isAuth && <LogOut />}
        {!isAuth && <LoginButton />}
      </div>
    </div>
  );
};
export default Header;
