import { handleRecaptchaAndSubmit } from "../utils/recaptchaSubmit";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!isValid || formData.roles.length === 0) return;

  await handleRecaptchaAndSubmit({
    recaptchaRef,
    payload: {
      name: formData.name,
      email: formData.email,
      roles: formData.roles.toString(),
      consent: formData.consent,
      lang,
    },
    isArabic,
    setLoading,
    onSuccess: () => setSubmitted(true),
  });
};
