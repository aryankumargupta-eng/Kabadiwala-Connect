import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff, Globe2, Smartphone } from "lucide-react";
import { trpc } from "../lib/trpc";
import { useI18n, type Language, type TranslationKey } from "../i18n";
import "./LoginPage.css";

type Role = "collector" | "recycler";
type AuthMethod = "password" | "otp";

const DEMO_LOGINS = {
  "collector.demo@kabadiwala.local": {
    password: "Collector@123",
    role: "collector" as const,
  },
  "recycler.demo@kabadiwala.local": {
    password: "Recycler@123",
    role: "recycler" as const,
  },
};

const getDemoLoginRole = (email: string, password: string): Role | null => {
  const match = DEMO_LOGINS[email.trim().toLowerCase() as keyof typeof DEMO_LOGINS];
  if (!match || match.password !== password) return null;
  return match.role;
};

const languageLabels = { EN: "English", "हिंदी": "हिंदी" } as const;

function normalizeStoredLanguage(value: string | null): Language {
  return value === "हिंदी" ? "हिंदी" : "EN";
}

function getErrorKey(message: string) {
  if (/already exists/i.test(message) && /mobile/i.test(message)) return "mobileAccountExists" as const;
  if (/already exists/i.test(message) && /email/i.test(message)) return "accountExists" as const;
  if (/invalid email or password/i.test(message)) return "invalidCredentials" as const;
  if (/invalid or expired otp/i.test(message)) return "otpInvalidOrExpired" as const;
  if (/valid mobile number/i.test(message)) return "invalidMobile" as const;
  if (/unable to send otp/i.test(message)) return "unableToSendOtp" as const;
  if (/unable to verify otp/i.test(message)) return "unableToVerifyOtp" as const;
  if (/too many/i.test(message)) return "rateLimited" as const;
  if (/no account is registered/i.test(message) || /unable to sign in with this mobile/i.test(message)) return "noMobileAccount" as const;
  if (/unable to create/i.test(message) || /already in use/i.test(message)) return "accountCreateError" as const;
  if (/password must be/i.test(message)) return "passwordWeak" as const;
  if (/full name/i.test(message)) return "fullNameRequired" as const;
  return null;
}

