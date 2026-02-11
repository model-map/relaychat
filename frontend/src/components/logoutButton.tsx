"use client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./shadcn_ui/button";

const LogOut = () => {
  const { setLogOut } = useAuth();
  const handleClick = () => {
    setLogOut(true);
  };

  return (
    <Button className="hover:cursor-pointer" onClick={handleClick}>
      Log out
    </Button>
  );
};
export default LogOut;
