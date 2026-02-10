"use client";

import { Spinner } from "@/components/shadcn_ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import Login from "./Login";

const LoginPage = () => {
  const { isAuth, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isAuth) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Login />
    </div>
  );
};
export default LoginPage;
