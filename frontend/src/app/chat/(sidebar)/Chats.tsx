import { Button } from "@/components/shadcn_ui/button";
import { IUser } from "@/context/AuthContext";
import { IChats } from "@/context/ChatsContext";
import { logAxiosError } from "@/lib/logAxiosError";
import { CornerDownRight, CornerUpLeft, UserCircle } from "lucide-react";
import { Dispatch, SetStateAction, useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { IMessage } from "../page";

interface IChatsProps {
  loggedInUser: IUser | null;
  chats: IChats[];
  onlineUsers: string[];
  selectedUser: string | null;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
  setUser: Dispatch<SetStateAction<IUser | null>>;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
}

const Chats = ({
  chats,
  selectedUser,
  onlineUsers,
  loggedInUser,
  setUser,
  setSelectedUser,
  setMessages,
}: IChatsProps) => {
  // useEffect to fetch messages after a chat is selected
  useEffect(() => {
    const fetchMessages = async () => {
      const token = Cookies.get("token");
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/messages/${selectedUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setMessages(data.messages);
        setUser(data.user);
      } catch (error) {
        logAxiosError(error, `Failed to fetch chat`);
      }
    };

    if (selectedUser) {
      fetchMessages();
    }
  }, [selectedUser, setMessages, setUser]);

  return (
    <div className="space-y-2 mt-4 overflow-y-auto h-full pb-4">
      {chats.map((chat) => {
        const latestMessage = chat.chat.latestMessage;
        const isSelected = selectedUser === chat.chat._id;
        const isSentByMe = latestMessage?.sender === loggedInUser?._id;
        const unseenCount = chat.chat.unseenCount || 0;

        return (
          <Button
            key={chat.chat._id}
            onClick={() => setSelectedUser(chat.chat._id)}
            variant="ghost"
            className={`
                    w-full
                    justify-start
                    px-4 py-3
                    h-auto
                    rounded-none
                    transition-colors
                    ${isSelected ? "bg-accent" : "hover:bg-accent/60"}
                  `}
          >
            <div className="flex w-full items-center gap-3">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <UserCircle className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate text-sm font-medium">
                      {chat.user.name}
                    </span>
                    {/* MESSAGE RECEIVED/SENT ARROW ICON */}
                    {isSentByMe ? (
                      <CornerDownRight
                        size={14}
                        className="shrink-0 text-muted-foreground"
                      />
                    ) : (
                      <CornerUpLeft
                        size={14}
                        className="shrink-0 text-muted-foreground"
                      />
                    )}
                  </div>

                  {unseenCount > 0 && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                      {unseenCount > 99 ? "99+" : unseenCount}
                    </span>
                  )}
                </div>

                <div
                  className={`mt-0.5 truncate text-xs ${
                    isSelected
                      ? "text-muted-foreground"
                      : "text-muted-foreground/80"
                  }`}
                >
                  {latestMessage?.text ?? "No messages yet"}
                </div>
              </div>
              {/* ONLINE INDICATOR */}
              {onlineUsers.includes(chat.user?._id) && (
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
};
export default Chats;
