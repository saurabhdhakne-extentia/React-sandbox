import { handleRecaptchaAndSubmit } from "../utils/recaptchaSubmit";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isFormValid) return;

  await handleRecaptchaAndSubmit({
    recaptchaRef,
    payload: {
      name,
      email,
      roles: "Visitor",
      consent: isChecked,
      lang,
    },
    isArabic,
    setLoading,
    onSuccess: (data) => {
      resetFormValue();
      setShowSignup(true);
    },
  });
};