export default function LoginPage({
  onOpenWorkspace,
  onLanguageChange,
}: {
  onOpenWorkspace: (role: Role, name?: string) => void;
  onLanguageChange: (language: Language) => void;
}) {
  const { language: appLanguage, t } = useI18n();
  const language = useMemo(() => normalizeStoredLanguage(appLanguage), [appLanguage]);
  const [flipped, setFlipped] = useState(false);
  const [loginMethod, setLoginMethod] = useState<AuthMethod>("password");
  const [signupMethod, setSignupMethod] = useState<AuthMethod>("password");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loginPhone, setLoginPhone] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [loginCountryCode, setLoginCountryCode] = useState("+91");
  const [signupCountryCode, setSignupCountryCode] = useState("+91");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);
  const [signupCooldown, setSignupCooldown] = useState(0);

  const loginMutation = trpc.auth.login.useMutation();
  const signupMutation = trpc.auth.signup.useMutation();
  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();

  const setLang = (value: Language) => {
    window.localStorage.setItem("app_language", value);
    onLanguageChange(value);
    setError("");
  };

  const displayError = (cause: unknown, fallback: TranslationKey) => {
    const message = cause instanceof Error ? cause.message : "";
    const key = getErrorKey(message);
    setError(key ? t(key) : t(fallback));
  };

  const startCooldown = (type: "login" | "signup") => {
    const setter = type === "login" ? setLoginCooldown : setSignupCooldown;
    setter(30);
    const timer = window.setInterval(() => {
      setter(value => {
        if (value <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
  };

  const loginWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email) return setError(t("emailRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t("invalidEmail"));
    if (!password) return setError(t("passwordRequired"));
    const demoRole = getDemoLoginRole(email, password);
    if (demoRole) {
      onLanguageChange(language);
      onOpenWorkspace(demoRole);
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ email, password, remember, preferredLanguage: language });
      onLanguageChange((result.user.preferredLanguage as Language) || language);
      onOpenWorkspace(result.user.role === "recycler" ? "recycler" : "collector", result.user.name ?? undefined);
    } catch (cause) {
      displayError(cause, "invalidCredentials");
    }
  };

  const signupWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = `${signupCountryCode}${String(form.get("phone") ?? "").replace(/\D/g, "")}`;
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (!name || !email || !phone || !password || !confirmPassword) return setError(t("signupFieldsRequired"));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t("invalidEmail"));
    if (password !== confirmPassword) return setError(t("passwordMismatch"));
    try {
      const result = await signupMutation.mutateAsync({ name, email, phone, password, confirmPassword, remember: false, preferredLanguage: language });
      onLanguageChange((result.user.preferredLanguage as Language) || language);
      onOpenWorkspace("collector", result.user.name ?? name);
    } catch (cause) {
      displayError(cause, "signupFieldsRequired");
    }
  };

  const sendOtp = async (mode: "login" | "signup") => {
    setError("");
    const rawPhone = mode === "login" ? loginPhone : signupPhone;
    const countryCode = mode === "login" ? loginCountryCode : signupCountryCode;
    const phone = `${countryCode}${rawPhone.replace(/\D/g, "")}`;
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return setError(t("invalidMobile"));
    if ((mode === "login" ? loginCooldown : signupCooldown) > 0) return;
    if (mode === "signup" && (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword)) return setError(t("signupFieldsRequired"));
    if (mode === "signup" && signupPassword !== signupConfirmPassword) return setError(t("passwordMismatch"));
    try {
      await sendOtpMutation.mutateAsync({ phone, mode, language });
      if (mode === "login") setLoginOtpSent(true); else setSignupOtpSent(true);
      startCooldown(mode);
    } catch (cause) {
      displayError(cause, "unableToSendOtp");
    }
  };

  const verifyMobile = async (event: FormEvent<HTMLFormElement>, mode: "login" | "signup") => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const code = String(form.get("otp") ?? "").trim();
    const rawPhone = mode === "login" ? loginPhone : signupPhone;
    const countryCode = mode === "login" ? loginCountryCode : signupCountryCode;
    const phone = `${countryCode}${rawPhone.replace(/\D/g, "")}`;
    if (!/^\d{4,10}$/.test(code)) return setError(t("otpInvalidOrExpired"));
    if (mode === "signup" && (!signupName.trim() || !signupEmail.trim() || !signupPassword || !signupConfirmPassword)) return setError(t("signupFieldsRequired"));
    if (mode === "signup" && signupPassword !== signupConfirmPassword) return setError(t("passwordMismatch"));
    try {
      const result = await verifyOtpMutation.mutateAsync({
        phone,
        code,
        mode,
        name: mode === "signup" ? signupName.trim() : undefined,
        email: mode === "signup" ? signupEmail.trim() : undefined,
        password: mode === "signup" ? signupPassword : undefined,
        confirmPassword: mode === "signup" ? signupConfirmPassword : undefined,
        remember,
        preferredLanguage: language,
      });
      onLanguageChange((result.user.preferredLanguage as Language) || language);
      onOpenWorkspace("collector", result.user.name ?? (mode === "signup" ? signupName.trim() : undefined));
    } catch (cause) {
      displayError(cause, "otpInvalidOrExpired");
    }
  };

  const methodTabs = (method: AuthMethod, setMethod: (method: AuthMethod) => void) => (
    <div className="auth-method-tabs" role="tablist" aria-label={t("chooseLogin")}>
      <button type="button" role="tab" aria-selected={method === "password"} className={method === "password" ? "active" : ""} onClick={() => { setMethod("password"); setError(""); }}>✉ {t("emailTab")}</button>
      <button type="button" role="tab" aria-selected={method === "otp"} className={method === "otp" ? "active" : ""} onClick={() => { setMethod("otp"); setError(""); }}>📱 {t("mobileTab")}</button>
    </div>
  );

  return (
    <main className="auth-login-page">
      <div className="auth-language-picker">
        <Globe2 size={18} aria-hidden="true" />
        <label htmlFor="auth-language" className="sr-only">{t("chooseLanguage")}</label>
        <select id="auth-language" value={language} onChange={event => setLang(event.target.value as Language)} aria-label={t("chooseLanguage")}>
          {(Object.keys(languageLabels) as Array<keyof typeof languageLabels>).map(item => <option key={item} value={item}>{languageLabels[item]}</option>)}
        </select>
      </div>

      <div className="auth-flip-container">
        <div className={`auth-flip-card ${flipped ? "flipped" : ""}`}>
          <section className="auth-card-side auth-front" aria-label={t("login")}>
            {!flipped && <form noValidate className="auth-form-box" onSubmit={loginMethod === "password" ? loginWithPassword : (event) => verifyMobile(event, "login")}>
              <h1>{t("login")}</h1>
              <p className="auth-subtitle">{t("chooseLogin")}</p>
              {methodTabs(loginMethod, setLoginMethod)}
              {loginMethod === "password" ? <>
                <label className="auth-field-label" htmlFor="login-email">{t("email")}</label>
                <div className="auth-input-box"><span className="auth-icon">✉</span><input id="login-email" name="email" type="email" autoComplete="username" /></div>
                <label className="auth-field-label" htmlFor="login-password">{t("password")}</label>
                <div className="auth-input-box"><span className="auth-icon">🔒</span><input id="login-password" name="password" type={showLoginPassword ? "text" : "password"} autoComplete="current-password" /><button type="button" className="auth-password-eye" aria-label={showLoginPassword ? t("hidePassword") : t("showPassword")} onClick={() => setShowLoginPassword(v => !v)}>{showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                <div className="auth-options"><label className="auth-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /><span className="auth-switch" />{t("rememberMe")}</label><button type="button" className="auth-forgot" onClick={() => setError(t("forgotPasswordPlaceholder"))}>{t("forgotPassword")}</button></div>
                <button className="auth-btn" type="submit" disabled={loginMutation.isPending}>{loginMutation.isPending ? t("loadingSignIn") : t("signIn")}</button>
              </> : <>
                <label className="auth-field-label" htmlFor="login-phone">{t("mobileNumber")}</label>
                {!loginOtpSent ? <div className="auth-phone-row"><div className="auth-input-box auth-country-box"><span className="auth-icon">🌐</span><select aria-label={t("countryCode")} value={loginCountryCode} onChange={e => setLoginCountryCode(e.target.value)}><option value="+91">+91</option><option value="+1">+1</option><option value="+44">+44</option><option value="+971">+971</option></select></div><div className="auth-input-box auth-phone-box"><span className="auth-icon"><Smartphone size={20} /></span><input id="login-phone" value={loginPhone} onChange={e => setLoginPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" inputMode="tel" autoComplete="tel" /></div></div> : <div className="auth-otp-step"><p className="auth-otp-instructions">{t("otpSentTo")} <strong>{loginPhone}</strong></p><label className="auth-field-label" htmlFor="login-otp">{t("otp")}</label><div className="auth-input-box"><span className="auth-icon">#</span><input id="login-otp" name="otp" inputMode="numeric" maxLength={10} autoComplete="one-time-code" autoFocus /></div><button type="button" className="auth-secondary" onClick={() => { setLoginOtpSent(false); setError(""); }}>{t("changeNumber")}</button></div>}
                <button className="auth-btn" type={loginOtpSent ? "submit" : "button"} disabled={sendOtpMutation.isPending || verifyOtpMutation.isPending} onClick={loginOtpSent ? undefined : () => sendOtp("login")}>{loginOtpSent ? (verifyOtpMutation.isPending ? t("loadingVerifyOtp") : t("verifyOtp")) : (sendOtpMutation.isPending ? t("loadingSendOtp") : t("sendOtp"))}</button>
                {loginOtpSent && <button type="button" className="auth-resend" disabled={loginCooldown > 0 || sendOtpMutation.isPending} onClick={() => sendOtp("login")}>{loginCooldown > 0 ? `${t("resendOtp")} (${loginCooldown}s)` : t("resendOtp")}</button>}
              </>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              <p className="auth-bottom-text">{t("noAccount")} <button type="button" className="auth-flip-link" onClick={() => { setError(""); setFlipped(true); }}>{t("signUp")}</button></p>
            </form>}
          </section>

          <section className="auth-card-side auth-back" aria-label={t("signUp")}>
            {flipped && <form noValidate className="auth-form-box auth-signup-form" onSubmit={signupMethod === "password" ? signupWithPassword : (event) => verifyMobile(event, "signup")}>
              <h1>{t("signUp")}</h1>
              <p className="auth-subtitle">{t("signupFieldsRequired")}</p>
              {methodTabs(signupMethod, setSignupMethod)}
              {!signupOtpSent ? <>
                <label className="auth-field-label" htmlFor="signup-name">{t("name")}</label>
                <div className="auth-input-box"><span className="auth-icon">👤</span><input id="signup-name" name="name" type="text" autoComplete="name" value={signupName} onChange={e => setSignupName(e.target.value)} /></div>
                <label className="auth-field-label" htmlFor="signup-mobile">{t("mobileNumber")}</label>
                <div className="auth-phone-row"><div className="auth-input-box auth-country-box"><span className="auth-icon">🌐</span><select aria-label={t("countryCode")} value={signupCountryCode} onChange={e => setSignupCountryCode(e.target.value)}><option value="+91">+91</option><option value="+1">+1</option><option value="+44">+44</option><option value="+971">+971</option></select></div><div className="auth-input-box auth-phone-box"><span className="auth-icon"><Smartphone size={20} /></span><input id="signup-mobile" name="phone" value={signupPhone} onChange={e => setSignupPhone(e.target.value.replace(/\D/g, ""))} placeholder="9876543210" inputMode="tel" autoComplete="tel" /></div></div>
                <label className="auth-field-label" htmlFor="signup-email">{t("email")}</label>
                <div className="auth-input-box"><span className="auth-icon">✉</span><input id="signup-email" name="email" type="email" autoComplete="email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} /></div>
                <label className="auth-field-label" htmlFor="signup-password">{t("password")}</label>
                <div className="auth-input-box"><span className="auth-icon">🔒</span><input id="signup-password" name="password" type={showSignupPassword ? "text" : "password"} autoComplete="new-password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} /><button type="button" className="auth-password-eye" aria-label={showSignupPassword ? t("hidePassword") : t("showPassword")} onClick={() => setShowSignupPassword(v => !v)}>{showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
                <label className="auth-field-label" htmlFor="signup-confirm">{t("confirmPassword")}</label>
                <div className="auth-input-box"><span className="auth-icon">🔒</span><input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password" value={signupConfirmPassword} onChange={e => setSignupConfirmPassword(e.target.value)} /></div>
                {signupMethod === "otp" && <p className="auth-otp-instructions">{t("otpInstructions")}</p>}
              </> : <div className="auth-otp-step"><p className="auth-otp-instructions">{t("otpSentTo")} <strong>{signupPhone}</strong></p><label className="auth-field-label" htmlFor="signup-otp">{t("otp")}</label><div className="auth-input-box"><span className="auth-icon">#</span><input id="signup-otp" name="otp" inputMode="numeric" maxLength={10} autoComplete="one-time-code" autoFocus /></div><button type="button" className="auth-secondary" onClick={() => { setSignupOtpSent(false); setError(""); }}>{t("changeNumber")}</button></div>}
              <button className="auth-btn" type={signupMethod === "otp" && !signupOtpSent ? "button" : "submit"} disabled={signupMutation.isPending || sendOtpMutation.isPending || verifyOtpMutation.isPending} onClick={signupMethod === "otp" && !signupOtpSent ? () => sendOtp("signup") : undefined}>{signupMethod === "otp" && !signupOtpSent ? (sendOtpMutation.isPending ? t("loadingSendOtp") : t("sendOtp")) : (verifyOtpMutation.isPending ? t("loadingVerifyOtp") : signupMutation.isPending ? t("loadingCreate") : t("createAccount"))}</button>
              {signupOtpSent && <button type="button" className="auth-resend" disabled={signupCooldown > 0 || sendOtpMutation.isPending} onClick={() => sendOtp("signup")}>{signupCooldown > 0 ? `${t("resendOtp")} (${signupCooldown}s)` : t("resendOtp")}</button>}
              {error && <p className="auth-error" role="alert">{error}</p>}
              <p className="auth-bottom-text">{t("haveAccount")} <button type="button" className="auth-flip-link" onClick={() => { setError(""); setFlipped(false); }}>{t("signIn")}</button></p>
            </form>}
          </section>
        </div>
      </div>
    </main>
  );
}

