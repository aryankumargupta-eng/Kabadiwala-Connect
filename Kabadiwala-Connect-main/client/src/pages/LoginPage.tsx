import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Globe2,
  Headphones,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  UserRound,
  Volume2,
} from "lucide-react";
import { formatRate, nationalPriceBenchmarks } from "../data/procurementPrices";
import { trpc } from "../lib/trpc";
import { useI18n, type Language, type TranslationKey } from "../i18n";
import "./LoginPage.css";

type Role = "collector" | "recycler";
type Locale = "EN" | "हिंदी" | "मराठी";
type AuthView = "register" | "login";
type AuthMethod = "password" | "otp";
type RegistrationRole = "collector" | "dealer" | "recycler";

const demoLogins = {
  "collector.demo@kabadiwala.local": {
    password: "Collector@123",
    role: "collector" as const,
  },
  "recycler.demo@kabadiwala.local": {
    password: "Recycler@123",
    role: "recycler" as const,
  },
};

const words = {
  EN: {
    ticker: "Workbook procurement benchmarks:",
    badge: "Grassroots Dignity & Direct Fair Pay",
    hero: "Apna Kaam,",
    highlight: "Sahi Daam",
    end: "aur Samman.",
    intro:
      "Register directly on our website from home or mobile. No need to visit any center or submit physical files. Start trading scrap at fair rates today!",
    feat: ["Sahi Wazan", "Turant Bhugtan", "Instant E-Card"],
    featDesc: [
      "Certified digital weighing right on mobile with zero manipulation.",
      "Receive cash or direct UPI payment instantly in seconds.",
      "Get your official digital ID card immediately after registration.",
    ],
    benefit: "100% Self-Service Online Registration",
    benefitDesc:
      "Fill the details right here. Create your account securely online.",
    official: "Official Portal",
    activation: "Secure Online Access",
    register: "Direct Registration",
    login: "Sign In",
    regHeading: "Complete Online Registration",
    regDesc: "Enter your details below. No center visit required.",
    role: "Choose Your Category",
    collector: "Kabadi Saathi",
    dealer: "Bhangar Shop",
    recycler: "Recycler",
    name: "Full Name",
    mobile: "Mobile Number",
    email: "Email Address",
    emailNote: "Required for account access",
    city: "City & Ward / Area",
    mode: "Collection Mode",
    password: "Create Password",
    confirm: "Confirm Password",
    terms:
      "I agree to the Fair Trade pricing guidelines and certify the details provided are accurate.",
    create: "Create Account",
    already: "Already registered with us?",
    loginHere: "Login directly here",
    loginHeading: "Login to Your Account",
    loginDesc:
      "Sign in using your mobile OTP or registered email and password.",
    otp: "Mobile OTP",
    emailPassword: "Email & Password",
    registered: "Registered Mobile",
    send: "Send OTP",
    verify: "Verify & Enter",
    code: "Enter the verification code",
    edit: "Edit number",
    resend: "Resend OTP",
    noOtp: "Haven't received it?",
    forgot: "Forgot?",
    remember: "Remember me",
    noAccount: "Don't have an account yet?",
    registerFree: "Register for free now",
    instant: "Direct Instant Verification",
    noCenter: "No Physical Center Required",
    footer: "Digital Inclusion for Circular Economy",
    footerNote: "Built with dignity for informal waste workers",
    rateCard: "Rate Card",
    rights: "Worker Rights",
    privacy: "Privacy Policy",
    termsError: "Please agree to the fair trade guidelines to continue.",
    cityError: "Please enter your city or area.",
    mismatch: "The passwords do not match.",
    changed: "Language changed",
    voice: "Bol Ke Batayein",
    stop: "Stop audio",
    voiceText:
      "Welcome to Kabadiwala Connect. You can register directly on this website. Please enter your name, mobile number and password to create an account.",
    rateNote:
      "Indicative national ranges; local rates depend on grade and location.",
    vehicle: ["Hand Cart", "On Foot", "Auto / Tempo", "Permanent Shop"],
  },
  हिंदी: {
    ticker: "कार्यपुस्तिका खरीद दरें:",
    badge: "कचरा बीनने वाले और कबाड़ी साथियों का सच्चा मंच",
    hero: "मेहनत आपकी,",
    highlight: "सही दाम",
    end: "और सम्मान!",
    intro:
      "बिना किसी केंद्र पर जाए, सीधे अपने मोबाइल से वेबसाइट पर पंजीकरण करें। किसी कागजात या दफ्तर के चक्कर लगाने की जरूरत नहीं।",
    feat: ["सटीक डिजिटल तौल", "हाथों-हाथ पैसा", "डिजिटल पहचान पत्र"],
    featDesc: [
      "हर खरीद पर डिजिटल कांटा, कोई हेराफेरी नहीं।",
      "कबाड़ बेचते ही नकद या सीधे बैंक खाते में भुगतान।",
      "पंजीकरण होते ही मोबाइल पर तुरंत मान्य आईडी कार्ड प्राप्त करें।",
    ],
    benefit: "100% ऑनलाइन मुफ्त पंजीकरण",
    benefitDesc: "यहीं सीधे विवरण भरें और सुरक्षित रूप से खाता बनाएं।",
    official: "आधिकारिक पोर्टल",
    activation: "सुरक्षित ऑनलाइन प्रवेश",
    register: "सीधा नया पंजीकरण",
    login: "लॉगिन करें",
    regHeading: "सीधा ऑनलाइन पंजीकरण फॉर्म",
    regDesc: "नीचे अपनी जानकारी भरें। किसी केंद्र जाने की आवश्यकता नहीं।",
    role: "अपनी श्रेणी चुनें",
    collector: "कबाड़ी साथी",
    dealer: "भंगार दुकान",
    recycler: "रीसायकलर",
    name: "पूरा नाम",
    mobile: "मोबाइल नंबर",
    email: "ईमेल पता",
    emailNote: "खाते के लिए आवश्यक",
    city: "शहर और वार्ड / इलाका",
    mode: "कबाड़ ढोने का साधन",
    password: "नया पासवर्ड बनाएं",
    confirm: "पासवर्ड दोबारा डालें",
    terms: "मैं नियमों और सही तौल नीति से सहमत हूँ और दी गई जानकारी सत्य है।",
    create: "खाता बनाएं",
    already: "पहले से खाता बना हुआ है?",
    loginHere: "यहां लॉगिन करें",
    loginHeading: "अपने खाते में लॉगिन करें",
    loginDesc: "अपने मोबाइल ओटीपी या पासवर्ड से आसानी से लॉगिन करें।",
    otp: "मोबाइल ओटीपी",
    emailPassword: "ईमेल और पासवर्ड",
    registered: "पंजीकृत मोबाइल नंबर",
    send: "मुफ्त ओटीपी भेजें",
    verify: "सत्यापित करें और प्रवेश करें",
    code: "सत्यापन कोड दर्ज करें",
    edit: "नंबर बदलें",
    resend: "ओटीपी फिर भेजें",
    noOtp: "ओटीपी नहीं मिला?",
    forgot: "भूल गए?",
    remember: "मुझे याद रखें",
    noAccount: "नया खाता बनाना है?",
    registerFree: "मुफ्त पंजीकरण करें",
    instant: "तत्काल ऑनलाइन सत्यापन",
    noCenter: "किसी केंद्र जाने की जरूरत नहीं",
    footer: "चक्रीय अर्थव्यवस्था के लिए डिजिटल समावेशन",
    footerNote: "अनौपचारिक कचरा श्रमिकों के सम्मान के साथ निर्मित",
    rateCard: "दर सूची",
    rights: "श्रमिक अधिकार",
    privacy: "गोपनीयता नीति",
    termsError: "जारी रखने के लिए उचित व्यापार दिशानिर्देशों से सहमत हों।",
    cityError: "कृपया अपना शहर या इलाका दर्ज करें।",
    mismatch: "दोनों पासवर्ड समान होने चाहिए।",
    changed: "भाषा बदल गई",
    voice: "बोलकर बताएं",
    stop: "ऑडियो रोकें",
    voiceText:
      "कबाड़ीवाला कनेक्ट में आपका स्वागत है। आप सीधे हमारी वेबसाइट पर पंजीकरण कर सकते हैं। कृपया अपना नाम, मोबाइल नंबर और पासवर्ड दर्ज करें।",
    rateNote:
      "संकेतात्मक राष्ट्रीय दरें; स्थानीय दरें ग्रेड और स्थान पर निर्भर करती हैं।",
    vehicle: ["हाथगाड़ी", "पैदल", "ऑटो / टेम्पो", "स्थायी दुकान"],
  },
  मराठी: {
    ticker: "कार्यपुस्तिकेतील खरेदी दर:",
    badge: "कचरा वेचक व कबाडी बांधवांचे थेट व्यासपीठ",
    hero: "कष्ट तुमचे,",
    highlight: "योग्य भाव",
    end: "आणि सन्मान!",
    intro:
      "कोणत्याही केंद्रात जाण्याची गरज नाही! थेट मोबाईलवरून स्वतःची नोंदणी करा, पारदर्शक डिजिटल वजन आणि लगेच खात्यात पैसे मिळवा.",
    feat: ["अचूक डिजिटल वजन", "तातडीने पेमेंट", "डिजिटल ओळखपत्र"],
    featDesc: [
      "मोबाईलवर प्रमाणित डिजिटल वजन, फसवणूक शून्य.",
      "कबाड विकताच रोख रक्कम किंवा थेट UPI ने खात्यात जमा.",
      "नोंदणी होताच तात्काळ अधिकृत डिजिटल ओळखपत्र उपलब्ध.",
    ],
    benefit: "१००% ऑनलाइन मोफत नोंदणी",
    benefitDesc: "येथे थेट माहिती भरा आणि सुरक्षितपणे खाते तयार करा.",
    official: "अधिकृत पोर्टल",
    activation: "सुरक्षित ऑनलाइन प्रवेश",
    register: "थेट नवीन नोंदणी",
    login: "लॉगिन करा",
    regHeading: "थेट ऑनलाइन नोंदणी फॉर्म",
    regDesc:
      "खाली तुमची संपूर्ण माहिती भरा. कोणत्याही केंद्राला भेट देण्याची गरज नाही.",
    role: "तुमची भूमिका निवडा",
    collector: "कबाडी साथी",
    dealer: "भंगार दुकान",
    recycler: "रिसायकलर",
    name: "पूर्ण नाव",
    mobile: "मोबाईल क्रमांक",
    email: "ईमेल पत्ता",
    emailNote: "खात्यासाठी आवश्यक",
    city: "शहर आणि वॉर्ड / विभाग",
    mode: "कचरा गोळा करण्याचे साधन",
    password: "पासवर्ड तयार करा",
    confirm: "पासवर्डची खात्री करा",
    terms: "मी योग्य दर धोरणाशी सहमत आहे आणि दिलेली माहिती खरी आहे.",
    create: "खाते तयार करा",
    already: "आधीच नोंदणी केली आहे का?",
    loginHere: "थेट लॉगिन करा",
    loginHeading: "आपल्या खात्यात प्रवेश करा",
    loginDesc: "आपल्या मोबाईल ओटीपी किंवा पासवर्डने थेट लॉगिन करा.",
    otp: "मोबाईल ओटीपी",
    emailPassword: "ईमेल आणि पासवर्ड",
    registered: "नोंदणीकृत मोबाईल क्रमांक",
    send: "ओटीपी पाठवा",
    verify: "सत्यापित करा आणि प्रवेश करा",
    code: "सत्यापन कोड टाका",
    edit: "क्रमांक बदला",
    resend: "ओटीपी पुन्हा पाठवा",
    noOtp: "ओटीपी मिळाला नाही?",
    forgot: "विसरलात?",
    remember: "मला लक्षात ठेवा",
    noAccount: "नवीन खाते तयार करायचे आहे?",
    registerFree: "मोफत नोंदणी करा",
    instant: "तात्काळ ऑनलाइन पडताळणी",
    noCenter: "कोणत्याही केंद्राची गरज नाही",
    footer: "परिपत्रक अर्थव्यवस्थेसाठी डिजिटल समावेशन",
    footerNote: "अनौपचारिक कचरा कामगारांच्या सन्मानासाठी",
    rateCard: "दर सूची",
    rights: "कामगार हक्क",
    privacy: "गोपनीयता धोरण",
    termsError: "पुढे जाण्यासाठी योग्य व्यापार नियमांना सहमती द्या。",
    cityError: "कृपया तुमचे शहर किंवा विभाग टाका.",
    mismatch: "दोन्ही पासवर्ड सारखे असणे आवश्यक आहे.",
    changed: "भाषा बदलली",
    voice: "बोलून सांगा",
    stop: "ऑडिओ थांबवा",
    voiceText:
      "कबाडीवाला कनेक्ट मध्ये आपले स्वागत आहे. आपण कोणत्याही केंद्रात न जाता थेट या वेबसाईटवर नोंदणी करू शकता. कृपया आपले नाव, मोबाईल क्रमांक आणि पासवर्ड टाका.",
    rateNote: "सूचक राष्ट्रीय दर; स्थानिक दर ग्रेड आणि ठिकाणानुसार बदलू शकतात.",
    vehicle: ["हातगाडी", "पायी", "ऑटो / टेम्पो", "कायमस्वरूपी दुकान"],
  },
} as const;

