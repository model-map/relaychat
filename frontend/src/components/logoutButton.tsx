"use client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./shadcn_ui/button";
import Cookies from "js-cookie";
import { useUsers } from "@/context/UsersContext";
import { useChats } from "@/context/ChatsContext";
import { toast } from "sonner";

const LogOut = () => {
  const { setIsAuth, setUser } = useAuth();
  const { setUsers } = useUsers();
  const { setChats } = useChats();
  // Logout function to use as event-handler for Logging out
  function handleLogout() {
    Cookies.remove("token");
    setUser(null);
    setUsers(null);
    setChats(null);
    setIsAuth(false);
    toast.success("Logged out");
  }

  return (
    <Button className="hover:cursor-pointer" onClick={handleLogout}>
      Log out
    </Button>
  );
};
export default LogOut;
