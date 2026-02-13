import axios from "axios";

import { toast } from "sonner";

export function logAxiosError(error: unknown, customMessage: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || `Unknown error`;
    toast.error(`${customMessage} ` + message);
  } else if (error instanceof Error) {
    toast.error(`${customMessage} ${error.message}`);
  } else {
    toast.error(`${customMessage} Unknown error`);
  }
}