const vehicles = ["handcart", "foot", "tempo", "shop"] as const;

function errorKey(message: string) {
  if (/already exists/i.test(message) && /mobile/i.test(message))
    return "mobileAccountExists" as const;
  if (/already exists/i.test(message) && /email/i.test(message))
    return "accountExists" as const;
  if (/invalid email or password/i.test(message))
    return "invalidCredentials" as const;
  if (/invalid or expired otp/i.test(message))
    return "otpInvalidOrExpired" as const;
  if (/valid mobile number/i.test(message)) return "invalidMobile" as const;
  if (/unable to send otp/i.test(message)) return "unableToSendOtp" as const;
  if (/unable to verify otp/i.test(message))
    return "unableToVerifyOtp" as const;
  if (/too many/i.test(message)) return "rateLimited" as const;
  if (
    /no account is registered/i.test(message) ||
    /unable to sign in with this mobile/i.test(message)
  )
    return "noMobileAccount" as const;
  if (/unable to create/i.test(message) || /already in use/i.test(message))
    return "accountCreateError" as const;
  if (/password must be/i.test(message)) return "passwordWeak" as const;
  if (/full name/i.test(message)) return "fullNameRequired" as const;
  return null;
}

export default function LoginPage({
  onOpenWorkspace,
  onOpenStaffDemo,
  onLanguageChange,
}: {
  onOpenWorkspace: (role: Role, name?: string, isDemo?: boolean) => void;
  onOpenStaffDemo: () => void;
  onLanguageChange: (language: Language) => void;
}) {
  const { language: appLanguage, t } = useI18n();
  const locale: Locale = useMemo(
    () =>
      appLanguage === "मराठी" || appLanguage === "हिंदी" ? appLanguage : "EN",
    [appLanguage]
  );
  const copy = words[locale];
  const [authView, setAuthView] = useState<AuthView>("register");
  const [loginMethod, setLoginMethod] = useState<AuthMethod>("otp");
  const [signupMethod, setSignupMethod] = useState<AuthMethod>("password");
  const [role, setRole] = useState<RegistrationRole>("collector");
  const [loginCountryCode, setLoginCountryCode] = useState("+91");
  const [loginPhone, setLoginPhone] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCity, setSignupCity] = useState("");
  const [vehicle, setVehicle] = useState("handcart");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [remember, setRemember] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [signupOtpSent, setSignupOtpSent] = useState(false);
  const [loginCooldown, setLoginCooldown] = useState(0);
  const [signupCooldown, setSignupCooldown] = useState(0);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null
  );
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const timer = useRef<number | null>(null);
  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  const signupMutation = trpc.auth.signup.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const sendOtpMutation = trpc.auth.sendOtp.useMutation();
  const verifyOtpMutation = trpc.auth.verifyOtp.useMutation();
  const tickerRates = nationalPriceBenchmarks.filter(({ grade }) =>
    /Heavy Melting Scrap|Copper Scrap|Corrugated Boxes|PET Bottles/i.test(grade)
  );

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  const showToast = (title: string, message: string) => {
    if (timer.current !== null) window.clearTimeout(timer.current);
    setToast({ title, message });
    timer.current = window.setTimeout(() => setToast(null), 4200);
  };
  const displayError = (cause: unknown, fallback: TranslationKey) => {
    const key = cause instanceof Error ? errorKey(cause.message) : null;
    setError(key ? t(key) : t(fallback));
  };
  const chooseLanguage = (value: Locale) => {
    window.localStorage.setItem("app_language", value);
    onLanguageChange(value);
    setError("");
    showToast(copy.changed, `Language switched to ${value}.`);
  };
  const beginCooldown = (mode: "login" | "signup") => {
    const update = mode === "login" ? setLoginCooldown : setSignupCooldown;
    let remaining = 30;
    update(remaining);
    const interval = window.setInterval(() => {
      remaining -= 1;
      update(remaining);
      if (remaining === 0) window.clearInterval(interval);
    }, 1000);
  };
  const validateRegistration = () => {
    if (!signupName.trim()) return (setError(t("fullNameRequired")), false);
    if (!/^\d{10}$/.test(signupPhone))
      return (setError(t("invalidMobile")), false);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail.trim()))
      return (setError(t("invalidEmail")), false);
    if (!signupCity.trim()) return (setError(copy.cityError), false);
    if (signupPassword.length < 8) return (setError(t("passwordWeak")), false);
    if (signupPassword !== confirmPassword)
      return (setError(copy.mismatch), false);
    if (!termsAccepted) return (setError(copy.termsError), false);
    return true;
  };
  const registerWithPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!validateRegistration()) return;
    try {
      const result = await signupMutation.mutateAsync({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: `+91${signupPhone}`,
        password: signupPassword,
        confirmPassword,
        remember: false,
        preferredLanguage: locale,
      });
      onLanguageChange((result.user.preferredLanguage as Language) || locale);
      onOpenWorkspace("collector", result.user.name ?? signupName.trim());
    } catch (cause) {
      displayError(cause, "signupFieldsRequired");
    }
  };
  const requestOtp = async (mode: "login" | "signup") => {
    setError("");
    if (mode === "signup" && !validateRegistration()) return;
    const raw = mode === "login" ? loginPhone : signupPhone;
    const code = mode === "login" ? loginCountryCode : "+91";
    const phone = `${code}${raw.replace(/\D/g, "")}`;
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return setError(t("invalidMobile"));
    if ((mode === "login" ? loginCooldown : signupCooldown) > 0) return;
    try {
      await sendOtpMutation.mutateAsync({ phone, mode, language: locale });
      setOtpDigits(["", "", "", ""]);
      if (mode === "login") setOtpSent(true);
      else setSignupOtpSent(true);
      beginCooldown(mode);
      window.setTimeout(
        () => inputs.current[mode === "login" ? 0 : 4]?.focus(),
        100
      );
    } catch (cause) {
      displayError(cause, "unableToSendOtp");
    }
  };
  const verifyOtp = async (
    event: FormEvent<HTMLFormElement>,
    mode: "login" | "signup"
  ) => {
    event.preventDefault();
    setError("");
    if (mode === "signup" && !validateRegistration()) return;
    const code = otpDigits.join("");
    if (!/^\d{4}$/.test(code)) return setError(t("otpInvalidOrExpired"));
    const raw = mode === "login" ? loginPhone : signupPhone;
    const phone = `${mode === "login" ? loginCountryCode : "+91"}${raw.replace(/\D/g, "")}`;
    try {
      const result = await verifyOtpMutation.mutateAsync({
        phone,
        code,
        mode,
        name: mode === "signup" ? signupName.trim() : undefined,
        email: mode === "signup" ? signupEmail.trim() : undefined,
        password: mode === "signup" ? signupPassword : undefined,
        confirmPassword: mode === "signup" ? confirmPassword : undefined,
        remember,
        preferredLanguage: locale,
      });
      onLanguageChange((result.user.preferredLanguage as Language) || locale);
      onOpenWorkspace(
        "collector",
        result.user.name ?? (mode === "signup" ? signupName.trim() : undefined)
      );
    } catch (cause) {
      displayError(cause, "otpInvalidOrExpired");
    }
  };
  const passwordLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError(t("invalidEmail"));
    const demo = demoLogins[email.toLowerCase() as keyof typeof demoLogins];
    if (demo?.password === password) {
      onLanguageChange(locale);
      onOpenWorkspace(demo.role, undefined, true);
      return;
    }
    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
        remember,
        preferredLanguage: locale,
      });
      onLanguageChange((result.user.preferredLanguage as Language) || locale);
      onOpenWorkspace("collector", result.user.name ?? undefined);
    } catch (cause) {
      displayError(cause, "invalidCredentials");
    }
  };
  const authTab = (next: AuthView) => {
    setAuthView(next);
    setError("");
    setOtpSent(false);
    setSignupOtpSent(false);
    setOtpDigits(["", "", "", ""]);
    if (next === "login") setLoginMethod("otp");
  };
  const changeDigit = (index: number, value: string, offset: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtpDigits(current =>
      current.map((item, i) => (i === index ? digit : item))
    );
    if (digit && index < 3) inputs.current[offset + index + 1]?.focus();
  };
  const voiceHelp = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceError("Audio assistance is not available in this browser.");
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(copy.voiceText);
    utterance.lang =
      locale === "हिंदी" ? "hi-IN" : locale === "मराठी" ? "mr-IN" : "en-IN";
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setVoiceError("Audio assistance could not be played.");
    };
    setVoiceError("");
    window.speechSynthesis.speak(utterance);
  };

  const rateList = tickerRates.map(item => ({
    name: item.grade.split(" (")[0],
    rate: `₹${formatRate(item.min)}–₹${formatRate(item.max)}/kg`,
  }));
  const otpFields = (offset: number) => (
    <div className="portal-otp-boxes">
      {otpDigits.map((digit, index) => (
        <input
          key={index}
          ref={node => {
            inputs.current[offset + index] = node;
          }}
          aria-label={`OTP digit ${index + 1}`}
          value={digit}
          onChange={event => changeDigit(index, event.target.value, offset)}
          onKeyDown={event => {
            if (event.key === "Backspace" && !digit && index > 0)
              inputs.current[offset + index - 1]?.focus();
          }}
          inputMode="numeric"
          maxLength={1}
        />
      ))}
    </div>
  );

  return (
    <div className="portal-page">
      <header className="portal-header">
        <div className="portal-header-inner">
          <a className="portal-brand" href="/" aria-label="Kabadiwala Connect">
            <span className="portal-brand-icon">
              <Leaf size={25} aria-hidden="true" />
            </span>
            <span className="portal-brand-copy">
              <span className="portal-brand-name">
                Kabadiwala<span>Connect</span>
              </span>
              <span className="portal-brand-motto">
                Empowering Grassroots Recyclers &amp; Informal Collectors
              </span>
            </span>
            <span className="portal-verified">Verified</span>
          </a>
          <div className="portal-header-actions">
            <label className="portal-language">
              <Globe2 size={16} aria-hidden="true" />
              <span className="sr-only">Choose language</span>
              <select
                value={locale}
                onChange={event => chooseLanguage(event.target.value as Locale)}
                aria-label="Choose language"
              >
                <option value="EN">English</option>
                <option value="हिंदी">हिंदी (Hindi)</option>
                <option value="मराठी">मराठी (Marathi)</option>
              </select>
            </label>
            <a className="portal-helpline" href="tel:18002081122">
              <Headphones size={16} aria-hidden="true" />
              <span>Sahayata:</span>
              <strong>1800-208-1122</strong>
            </a>
            <button type="button" className="portal-voice" onClick={voiceHelp}>
              <Volume2 size={16} aria-hidden="true" />
              <span>{speaking ? copy.stop : copy.voice}</span>
            </button>
            <button
              type="button"
              className="portal-staff-demo"
              onClick={onOpenStaffDemo}
            >
              Staff Demo
            </button>
          </div>
        </div>
        <div className="portal-ratebar">
          <div className="portal-ratebar-inner">
            <span className="portal-rate-title">
              <span className="portal-rate-pulse" />
              {copy.ticker}
            </span>
            <div className="portal-rate-list">
              {rateList.map(item => (
                <span className="portal-rate-item" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.rate}</strong>
                </span>
              ))}
              <span className="portal-rate-registration">
                100% Online Free Registration
              </span>
            </div>
          </div>
          <p className="portal-rate-note">{copy.rateNote}</p>
        </div>
      </header>

      <main className="portal-main">
        <div className="portal-content">
          <section
            className="portal-promo"
            aria-labelledby="portal-hero-heading"
          >
            <div className="portal-trust-badge">
              <span />
              {copy.badge}
              <b>• 100% Online Portal</b>
            </div>
            <div className="portal-hero-copy">
              <h1 id="portal-hero-heading">
                {copy.hero}
                <br />
                <span>{copy.highlight}</span> {copy.end}
              </h1>
              <p>{copy.intro}</p>
            </div>
            <div className="portal-feature-grid">
              {copy.feat.map((title, index) => (
                <article className="portal-feature-card" key={title}>
                  <span
                    className={`portal-feature-icon ${["portal-feature-weight", "portal-feature-payment", "portal-feature-card-id"][index]}`}
                  >
                    {["⚖️", "⚡", "🪪"][index]}
                  </span>
                  <h2>{title}</h2>
                  <p>{copy.featDesc[index]}</p>
                </article>
              ))}
            </div>
            <div className="portal-benefit">
              <span>
                <Check size={23} aria-hidden="true" />
              </span>
              <div>
                <strong>{copy.benefit}</strong>
                <p>{copy.benefitDesc}</p>
              </div>
            </div>
          </section>

          <section
            className="portal-auth-column"
            aria-label="Registration and login"
          >
            <div className="portal-auth-card">
              <div className="portal-auth-card-header">
                <div className="portal-auth-status">
                  <span className="portal-official-badge">{copy.official}</span>
                  <span className="portal-activation">
                    <i />
                    {copy.activation}
                  </span>
                </div>
                <div
                  className="portal-auth-switch"
                  role="tablist"
                  aria-label="Account access"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authView === "register"}
                    className={
                      authView === "register"
                        ? "selected register-selected"
                        : ""
                    }
                    onClick={() => authTab("register")}
                  >
                    <span>📝</span>
                    {copy.register}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={authView === "login"}
                    className={
                      authView === "login" ? "selected login-selected" : ""
                    }
                    onClick={() => authTab("login")}
                  >
                    <span>🔐</span>
                    {copy.login}
                  </button>
                </div>
              </div>

              {authView === "register" ? (
                <div className="portal-form-content">
                  <div className="portal-form-heading">
                    <h2>{copy.regHeading}</h2>
                    <p>{copy.regDesc}</p>
                  </div>
                  <div className="portal-role-select">
                    <span className="portal-field-label">{copy.role}</span>
                    <div className="portal-role-options">
                      {(["collector", "dealer", "recycler"] as const).map(
                        (value, index) => (
                          <label
                            className={`portal-role-option ${role === value ? "selected" : ""}`}
                            key={value}
                          >
                            <input
                              type="radio"
                              name="regRole"
                              value={value}
                              checked={role === value}
                              onChange={() => setRole(value)}
                            />
                            <span>{["🛒", "🏬", "🏭"][index]}</span>
                            <strong>{copy[value]}</strong>
                          </label>
                        )
                      )}
                    </div>
                  </div>
                  <form
                    className="portal-registration-form"
                    onSubmit={event =>
                      signupMethod === "password"
                        ? void registerWithPassword(event)
                        : otpSent
                          ? void verifyOtp(event, "signup")
                          : (event.preventDefault(), void requestOtp("signup"))
                    }
                    noValidate
                  >
                    <div className="portal-field">
                      <label htmlFor="signup-name">{copy.name} *</label>
                      <div className="portal-input-wrap">
                        <UserRound size={18} aria-hidden="true" />
                        <input
                          id="signup-name"
                          value={signupName}
                          onChange={event => setSignupName(event.target.value)}
                          placeholder="e.g. Ramesh Shankar Patil / रमेश पाटील"
                          autoComplete="name"
                        />
                      </div>
                    </div>
                    <div className="portal-field">
                      <label htmlFor="signup-mobile">{copy.mobile} *</label>
                      <div className="portal-mobile-wrap">
                        <span className="portal-india-code">🇮🇳 &nbsp;+91</span>
                        <input
                          id="signup-mobile"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={signupPhone}
                          onChange={event =>
                            setSignupPhone(
                              event.target.value.replace(/\D/g, "")
                            )
                          }
                          placeholder="9876543210"
                          autoComplete="tel-national"
                        />
                      </div>
                    </div>
                    <div className="portal-field">
                      <div className="portal-label-row">
                        <label htmlFor="signup-email">{copy.email} *</label>
                        <span>{copy.emailNote}</span>
                      </div>
                      <div className="portal-input-wrap">
                        <Mail size={18} aria-hidden="true" />
                        <input
                          id="signup-email"
                          type="email"
                          value={signupEmail}
                          onChange={event => setSignupEmail(event.target.value)}
                          placeholder="name@example.com"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    <div className="portal-profile-grid">
                      <div className="portal-field">
                        <label htmlFor="signup-city">{copy.city} *</label>
                        <input
                          className="portal-simple-input"
                          id="signup-city"
                          value={signupCity}
                          onChange={event => setSignupCity(event.target.value)}
                          placeholder="उदा. Pune, Ward 14"
                          autoComplete="address-level2"
                        />
                      </div>
                      <div className="portal-field">
                        <label htmlFor="signup-vehicle">{copy.mode}</label>
                        <select
                          className="portal-simple-input"
                          id="signup-vehicle"
                          value={vehicle}
                          onChange={event => setVehicle(event.target.value)}
                        >
                          {vehicles.map((value, i) => (
                            <option value={value} key={value}>
                              {copy.vehicle[i]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="portal-field">
                      <label htmlFor="signup-password">{copy.password} *</label>
                      <div className="portal-input-wrap">
                        <LockKeyhole size={18} aria-hidden="true" />
                        <input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          value={signupPassword}
                          onChange={event =>
                            setSignupPassword(event.target.value)
                          }
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        <button
                          className="portal-password-toggle"
                          type="button"
                          aria-label={
                            showSignupPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() => setShowSignupPassword(value => !value)}
                        >
                          {showSignupPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="portal-field">
                      <label htmlFor="signup-confirm-password">
                        {copy.confirm} *
                      </label>
                      <div className="portal-input-wrap">
                        <LockKeyhole size={18} aria-hidden="true" />
                        <input
                          id="signup-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={event =>
                            setConfirmPassword(event.target.value)
                          }
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        <button
                          className="portal-password-toggle"
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowConfirmPassword(value => !value)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={17} />
                          ) : (
                            <Eye size={17} />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="portal-signup-method">
                      <span>Registration method</span>
                      <div>
                        <button
                          type="button"
                          className={
                            signupMethod === "password" ? "selected" : ""
                          }
                          onClick={() => {
                            setSignupMethod("password");
                            setError("");
                            setOtpSent(false);
                          }}
                        >
                          Password
                        </button>
                        <button
                          type="button"
                          className={signupMethod === "otp" ? "selected" : ""}
                          onClick={() => {
                            setSignupMethod("otp");
                            setError("");
                          }}
                        >
                          Mobile OTP
                        </button>
                      </div>
                    </div>
                    {signupMethod === "otp" && otpSent && (
                      <div className="portal-otp-step">
                        <div className="portal-otp-heading">
                          <label>{copy.code}</label>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpDigits(["", "", "", ""]);
                            }}
                          >
                            {copy.edit}
                          </button>
                        </div>
                        {otpFields(4)}
                        <div className="portal-otp-resend">
                          <span>{copy.noOtp}</span>
                          <button
                            type="button"
                            disabled={signupCooldown > 0}
                            onClick={() => void requestOtp("signup")}
                          >
                            {signupCooldown
                              ? `${copy.resend} (${signupCooldown}s)`
                              : copy.resend}
                          </button>
                        </div>
                      </div>
                    )}
                    <label className="portal-terms">
                      <input
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={event =>
                          setTermsAccepted(event.target.checked)
                        }
                      />
                      <span>{copy.terms}</span>
                    </label>
                    {error && (
                      <p className="portal-form-error" role="alert">
                        {error}
                      </p>
                    )}
                    <button
                      className="portal-submit portal-submit-register"
                      type="submit"
                      disabled={
                        signupMutation.isPending ||
                        sendOtpMutation.isPending ||
                        verifyOtpMutation.isPending
                      }
                    >
                      {signupMethod === "otp" && !otpSent
                        ? sendOtpMutation.isPending
                          ? t("loadingSendOtp")
                          : copy.send
                        : signupMethod === "otp"
                          ? verifyOtpMutation.isPending
                            ? t("loadingVerifyOtp")
                            : copy.verify
                          : signupMutation.isPending
                            ? t("loadingCreate")
                            : copy.create}
                      <ArrowRight size={19} aria-hidden="true" />
                    </button>
                  </form>
                  <div className="portal-auth-helper">
                    <span>{copy.already}</span>
                    <button type="button" onClick={() => authTab("login")}>
                      {copy.loginHere}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="portal-form-content">
                  <div className="portal-form-heading">
                    <h2>{copy.loginHeading}</h2>
                    <p>{copy.loginDesc}</p>
                  </div>
                  <div
                    className="portal-login-method"
                    role="tablist"
                    aria-label="Login method"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={loginMethod === "otp"}
                      className={loginMethod === "otp" ? "selected" : ""}
                      onClick={() => {
                        setLoginMethod("otp");
                        setError("");
                      }}
                    >
                      <span>📱</span>
                      {copy.otp}
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={loginMethod === "password"}
                      className={loginMethod === "password" ? "selected" : ""}
                      onClick={() => {
                        setLoginMethod("password");
                        setError("");
                      }}
                    >
                      <span>🔑</span>
                      {copy.emailPassword}
                    </button>
                  </div>
                  {loginMethod === "otp" ? (
                    <form
                      className="portal-login-form"
                      onSubmit={event =>
                        otpSent
                          ? void verifyOtp(event, "login")
                          : (event.preventDefault(), void requestOtp("login"))
                      }
                      noValidate
                    >
                      <div className="portal-field">
                        <label htmlFor="login-mobile">{copy.registered}</label>
                        {!otpSent ? (
                          <div className="portal-mobile-wrap portal-login-mobile">
                            <span className="portal-india-code">🇮🇳</span>
                            <select
                              className="portal-country-select"
                              aria-label="Country calling code"
                              value={loginCountryCode}
                              onChange={event =>
                                setLoginCountryCode(event.target.value)
                              }
                            >
                              <option value="+91">+91</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                              <option value="+971">+971</option>
                            </select>
                            <input
                              id="login-mobile"
                              type="tel"
                              inputMode="numeric"
                              maxLength={15}
                              value={loginPhone}
                              onChange={event =>
                                setLoginPhone(
                                  event.target.value.replace(/\D/g, "")
                                )
                              }
                              placeholder="9876543210"
                              autoComplete="tel-national"
                            />
                          </div>
                        ) : (
                          <p className="portal-otp-sent">
                            Code sent to{" "}
                            <strong>
                              {loginCountryCode} {loginPhone}
                            </strong>
                          </p>
                        )}
                      </div>
                      {otpSent && (
                        <div className="portal-otp-step">
                          <div className="portal-otp-heading">
                            <label>{copy.code}</label>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpDigits(["", "", "", ""]);
                                setError("");
                              }}
                            >
                              {copy.edit}
                            </button>
                          </div>
                          {otpFields(0)}
                          <div className="portal-otp-resend">
                            <span>{copy.noOtp}</span>
                            <button
                              type="button"
                              disabled={loginCooldown > 0}
                              onClick={() => void requestOtp("login")}
                            >
                              {loginCooldown
                                ? `${copy.resend} (${loginCooldown}s)`
                                : copy.resend}
                            </button>
                          </div>
                        </div>
                      )}
                      {error && (
                        <p className="portal-form-error" role="alert">
                          {error}
                        </p>
                      )}
                      <button
                        className="portal-submit portal-submit-login"
                        type="submit"
                        disabled={
                          sendOtpMutation.isPending ||
                          verifyOtpMutation.isPending
                        }
                      >
                        {otpSent
                          ? verifyOtpMutation.isPending
                            ? t("loadingVerifyOtp")
                            : copy.verify
                          : sendOtpMutation.isPending
                            ? t("loadingSendOtp")
                            : copy.send}
                        <ArrowRight size={19} aria-hidden="true" />
                      </button>
                    </form>
                  ) : (
                    <form
                      className="portal-login-form"
                      onSubmit={passwordLogin}
                      noValidate
                    >
                      <div className="portal-field">
                        <label htmlFor="login-email">
                          Email / Mobile Number
                        </label>
                        <div className="portal-input-wrap">
                          <Mail size={18} aria-hidden="true" />
                          <input
                            id="login-email"
                            name="email"
                            type="text"
                            placeholder="name@example.com"
                            autoComplete="username"
                          />
                        </div>
                      </div>
                      <div className="portal-field">
                        <div className="portal-label-row">
                          <label htmlFor="login-password">Password</label>
                          <button
                            className="portal-forgot"
                            type="button"
                            onClick={() =>
                              showToast(
                                "Password Reset",
                                "Please contact support to reset your password."
                              )
                            }
                          >
                            {copy.forgot}
                          </button>
                        </div>
                        <div className="portal-input-wrap">
                          <LockKeyhole size={18} aria-hidden="true" />
                          <input
                            id="login-password"
                            name="password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="current-password"
                          />
                          <button
                            className="portal-password-toggle"
                            type="button"
                            aria-label={
                              showLoginPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            onClick={() =>
                              setShowLoginPassword(value => !value)
                            }
                          >
                            {showLoginPassword ? (
                              <EyeOff size={17} />
                            ) : (
                              <Eye size={17} />
                            )}
                          </button>
                        </div>
                      </div>
                      <label className="portal-remember">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={event => setRemember(event.target.checked)}
                        />
                        <span>{copy.remember}</span>
                      </label>
                      {error && (
                        <p className="portal-form-error" role="alert">
                          {error}
                        </p>
                      )}
                      <button
                        className="portal-submit portal-submit-login"
                        type="submit"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending
                          ? t("loadingSignIn")
                          : copy.login}
                        <ArrowRight size={19} aria-hidden="true" />
                      </button>
                    </form>
                  )}
                  <div className="portal-auth-helper">
                    <span>{copy.noAccount}</span>
                    <button type="button" onClick={() => authTab("register")}>
                      {copy.registerFree}
                    </button>
                  </div>
                </div>
              )}
              <div className="portal-security-banner">
                <span>
                  <ShieldCheck size={17} aria-hidden="true" />
                  {copy.instant}
                </span>
                <strong>{copy.noCenter} ✓</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
      {voiceError && (
        <p className="portal-live-error" role="status">
          {voiceError}
        </p>
      )}
      {toast && (
        <div className="portal-toast" role="status">
          <span className="portal-toast-icon">🔔</span>
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      )}
      <footer className="portal-footer">
        <div className="portal-footer-inner">
          <div>
            <strong>Kabadiwala Connect</strong>
            <span>•</span>
            <span>{copy.footer}</span>
          </div>
          <nav aria-label="Information links">
            <a href="#rate-card">{copy.rateCard}</a>
            <a href="#worker-rights">{copy.rights}</a>
            <a href="#privacy">{copy.privacy}</a>
          </nav>
          <p>{copy.footerNote}</p>
        </div>
      </footer>
    </div>
  );
}
