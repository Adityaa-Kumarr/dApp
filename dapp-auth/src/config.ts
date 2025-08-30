import { type Config } from "@coinbase/cdp-hooks";
import { type AppConfig } from "@coinbase/cdp-react";

export const CDP_CONFIG: Config = {
  projectId: import.meta.env.VITE_CDP_PROJECT_ID,
  createAccountOnLogin: import.meta.env.VITE_CDP_CREATE_ACCOUNT_TYPE === "evm-smart" ? "evm-smart" : "evm-eoa",
};

export const APP_CONFIG: AppConfig = {
  name: "CDP React StarterKit",
  logoUrl: "http://localhost:3000/logo.svg",
  authMethods: ["email", "sms"],
};
