"use client";

import log from "loglevel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/shadcn_ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn_ui/card";
import { Input } from "@/components/shadcn_ui/input";
import { Label } from "@/components/shadcn_ui/label";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Spinner } from "@/components/shadcn_ui/spinner";

export default function LoginPage() {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/login`,
        {
          email,
        },
      );
      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message || error.message || "Request failed";

        // Handling known cases
        if (status === 400) {
          toast.error(`${message}`);
        }
        if (status === 401) toast.error("Unauthorized");
        if (status === 500) toast.error("Server error");
      } else if (error instanceof Error) {
        toast.error(`Error while submitting login form: ${error.message}`);
      } else {
        toast.error(`Unknown error. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl mx-auto pb-2">
              Welcome to Relay Chat
            </CardTitle>
            <CardDescription className="mx-auto">
              Enter your email to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  <Mail /> Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Spinner />}
              {!loading && (
                <>
                  Send Verification Code <ArrowRight />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
