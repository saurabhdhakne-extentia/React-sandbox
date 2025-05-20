// utils/recaptchaSubmit.ts

import ReCAPTCHA from "react-google-recaptcha";

interface RecaptchaSubmitParams {
  recaptchaRef: React.RefObject<ReCAPTCHA>;
  payload: Record<string, any>;
  endpoint?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  isArabic: boolean;
  setLoading: (loading: boolean) => void;
}

export const handleRecaptchaAndSubmit = async ({
  recaptchaRef,
  payload,
  endpoint = "/api/signup",
  onSuccess,
  onError,
  isArabic,
  setLoading,
}: RecaptchaSubmitParams): Promise<void> => {
  setLoading(true);

  try {
    if (!recaptchaRef?.current) {
      console.error("ReCAPTCHA ref is not available!");
      return;
    }

    const executeAsync = recaptchaRef.current.executeAsync?.bind(recaptchaRef.current);
    const reset = recaptchaRef.current.reset?.bind(recaptchaRef.current);

    if (!executeAsync) {
      console.error("executeAsync is not available on recaptchaRef.current!");
      return;
    }

    const token = await executeAsync();
    if (reset) reset();

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, token }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log("Signup successful:", data);
      onSuccess?.(data);
    } else {
      const err = await res.json();
      console.error("Failed to submit:", err);
      alert(isArabic ? "فشل في الإرسال!" : "Submission failed!");
      onError?.(err);
    }
  } catch (err) {
    console.error("Error during reCAPTCHA execution or submission:", err);
    alert(isArabic ? "حدث خطأ!" : "An error occurred!");
    onError?.(err);
  } finally {
    setLoading(false);
  }
};
