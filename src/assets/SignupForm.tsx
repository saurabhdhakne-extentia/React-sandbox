// SignupMenu.tsx
import React, { useState, useEffect, useRef } from "react";
import styles from "./SignupForm.module.css";
import ReCAPTCHA from "react-google-recaptcha";
// import ReCAPTCHA from "react-google-recaptcha";

interface SignupMenuProps {
  lang: string;
  onClose: () => void;
  isSubmitted?: boolean | undefined
}

const SignupMenu: React.FC<SignupMenuProps> = ({ lang, onClose, isSubmitted }) => {
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
    const isArabic = lang === "ar";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    consent: false,
    roles: ["Visitor"] as string[],
  });
  const [submitted, setSubmitted] = useState(isSubmitted ? true : false);
  const [isValid, setIsValid] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  //   const connectionString = "https://musemofabustorage2.table.core.windows.net/signupforms?sp=raud&st=2025-04-26T10:42:04Z&se=2026-12-31T10:42:00Z&sv=2024-11-04&sig=3KIArNg8JG7Xi9%2FuLNAsuX%2F675Aowa3%2FC%2BAXFPXBGm0%3D&tn=signupforms"
  //  //process.env.AZURE_STORAGE_CONNECTION_STRING!;
  //   const tableName = "signupforms"; //process.env.AZURE_TABLE_NAME!;

  // const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  //     const tableName = process.env.AZURE_TABLE_NAME || "signupforms";

  // const listSubmissions = async () => {
  //   try {
  //     const client = TableClient.fromConnectionString(connectionString, tableName);
  //     const entities = client.listEntities();
  //     for await (const entity of entities) {
  //       console.log(`- ${entity.name} (${entity.email})`);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching submissions:", error);
  //   }
  // };

  useEffect(() => {
    const nameValid = /^[a-zA-Z\s]{3,50}$/.test(formData.name);
    const emailValid = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,4}$/.test(formData.email);
    setIsValid(nameValid && emailValid && formData.consent);
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRoleSelect = (role: string) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
  
    if (!isValid || formData.roles.length === 0) {
      return;
    }
  
    setLoading(true);
  
    try {
      if (recaptchaRef.current) {
        // Type narrowing: explicitly check executeAsync
        const executeAsyncFn = recaptchaRef.current.executeAsync?.bind(recaptchaRef.current);
        const resetFn = recaptchaRef.current.reset?.bind(recaptchaRef.current);
  
        if (executeAsyncFn) {
          const token = await executeAsyncFn(); // Generate token
          if (resetFn) {
            resetFn(); // Reset reCAPTCHA
          }
          console.log("reCAPTCHA token:", token);
  
          // Send this token along with other form fields to the backend
          const res = await fetch("/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: formData.name,
              email: formData.email,
              roles: formData.roles.toString(),
              consent: formData.consent,
              lang: lang,
              token: token, // Include the token
            }),
          });
  
          // Handle response from the server
          if (res.ok) {
            const data = await res.json();
            console.log("Signup successful:", data);
            setSubmitted(true); // Optional: If you need to show a "submitted" state
          } else {
            const err = await res.json();
            console.error("Failed to submit:", err);
            alert(isArabic ? "فشل في الإرسال!" : "Submission failed!");
          }
        } else {
          console.error("executeAsync is not available on recaptchaRef.current!");
        }
      } else {
        console.error("ReCAPTCHA ref is not available!");
      }
    } catch (err) {
      console.error("Error during reCAPTCHA execution or submission:", err);
      alert(isArabic ? "حدث خطأ!" : "An error occurred!");
    } finally {
      setLoading(false);
    }
  };
  

  const getRoleText = (role: string) => {
    let roleText = '';
    if (isArabic) {
      roleText = role === "Visitor"
        ? "زائر"
        : role === "Employment"
          ? "توظيف"
          : role === "Volunteer"
            ? "متطوع"
            : "راعي"
    } else {
      roleText = role
    }
    return (
      <div className={styles.roleWrapper}>
        <span>{roleText}</span>
        <img
          src="/images/cancel.svg"
          alt="Menu icon"
          className={styles.menuIcon}
        />
      </div>
    )
  }


  const allFieldsFilled = formData?.name !== '' && formData?.email !== '' && formData?.consent === true && formData?.roles?.length > 0;
  
  return (
    <div className={styles.modelOverlay}>
    <div
      className={`${styles.overlay} ${styles.openFromRight} ${isArabic ? styles.rtl : ""}`}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        dir={isArabic ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`${styles.closeButton} ${isArabic ? styles.closeButtonRTL : ""}`}
          aria-label="Close"
        >
         <img src="/images/cross-icon.svg" alt="cross icon" className={styles.closeButtonIcon} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.title}>
              {isArabic ? "كن جزءاً من شيء أكبر" : "Be part of something bigger"}
            </h2>
            <img src="/images/signup.svg" alt="Museum" className={styles.img} />
            <p className={styles.subtitle}>
              {isArabic
                ? "تابع آخر المستجدات حول متحف التاريخ الطبيعي أبوظبي، بما في ذلك اللمحات الحصرية، والتحديثات حول موعد الافتتاح، والمحتوى الحصري، وطرق المشاركة في كل ما هو جديد."
                : `Stay in the loop with all things Natural History Museum Abu Dhabi—sneak peeks, opening updates, exclusive content, and ways to participate.`
              }
            </p>
            <p className={styles.subtitle}>
              {isArabic
                ? "اشترك الآن واحصل على هدية مميزة."
                : `Sign up and get a special gift.`}
            </p>
            <label htmlFor="name" className={styles.label}>
              {isArabic ? "الاسم" : "Your name"}
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder={isArabic ? "بماذا نناديك؟" : "What should we call you?"}
            />

            <label htmlFor="email" className={styles.label}>
              {isArabic ? "البريد الإلكتروني" : "Your email"}
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="email@email.com"
            />
            {isValid && (
              <>
                <label className={styles.label}>
                  {isArabic ? "انضم إلينا كـ" : "Join us as a"}
                </label>
                <div className={styles.roleButtons}>
                  {["Visitor", "Employment", "Volunteer", "Sponsor"].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleSelect(role)}
                      className={`${styles.roleButton} ${formData.roles.includes(role) ? styles.activeRole : ""}`}
                    >
                      {getRoleText(role)}
                    </button>
                  ))}
                </div>
              </>
            )}
            <div className={styles.checkboxContainer}>
              <input
                id="consent"
                type="checkbox"
                checked={formData.consent}
                onChange={handleInputChange}
              />
              <label htmlFor="consent">
                {isArabic
                  ? "أوافق على تلقي التحديثات والأخبار من متحف التاريخ الطبيعي أبوظبي."
                  : "I agree to receive updates and news from the Natural History Museum Abu Dhabi."}
              </label>
            </div>
            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                ref={recaptchaRef}
              />
            <button type="submit" className={styles.submitButton} disabled={!allFieldsFilled || loading}>
              {loading ? (isArabic ? "جارٍ الإرسال..." : "Submitting...") : isArabic ? "سجّل الآن" : "Submit"}
            </button>
          </form>
        ) : (
          <div className={styles.successContainer}>
            <h3 className={styles.successHeading}>
              {isArabic ? "شكراً لمشاركة معلوماتك!" : "Thanks for sharing your details!"}
            </h3>

            <div className={styles.successImageWrapper}>
              <img src="/images/signup.svg" alt="Museum" className={styles.successBannerImg} />
              <img src="/images/qr1.svg" alt="QR code" className={styles.qrOverlay} />
            </div>

            <div className={styles.successBox}>
              <p className={styles.successText}>
              <img
                  src="/images/bulb-Icon.svg"
                  alt="Success icon"
                />
                {isArabic
                  ? "امسح رمز الاستجابة السريعة أعلاه لتدخل عالم تي ريكس الخاص بنا — اقترب وتفاعل كما لم تفعل من قبل."
                  : "Scan the QR code above to step into the world of our T. rex—get up close and interact like never before."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SignupMenu;
