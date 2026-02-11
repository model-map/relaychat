"use client";
import { Button } from "./shadcn_ui/button";
import Link from "next/link";

const LoginButton = () => {
  return (
    <Button className="hover:cursor-pointer">
      <Link href="/login">Log In</Link>
    </Button>
  );
};
export default LoginButton;
