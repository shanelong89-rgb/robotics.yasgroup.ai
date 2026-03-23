import type { Metadata } from "next";
import OnboardFlow from "./OnboardFlow";

export const metadata: Metadata = {
  title: "Onboard Fleet | YAS Assurance",
  description: "Onboard your autonomous fleet with YAS and get covered in minutes.",
};

export default function OnboardPage() {
  return <OnboardFlow />;
}
