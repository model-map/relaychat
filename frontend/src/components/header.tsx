"use client";

import { useAuth } from "@/context/AuthContext";
import LogOut from "./logoutButton";
import { ModeToggle } from "./shadcn_ui/theme-toggle";
import LoginButton from "./loginButton";

const Header = () => {
  const { isAuth } = useAuth();

  return (
    <div className="w-full px-10 bg-card h-15 flex items-center">
      {/* LEFT SECTION */}
      <div></div>
      <div className="space-x-4 ml-auto">
        {isAuth && <LogOut />}
        {!isAuth && <LoginButton />}
        <ModeToggle />
      </div>
    </div>
  );
};
export default Header;
