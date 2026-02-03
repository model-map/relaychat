import log from "loglevel";
import dotenv from "dotenv";
import { redirect } from "next/navigation";
dotenv.config();

log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "trace"); //Only show `warn` and `error` logs in production.

export default function Home() {
  return redirect("/chat");
}
