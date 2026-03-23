"use client";
import { usePathname } from "next/navigation";

const AUTH_PATHS = ["/login", "/signup", "/demo"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.includes(pathname);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <main className="pt-14 min-h-screen pb-20 md:pb-0">
      {children}
    </main>
  );
}
