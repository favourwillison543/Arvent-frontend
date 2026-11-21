import { SignedInRedirect } from "@/components/auth/SignedInRedirect";
import { LandingPage } from "@/components/landing/LandingPage";

export default function Page() {
  return (
    <>
      {/* Marketing is for logged-out visitors: a session sends `/` to `/home`. */}
      <SignedInRedirect />
      <LandingPage />
    </>
  );
}
