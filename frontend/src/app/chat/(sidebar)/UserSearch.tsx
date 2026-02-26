import { Input } from "@/components/shadcn_ui/input";
import { IUser } from "@/context/AuthContext";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";
import { Search, UserCircle } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { IChats } from "@/context/ChatsContext";

interface IUserSearch {
  users: IUser[] | null;
  loggedInUser: IUser | null;
  onlineUsers: string[];
  chats: IChats[] | null;
  setChats: Dispatch<SetStateAction<IChats[] | null>>;
  setShowAllUsers: Dispatch<SetStateAction<boolean>>;
  setSelectedUser: Dispatch<SetStateAction<string | null>>;
}

const UserSearch = ({
  users,
  loggedInUser,
  onlineUsers,
  chats,
  setChats,
  setSelectedUser,
  setShowAllUsers,
}: IUserSearch) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Controller to create chat
  const createChat = async (id: string) => {
    const token = Cookies.get("token");
    if (!token) {
      return;
    }
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/chat/new`,
        {
          id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSelectedUser(data.chat._id);
      setShowAllUsers(false);
      const foundUser = users?.find((u) => u._id === id);
      if (!foundUser) return; // stop if user not found

      // only run if chat doesn't already exist in `chats`
      if (!chats?.some((u) => u.chat._id === data.chat._id)) {
        setChats((prev) => [
          ...(prev ?? []),
          {
            user: foundUser,
            chat: data.chat,
          },
        ]);
      }

      toast.success(data.message);
    } catch (error) {
      logAxiosError(error, "Failed to create chat");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative mt-4 px-4">
        <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

        <Input
          type="text"
          id="search"
          name="search"
          placeholder="Search users"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          className="pl-10 h-9 text-sm bg-muted/40 focus:bg-background"
        />
      </div>
      {/* All users list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="py-2">
          {users
            ?.filter(
              (u) =>
                u._id !== loggedInUser?._id &&
                u.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .map((u) => (
              <li key={u._id}>
                <button
                  onClick={() => createChat(u._id)}
                  className="
                          w-full
                          flex items-center gap-3
                          px-4 py-3
                          text-left
                          transition-colors
                          hover:bg-accent/60
                          focus-visible:outline-none
                          focus-visible:bg-accent
                        "
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                    <UserCircle className="w-5 h-5 text-muted-foreground" />
                    {/* ONLINE INDICATOR */}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{u.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Start conversation
                    </div>
                  </div>
                  {/* ONLINE INDICATOR */}
                  {onlineUsers.includes(u?._id) && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />
                  )}
                </button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
export default UserSearch;
