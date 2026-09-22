"use client";

interface CheckoutButtonProps {
  stripeUrl?: string;
  buttonText?: string;
  plan?: "regular" | "elite";
}

export function CheckoutButton({ buttonText, plan = "regular" }: CheckoutButtonProps) {
  return (
    <div className="w-full">
      <button
        disabled
        className="w-full py-4 bg-surface-container-high text-on-surface-variant font-label-md font-semibold text-sm rounded-full shadow-sm flex items-center justify-center gap-2 cursor-not-allowed opacity-70"
      >
        <span className="material-symbols-outlined text-base">schedule</span>
        EM BREVE
      </button>
      <p className="mt-2 text-center text-xs text-on-surface-variant">
        As vagas ainda não estão abertas. Avisaremos quando as inscrições abrirem!
      </p>
    </div>
  );
}
