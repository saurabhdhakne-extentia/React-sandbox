"use client";
import React, { useEffect, useRef, useState } from "react";
import styles from "./FooterSection.module.css";
import SignupMenu from "../SignupForm"; // Correct SignupMenu import
import ReCAPTCHA from "react-google-recaptcha";

interface FooterSectionProps {
  lang: string;
}

const FooterSection: React.FC<FooterSectionProps> = ({ lang }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const [loading, setLoading] = useState(false);
  const isArabic = lang === "ar";

  const resetFormValue = () => {
    setName('');
    setEmail('');
    setIsChecked(false);
  }

  const isNameValid = /^[a-zA-Z\s]{3,50}$/.test(name.trim());
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,4}$/.test(email.trim());

  const isFormValid = isNameValid && isEmailValid && isChecked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
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
          //console.log("reCAPTCHA token:", token);

          // Send this token along with other form fields to the backend
          const res = await fetch("/api/signup", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: name,
              email: email,
              //roles: formData.roles,
              roles: "Visitor",
              consent: isChecked,
              lang: lang,
              token: token, // Include the token
            }),
          });

          // Handle response from the server
          if (res.ok) {
            const data = await res.json();
            console.log("Signup successful:", data);
            resetFormValue();
            setShowSignup(true); // Open signup after form submission
          } else {
            const err = await res.json();
            console.error("Failed to submit:", err);
            setLoading(false);
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

  useEffect(() => {
    if (showSignup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSignup]);


  return (
    <div className={lang === "ar" ? styles.rtl : ""}>
      <footer className={styles.footer}>
        <section className={styles.newsletterSection}>
          <h2 className={styles.heading}>
            {lang === "en"
              ? "The journey's just beginning, and you're invited."
              : "الرحلة مازالت في بدايتها وأنت مدعو للمشاركة"}
          </h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <div className={styles.inputField}>
                <label htmlFor="name-input">
                  {lang === "en" ? "Your name" : "الاسم"}
                </label>
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === "en" ? "What should we call you?" : "بماذا نناديك؟"}
                  required
                />
              </div>

              <div className={styles.inputField}>
                <label htmlFor="email-input">
                  {lang === "en" ? "Your email" : "البريد الإلكتروني"}
                </label>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@email.com"
                  required
                />
              </div>
            </div>

            <div className={styles.checkboxContainer}>
              <input
                id="consent-checkbox"
                type="checkbox"
                checked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
              <label htmlFor="consent-checkbox">
                {lang === "en"
                  ? "I agree to receive updates and news from the Natural History Museum Abu Dhabi."
                  : "أوافق على تلقي التحديثات والأخبار من متحف التاريخ الطبيعي أبوظبي."}
              </label>
            </div>
            <ReCAPTCHA
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                size="invisible"
                ref={recaptchaRef}
              />
            <button type="submit" className={styles.submitButton} disabled={!isFormValid || loading}>
              {lang === "en" ? "Submit" : "سجّل الآن"}
            </button>
          </form>
        </section>


        <section className={styles.linksSection}>
          <div className={styles.linkColumn}>
            <h3>{lang === "en" ? "Helpful links" : "روابط مفيدة"}</h3>
            <nav>
              <a href="#what-we-do">{lang === "en" ? "What we do" : "كيف نصنع التغيير؟"}</a>
              <a href="#whats-going-on">{lang === "en" ? "What's going on?" : "ما هي آخر المستجدات؟"}</a>
              <a href="#Join-grow">{lang === "en" ? "Join, grow & participate" : "انضم، وتطور، وشارك"}</a>
            </nav>
          </div>

          <div className={styles.linkColumn}>
            <h3>{lang === "en" ? "Contact Us" : "تواصل معنا"}</h3>
            <nav>
              <a target="_blank" href="https://www.google.com/maps/place/Natural+History+Museum+Exhibition+Abu+Dhabi/@24.5286151,54.4009016,17z/data=!3m1!4b1!4m6!3m5!1s0x3e5e67a9c686c057:0xdb955fadf24b2c0c!8m2!3d24.5286151!4d54.4034765!16s%2Fg%2F11q4hg2grj?entry=ttu&g_ep=EgoyMDI1MDQyMy4wIKXMDSoASAFQAw%3D%3D">{lang === "en" ? "How to get here" : "كيف تصل إلى المتحف؟"}</a>
              <a target="_blank" href="https://www.linkedin.com/company/natural-history-museum-abu-dhabi/">{lang === "en" ? "Work with us" : "انضم لنا"}</a>
            </nav>
          </div>

          <div className={styles.logoColumn}>
            {lang === 'ar'?
            <img
            src="/images/footerlogo-ar.svg"
            alt="شعار متحف التاريخ الطبيعي"
          />
            :
            <img
              src="/images/footorlogo.svg"
              alt="Natural History Museum logo"
            />}
          </div>
        </section>

        <section className={styles.bottomBar}>
          <p>
            {lang === "en"
              ? "© Natural History Museum Abu Dhabi 2025. All Rights Reserved."
              : "© متحف التاريخ الطبيعي أبوظبي 2025. جميع الحقوق محفوظة."}
          </p>

          <div className={styles.policyLinks}>
            <a href="https://nhmadpubwebvideos.azureedge.net/pdfs/NaturalHistoryMuseumPrivacyNotice.pdf"
            target="_blank"
            rel="noopener noreferrer"
            >
              {lang === "en" ? "Privacy notice" : "سياسة الخصوصية "}
            </a>
          </div>
        </section>
      </footer>

      {showSignup && (
        <SignupMenu lang={lang} onClose={() => setShowSignup(false)} isSubmitted={true} />
      )}
    </div>
  );
};

export default FooterSection;
