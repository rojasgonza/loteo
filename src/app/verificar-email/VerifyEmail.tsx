"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verified = searchParams.get("verified");
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (verified === "true") {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      const redirectTimeout = setTimeout(() => {
        router.push("/login");
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [verified, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div
          className={`p-6 rounded-lg shadow-md text-center ${
            verified === "true" ? "text-green-600" : "text-red-600"
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">
            {verified === "true"
              ? "Verificación exitosa"
              : "Error de verificación"}
          </h2>
          <p>
            {verified === "true"
              ? `Email verificado correctamente ✅. Serás redirigido al login en ${countdown}`
              : "Token inválido o expirado ❌"}
          </p>
        </div>
      </div>
    </div>
  );
}
