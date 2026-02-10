"use client";

import { useAuth } from "@/context/AuthContext";
import VerifyOtp from "./VerifyOtp";
import { Spinner } from "@/components/shadcn_ui/spinner";
import "animate.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const { isAuth, authLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!authLoading && isAuth) {
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
      <VerifyOtp />
    </div>
  );
}
