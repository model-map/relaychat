"use client";

import { useAuth } from "@/context/AuthContext";
import VerifyOtp from "./VerifyOtp";
import { Spinner } from "@/components/shadcn_ui/spinner";
import { redirect } from "next/navigation";

export default function VerifyPage() {
  const { isAuth, authLoading } = useAuth();

  if (isAuth) {
    redirect("/chat");
  }

  return (
    <>
      {authLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {!authLoading && (
        <div className="min-h-screen flex items-center justify-center">
          <VerifyOtp />
        </div>
      )}
    </>
  );
}
