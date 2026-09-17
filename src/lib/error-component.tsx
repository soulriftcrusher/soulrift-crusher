import type { ErrorComponentProps } from "@tanstack/react-router";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const msg = error?.message || "";
  const translateCrash = /removeChild|NotFoundError/i.test(msg);

  function reload() {
    window.location.href = "/";
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-fg">
      <p className="font-display text-2xl text-gold">The hunt hiccuped</p>
      <p className="max-w-md text-sm text-fg/85">
        {translateCrash
          ? "The phone tried to translate the page and knocked the hunt over. Turn off Translate on this site. Your save is still here."
          : "Something in the page broke. Your gold, heroes, and souls are still saved on this phone."}
      </p>
      <button
        type="button"
        className="mt-2 grid h-12 min-w-[12rem] place-items-center rounded-md border-2 border-gold bg-accent font-display text-base text-parchment-ink"
        onClick={reload}
      >
        Back to the hunt
      </button>
    </main>
  );
}
