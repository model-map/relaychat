import axios from "axios";
import log from "loglevel";

export function logAxiosError(error: unknown, customMessage: string) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message =
      `${customMessage} ` + error.response?.data?.message ||
      error.message ||
      `Unknown error`;
    log.error(message);
  } else if (error instanceof Error) {
    log.error(`${customMessage} ${error.message}`);
  } else {
    log.error(`${customMessage} Unknown error`);
  }
}
