import Image from "next/image";

// The logo of the Payload admin: shown above the login form and the "create first user" form, instead of Payload's own logo (admin.components.graphics.Logo
// in payload.config.ts). The school logo is white on a transparent background, so it suits the dark admin.
export function Logo() {
  return (
    <Image
      src="/images/header/lps-logo-v2.svg"
      alt="Learning Paths School"
      width={353}
      height={52}
      priority
      unoptimized
      style={{ width: "min(100%, 340px)", height: "auto" }}
    />
  );
}
