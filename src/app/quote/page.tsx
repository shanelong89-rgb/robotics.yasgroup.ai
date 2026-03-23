import type { Metadata } from "next";
import QuoteFlow from "./QuoteFlow";

export const metadata: Metadata = {
  title: "Get a Quote — YAS Assurance",
  description: "Instant coverage quoting for your autonomous fleet. Powered by ARIA.",
};

export default function QuotePage() {
  return <QuoteFlow />;
}
