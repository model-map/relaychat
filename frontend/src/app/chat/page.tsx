"use client";

import { Spinner } from "@/components/shadcn_ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { useChats } from "@/context/ChatsContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export interface Message {
  _id: string;
  chatId: string;
  text?: string;
  image?: {
    url: string;
    publicId: string;
  };
  messageType: "text" | "image";
  seen: boolean;
  seenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatApp = () => {
  const { isAuth, authLoading } = useAuth();
  const { chats } = useChats();
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
