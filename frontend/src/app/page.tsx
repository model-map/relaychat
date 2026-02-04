import log from "loglevel";
import { redirect } from "next/navigation";

log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "trace"); //Only show `warn` and `error` logs in production.

export default function Home() {
  return redirect("/chat");
}
