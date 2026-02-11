"use client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./shadcn_ui/button";

const LogOut = () => {
  const { logOut } = useAuth();
  return (
    <Button className="hover:cursor-pointer" onClick={logOut}>
      Log out
    </Button>
  );
};
export default LogOut;
