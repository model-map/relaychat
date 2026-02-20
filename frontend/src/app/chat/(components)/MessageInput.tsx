import { Button } from "@/components/shadcn_ui/button";
import { Input } from "@/components/shadcn_ui/input";
import { Loader2, Paperclip, SendHorizonal } from "lucide-react";
import { IMessage } from "../page";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { logAxiosError } from "@/lib/logAxiosError";
import axios from "axios";
import Cookies from "js-cookie";

interface IMessageInput {
  selectedUser: string | null;
  message: string | null;
  setMessage: Dispatch<SetStateAction<string | null>>;
  setMessages: Dispatch<SetStateAction<IMessage[] | null>>;
}

const MessageInput = ({
  selectedUser,
  message,
  setMessage,
  setMessages,
}: IMessageInput) => {
  // State for storing file
  const [file, setFile] = useState<File | null>(null);
  const [IsLoading, setIsLoading] = useState<boolean>(false);
  // use ref for clicking input:file button
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.target.files || null;
    if (files && files[0].type.startsWith("image")) {
      setFile(files[0]);
    }
  };

  // send message
  const sendMessage = async (
    e: React.SubmitEvent<HTMLFormElement>,
    message?: string,
    image?: File | null,
  ) => {
    e.preventDefault();

    if (!message?.trim() && !image) return;
    if (!selectedUser) return;

    const token = Cookies.get("token");
    if (!token) return;
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("chatId", selectedUser);
      if (message) {
        formData.append("text", message);
      }
      if (image) {
        formData.append("image", image);
      }
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_CHAT_SERVICE}/api/v1/message`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      setMessages((prev) =>
        prev && prev.length > 0 ? [...prev, data.message] : [data.message],
      );
      setMessage("");
      setFile(null);
    } catch (error) {
      logAxiosError(error, "Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      className="flex gap-2 w-full ml-auto mt-auto px-10 mb-5"
      onSubmit={(e) => sendMessage(e, message ?? "", file)}
    >
      <Input
        className="rounded-xl"
        type="text"
        placeholder={file ? `Add a caption` : "Send a message"}
        value={message || ""}
        onChange={(e) => setMessage(e.target.value)}
      />
      {/* ATTACH FILES BUTTON */}
      <div>
        <Button
          variant="outline"
          className="rounded-full"
          type="button"
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="-rotate-45" />
        </Button>
        <Input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e)}
        ></Input>
      </div>
      {/* SUBMIT BUTTON */}
      <Button
        className="rounded-full bg-primary/90 hover:bg-primary
        disabled:cursor-not-allowed"
        type="submit"
        disabled={IsLoading || (!message && !file)}
      >
        {IsLoading && <Loader2 className="animate-spin" />}
        {!IsLoading && <SendHorizonal />}
      </Button>
    </form>
  );
};
export default MessageInput;
