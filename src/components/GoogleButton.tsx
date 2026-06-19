"use client";

import { signIn } from "next-auth/react";

type Props = {
  /** Rol pretendido (pestaña de registro). Si se pasa, se guarda en cookie
   *  para que el callback del servidor cree la cuenta con ese rol. En /login
   *  no se pasa: los usuarios existentes conservan su rol y los nuevos caen en
   *  FAMILIA por defecto. */
  role?: "FAMILIA" | "CUIDADORA";
  label?: string;
  callbackUrl?: string;
};

export function GoogleButton({
  role,
  label = "Continuar con Google",
  callbackUrl = "/post-login",
}: Props) {
  function handleClick() {
    if (role) {
      // Cookie de corta vida que sobrevive al redirect a Google y vuelve.
      document.cookie = `pending_role=${role}; path=/; max-age=600; samesite=lax`;
    }
    signIn("google", { callbackUrl });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-marino-200 bg-white px-4 py-2.5 font-semibold text-marino-700 transition hover:bg-marino-50"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        />
      </svg>
      {label}
    </button>
  );
}
