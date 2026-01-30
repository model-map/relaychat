import log from "loglevel";
import dotenv from "dotenv";
dotenv.config();

export default function Home() {
  log.setLevel(process.env.NODE_ENV === "production" ? "warn" : "trace");
  log.info("In Home Page");
  return <h1>Home</h1>;
}
