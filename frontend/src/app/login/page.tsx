"use client";

import { useAuth } from "@/context/AuthContext";
import Login from "./Login";
import "animate.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/shadcn_ui/spinner";

const LoginPage = () => {
  const { isAuth, authLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isAuth) {
      router.replace("/chat");
    }
  }, [isAuth, authLoading, router]);

  if (authLoading || isAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center animate__animated animate__fadeIn">
      <Login />
    </div>
  );
};
export default LoginPage;
