"use client";

import { Spinner } from "@/components/shadcn_ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const ChatApp = () => {
  const { isAuth, authLoading, chats } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuth) {
      router.replace("/login");
    }
  }, [isAuth, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      {chats && <pre className="p-40">{JSON.stringify(chats, null, 4)}</pre>}
    </div>
  );
};
export default ChatApp;
