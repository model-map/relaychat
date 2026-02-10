import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/shadcn_ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn_ui/card";
import { Field, FieldLabel } from "@/components/shadcn_ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/shadcn_ui/input-otp";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { ArrowRight, RefreshCwIcon } from "lucide-react";
import { Spinner } from "@/components/shadcn_ui/spinner";
import { useAuth } from "@/context/AppContext";

const VerifyOtp = () => {
  // Data from context
  const { isAuth, setIsAuth, setUser } = useAuth();
  // Getting search params
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  //   States
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(60);
  const [error, setError] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setResendLoading(false);
    }
  }, [timer]);

  const handleResend = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/login`,
        {
          email,
        },
      );
      setResendLoading(true);
      setTimer(60);
      toast.success(data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message || error.message || "Request failed";

        // Handling known cases
        if (status === 400) {
          toast.error(`${message}`);
        }
        if (status === 429) {
          setError(message);
        }
        if (status === 500) setError("Server error. Please try again later");
      } else if (error instanceof Error) {
        setError(`${error.message}`);
      } else {
        setError(`Unknown error. Please try again later.`);
      }
    }
  };

  const handleSubmit = async (
    e: React.SubmitEvent<HTMLElement>,
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      // Check if OTP is numeric and 6 digits or not.
      if (!otp.match(/^\d{6}$/)) {
        throw new Error("OTP must be a 6-digit number.");
      }

      //   If OTP is a valid 6-digit number
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_USER_SERVICE}/api/v1/verify`,
        {
          email,
          otp,
        },
      );
      setError("");
      Cookies.set("token", data.token, {
        expires: 15,
        secure: false, // AWS hosting is on http, not https
        path: "/",
      });
      toast.success(data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message =
          error.response?.data?.message || error.message || "Request failed";

        // Handling known cases
        if (status === 400) {
          setError(`${message}`);
        }
        if (status === 401) setError("Unauthorized");
        if (status === 500) setError("Server error");
      } else if (error instanceof Error) {
        setError(`Error while submitting login form: ${error.message}`);
      } else {
        setError(`Unknown error. Please try again later.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit}>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify your login</CardTitle>
          <CardDescription>
            Enter the OTP sent to your email address:{" "}
            <span className="font-medium">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">Enter OTP</FieldLabel>
              <Button
                variant="outline"
                size="xs"
                disabled={resendLoading}
                onClick={handleResend}
                autoFocus={false}
              >
                {!resendLoading && <RefreshCwIcon />}
                {resendLoading && (
                  <>
                    <Spinner />
                    {timer} {" - "}
                  </>
                )}
                Resend Code
              </Button>
            </div>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                id="otp-verification"
                pattern={REGEXP_ONLY_DIGITS}
                value={otp}
                onChange={(otp) => setOtp(otp)}
                required
              >
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="mx-2" />
                <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </Field>
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-center gap-5">
          <Field>
            {error && (
              <span className="text-destructive text-sm text-center">
                {error}
              </span>
            )}
          </Field>
          <Field>
            <Button type="submit" className="w-full" autoFocus>
              {!loading && (
                <>
                  {" "}
                  Verify
                  <ArrowRight />
                </>
              )}
              {loading && <Spinner />}
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </form>
  );
};
export default VerifyOtp;
