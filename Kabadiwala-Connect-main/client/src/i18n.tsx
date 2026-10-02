import { createContext, useContext, type ReactNode } from "react";

export type Language = "EN" | "हिंदी" | "मराठी";

export type TranslationKey =
  | "collector"
  | "recycler"
  | "workspace"
  | "fieldData"
  | "recoveryZones"
  | "yourImpact"
  | "ewasteDiverted"
  | "monthlyGoal"
  | "online"
  | "offlineMode"
  | "syncing"
  | "reconnect"
  | "voiceGuide"
  | "offlineReady"
  | "verifiedRoute"
  | "fairPriceRange"
  | "safetyFirst"
  | "keepHandsSafe"
  | "listen"
  | "viewSafeHandling"
  | "readyToWorkOffline"
  | "tryItNow"
  | "backToOverview"
  | "draftSavedLocally"
  | "newMaterialLot"
  | "createLot"
  | "captureOnce"
  | "stepCapture"
  | "stepCategorize"
  | "stepEstimate"
  | "capture"
  | "categorize"
  | "estimate"
  | "whatCollectedToday"
  | "required"
  | "takePhotoUpload"
  | "replacePhoto"
  | "openCamera"
  | "demoPhotoReady"
  | "goodLight"
  | "aiAssist"
  | "whyAskPhoto"
  | "photoHelps"
  | "aiSuggestionReady"
  | "uploadedEwasteLot"
  | "takesLessThanMinute"
  | "chooseClosestMatch"
  | "estimateIndicative"
  | "continue"
  | "saveLot"
  | "reportZone"
  | "allSources"
  | "manual"
  | "municipal"
  | "satellite"
  | "allStatuses"
  | "active"
  | "verified"
  | "unverified"
  | "cleared"
  | "filters"
  | "all"
  | "legend"
  | "score"
  | "chooseLanguage"
  | "chooseLogin"
  | "emailTab"
  | "mobileTab"
  | "email"
  | "mobileNumber"
  | "countryCode"
  | "password"
  | "confirmPassword"
  | "name"
  | "otp"
  | "sendOtp"
  | "verifyOtp"
  | "resendOtp"
  | "rememberMe"
  | "forgotPassword"
  | "signIn"
  | "createAccount"
  | "login"
  | "signUp"
  | "logout"
  | "or"
  | "otpInstructions"
  | "otpSentTo"
  | "changeNumber"
  | "loadingSignIn"
  | "loadingCreate"
  | "loadingSendOtp"
  | "loadingVerifyOtp"
  | "emailRequired"
  | "passwordRequired"
  | "signupFieldsRequired"
  | "invalidEmail"
  | "invalidMobile"
  | "passwordMismatch"
  | "passwordWeak"
  | "invalidCredentials"
  | "otpInvalidOrExpired"
  | "accountExists"
  | "mobileAccountExists"
  | "accountCreated"
  | "loginSuccessful"
  | "unableToSendOtp"
  | "noMobileAccount"
  | "forgotPasswordPlaceholder"
  | "fullNameRequired"
  | "noAccount"
  | "haveAccount"
  | "showPassword"
  | "hidePassword"
  | "unableToVerifyOtp"
  | "rateLimited"
  | "accountCreateError"
  | "verificationRequired"
  | "verifyYourEmail"
  | "verifyYourPhone"
  | "emailNotVerified"
  | "phoneNotVerified"
  | "verificationCodeSent"
  | "enterEmailCode"
  | "enterPhoneCode"
  | "verifyEmail"
  | "verifyPhone"
  | "resendCode"
  | "emailVerified"
  | "phoneVerified"
  | "skipForNow"
  | "verificationComplete"
  | "sendingCode"
  | "verifyingCode"
  | "genericAuthError";

const translations: Record<Language, Record<TranslationKey, string>> = {
  EN: {
    collector: "Collector",
    recycler: "Recycler",
    workspace: "workspace",
    fieldData: "Field data",
    recoveryZones: "Dumping areas",
    yourImpact: "YOUR IMPACT",
    ewasteDiverted: "e-waste diverted this month",
    monthlyGoal: "of monthly goal",
    online: "Online",
    offlineMode: "Offline mode",
    syncing: "Syncing…",
    reconnect: "Reconnect",
    voiceGuide: "Voice guide",
    offlineReady: "Offline ready",
    verifiedRoute: "Verified route",
    fairPriceRange: "Fair price range",
    safetyFirst: "SAFETY FIRST",
    keepHandsSafe: "Keep your hands safe",
    listen: "Listen",
    viewSafeHandling: "View safe handling",
    readyToWorkOffline: "Ready to work offline",
    tryItNow: "Try it now",
    backToOverview: "← Back to overview",
    draftSavedLocally: "Draft saved locally",
    newMaterialLot: "NEW MATERIAL LOT",
    createLot: "Create a lot",
    captureOnce: "Capture once. Get a fairer route.",
    stepCapture: "STEP 01 / CAPTURE",
    stepCategorize: "STEP 02 / CATEGORIZE",
    stepEstimate: "STEP 03 / ESTIMATE",
    capture: "Capture",
    categorize: "Categorize",
    estimate: "Estimate",
    whatCollectedToday: "What did you collect today?",
    required: "Required",
    takePhotoUpload: "Take a photo or upload",
    replacePhoto: "Replace photo",
    openCamera: "Open camera",
    demoPhotoReady: "Demo photo ready",
    goodLight: "Good light helps us suggest a category",
    aiAssist: "AI assist will suggest a category. You stay in control.",
    whyAskPhoto: "Why we ask for a photo",
    photoHelps: "It helps recyclers prepare the right route and reduces price disputes at handover.",
    aiSuggestionReady: "AI suggestion ready",
    uploadedEwasteLot: "Uploaded e-waste lot",
    takesLessThanMinute: "Takes less than a minute",
    chooseClosestMatch: "Choose the closest match",
    estimateIndicative: "Your estimate is indicative",
    continue: "Continue",
    saveLot: "Save lot",
    reportZone: "Report a zone",
    allSources: "All sources",
    manual: "Manual",
    municipal: "Municipal",
    satellite: "Satellite",
    allStatuses: "All statuses",
    active: "Active",
    verified: "Verified",
    unverified: "Unverified",
    cleared: "Cleared",
    filters: "Filters",
    all: "All",
    legend: "Legend",
    score: "Score",
    chooseLanguage: "Language",
    chooseLogin: "Choose how you want to login",
    emailTab: "Email & Password",
    mobileTab: "Mobile OTP",
    email: "Email",
    mobileNumber: "Mobile Number",
    countryCode: "Country code",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Full Name",
    otp: "Enter OTP",
    sendOtp: "Send OTP",
    verifyOtp: "Verify OTP",
    resendOtp: "Resend OTP",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password",
    signIn: "Sign In",
    createAccount: "Create Account",
    login: "Login",
    signUp: "Sign Up",
    logout: "Logout",
    or: "OR",
    otpInstructions: "We will send a one-time code to your mobile number.",
    otpSentTo: "OTP sent to",
    changeNumber: "Change number",
    loadingSignIn: "Signing in…",
    loadingCreate: "Creating account…",
    loadingSendOtp: "Sending OTP…",
    loadingVerifyOtp: "Verifying OTP…",
    emailRequired: "Please enter your email.",
    passwordRequired: "Please enter your password.",
    signupFieldsRequired: "Please complete all fields.",
    invalidEmail: "Please enter a valid email address.",
    invalidMobile: "Please enter a valid mobile number with country code.",
    passwordMismatch: "Passwords do not match.",
    passwordWeak: "Password must be at least 8 characters and include a letter and a number.",
    invalidCredentials: "Invalid email or password.",
    otpInvalidOrExpired: "Invalid or expired OTP. Please try again.",
    accountExists: "An account with this email already exists.",
    mobileAccountExists: "An account with this mobile number already exists.",
    accountCreated: "Account created successfully.",
    loginSuccessful: "Login successful.",
    unableToSendOtp: "Unable to send OTP. Please try again.",
    noMobileAccount: "Unable to sign in with this mobile number.",
    forgotPasswordPlaceholder: "Password reset is not available yet. Please contact an administrator.",
    fullNameRequired: "Please enter your full name.",
    noAccount: "Don’t have an account?",
    haveAccount: "Already have an account?",
    showPassword: "Show password",
    hidePassword: "Hide password",
    unableToVerifyOtp: "Unable to verify OTP. Please try again.",
    rateLimited: "Too many attempts. Please try again later.",
    accountCreateError: "Unable to create the account. Please try again.",
    verificationRequired: "Please verify your email and mobile number.",
    verifyYourEmail: "Verify your email",
    verifyYourPhone: "Verify your mobile number",
    emailNotVerified: "Email not verified",
    phoneNotVerified: "Mobile number not verified",
    verificationCodeSent: "Verification code sent!",
    enterEmailCode: "Enter the code sent to your email",
    enterPhoneCode: "Enter the code sent to your mobile",
    verifyEmail: "Verify Email",
    verifyPhone: "Verify Mobile",
    resendCode: "Resend code",
    emailVerified: "Email verified ✓",
    phoneVerified: "Mobile verified ✓",
    skipForNow: "Skip for now",
    verificationComplete: "All verifications complete!",
    sendingCode: "Sending code…",
    verifyingCode: "Verifying…",
    genericAuthError: "Something went wrong. Please try again.",
  },
  हिंदी: {
    collector: "कलेक्टर",
    recycler: "रीसाइकलर",
    workspace: "कार्यस्थल",
    fieldData: "फील्ड डेटा",
    recoveryZones: "डंपिंग क्षेत्र",
    yourImpact: "आपका प्रभाव",
    ewasteDiverted: "इस महीने ई-कचरा हटाया गया",
    monthlyGoal: "मासिक लक्ष्य का",
    online: "ऑनलाइन",
    offlineMode: "ऑफ़लाइन मोड",
    syncing: "सिंक हो रहा है…",
    reconnect: "फिर से जुड़ें",
    voiceGuide: "वॉइस गाइड",
    offlineReady: "ऑफ़लाइन तैयार",
    verifiedRoute: "सत्यापित मार्ग",
    fairPriceRange: "उचित कीमत सीमा",
    safetyFirst: "सुरक्षा पहले",
    keepHandsSafe: "अपने हाथ सुरक्षित रखें",
    listen: "सुनें",
    viewSafeHandling: "सुरक्षित संभालना देखें",
    readyToWorkOffline: "ऑफ़लाइन काम करने के लिए तैयार",
    tryItNow: "अभी आज़माएं",
    backToOverview: "← अवलोकन पर वापस जाएं",
    draftSavedLocally: "ड्राफ्ट स्थानीय रूप से सेव है",
    newMaterialLot: "नया सामग्री लॉट",
    createLot: "लॉट बनाएं",
    captureOnce: "एक बार दर्ज करें। बेहतर मार्ग पाएं।",
    stepCapture: "चरण ०१ / दर्ज करें",
    stepCategorize: "चरण ०२ / श्रेणी चुनें",
    stepEstimate: "चरण ०३ / अनुमान",
    capture: "दर्ज करें",
    categorize: "श्रेणी चुनें",
    estimate: "अनुमान",
    whatCollectedToday: "आज आपने क्या इकट्ठा किया?",
    required: "ज़रूरी",
    takePhotoUpload: "फोटो लें या अपलोड करें",
    replacePhoto: "फोटो बदलें",
    openCamera: "कैमरा खोलें",
    demoPhotoReady: "डेमो फोटो तैयार है",
    goodLight: "अच्छी रोशनी से श्रेणी सुझाने में मदद मिलती है",
    aiAssist: "AI श्रेणी सुझाएगा। नियंत्रण आपके हाथ में रहेगा।",
    whyAskPhoto: "हम फोटो क्यों मांगते हैं",
    photoHelps: "इससे रिसाइकलर सही मार्ग तैयार कर पाते हैं और हैंडओवर के समय कीमत के विवाद कम होते हैं।",
    aiSuggestionReady: "AI सुझाव तैयार है",
    uploadedEwasteLot: "अपलोड किया गया ई-कचरा लॉट",
    takesLessThanMinute: "एक मिनट से भी कम समय लगेगा",
    chooseClosestMatch: "सबसे उपयुक्त विकल्प चुनें",
    estimateIndicative: "आपका अनुमान संकेतात्मक है",
    continue: "जारी रखें",
    saveLot: "लॉट सेव करें",
    reportZone: "ज़ोन रिपोर्ट करें",
    allSources: "सभी स्रोत",
    manual: "मैनुअल",
    municipal: "नगरपालिका",
    satellite: "सैटेलाइट",
    allStatuses: "सभी स्थिति",
    active: "सक्रिय",
    verified: "सत्यापित",
    unverified: "असत्यापित",
    cleared: "साफ़ किया गया",
    filters: "फ़िल्टर",
    all: "सभी",
    legend: "संकेत",
    score: "स्कोर",
    chooseLanguage: "भाषा",
    chooseLogin: "लॉगिन करने का तरीका चुनें",
    emailTab: "ईमेल और पासवर्ड",
    mobileTab: "मोबाइल OTP",
    email: "ईमेल",
    mobileNumber: "मोबाइल नंबर",
    countryCode: "देश कोड",
    password: "पासवर्ड",
    confirmPassword: "पासवर्ड की पुष्टि करें",
    name: "पूरा नाम",
    otp: "OTP दर्ज करें",
    sendOtp: "OTP भेजें",
    verifyOtp: "OTP सत्यापित करें",
    resendOtp: "OTP फिर भेजें",
    rememberMe: "मुझे याद रखें",
    forgotPassword: "पासवर्ड भूल गए?",
    signIn: "लॉगिन करें",
    createAccount: "खाता बनाएं",
    login: "लॉगिन",
    signUp: "साइन अप",
    logout: "लॉगआउट",
    or: "या",
    otpInstructions: "आपके मोबाइल नंबर पर एक बार इस्तेमाल होने वाला कोड भेजा जाएगा।",
    otpSentTo: "OTP भेजा गया",
    changeNumber: "नंबर बदलें",
    loadingSignIn: "लॉगिन हो रहा है…",
    loadingCreate: "खाता बनाया जा रहा है…",
    loadingSendOtp: "OTP भेजा जा रहा है…",
    loadingVerifyOtp: "OTP सत्यापित हो रहा है…",
    emailRequired: "कृपया अपना ईमेल दर्ज करें।",
    passwordRequired: "कृपया अपना पासवर्ड दर्ज करें।",
    signupFieldsRequired: "कृपया सभी फ़ील्ड भरें।",
    invalidEmail: "कृपया सही ईमेल पता दर्ज करें।",
    invalidMobile: "कृपया देश कोड के साथ सही मोबाइल नंबर दर्ज करें।",
    passwordMismatch: "दोनों पासवर्ड एक जैसे नहीं हैं।",
    passwordWeak: "पासवर्ड कम से कम 8 अक्षरों का हो और उसमें एक अक्षर और एक नंबर हो।",
    invalidCredentials: "ईमेल या पासवर्ड गलत है।",
    otpInvalidOrExpired: "OTP गलत या समाप्त हो गया है। फिर से कोशिश करें।",
    accountExists: "इस ईमेल से पहले से खाता मौजूद है।",
    mobileAccountExists: "इस मोबाइल नंबर से पहले से खाता मौजूद है।",
    accountCreated: "खाता सफलतापूर्वक बन गया।",
    loginSuccessful: "लॉगिन सफल रहा।",
    unableToSendOtp: "OTP भेज नहीं पाए। कृपया फिर कोशिश करें।",
    noMobileAccount: "इस मोबाइल नंबर से लॉगिन नहीं हो पाया।",
    forgotPasswordPlaceholder: "पासवर्ड रीसेट अभी उपलब्ध नहीं है। कृपया एडमिन से संपर्क करें।",
    fullNameRequired: "कृपया अपना पूरा नाम दर्ज करें।",
    noAccount: "खाता नहीं है?",
    haveAccount: "पहले से खाता है?",
    showPassword: "पासवर्ड दिखाएं",
    hidePassword: "पासवर्ड छिपाएं",
    unableToVerifyOtp: "OTP सत्यापित नहीं हो पाया। कृपया फिर कोशिश करें।",
    rateLimited: "बहुत बार कोशिश की गई। कृपया बाद में फिर कोशिश करें।",
    accountCreateError: "खाता नहीं बन पाया। कृपया फिर कोशिश करें।",
    verificationRequired: "कृपया अपना ईमेल और मोबाइल नंबर सत्यापित करें।",
    verifyYourEmail: "अपना ईमेल सत्यापित करें",
    verifyYourPhone: "अपना मोबाइल नंबर सत्यापित करें",
    emailNotVerified: "ईमेल सत्यापित नहीं है",
    phoneNotVerified: "मोबाइल नंबर सत्यापित नहीं है",
    verificationCodeSent: "सत्यापन कोड भेजा गया!",
    enterEmailCode: "अपने ईमेल पर भेजा गया कोड दर्ज करें",
    enterPhoneCode: "अपने मोबाइल पर भेजा गया कोड दर्ज करें",
    verifyEmail: "ईमेल सत्यापित करें",
    verifyPhone: "मोबाइल सत्यापित करें",
    resendCode: "कोड फिर भेजें",
    emailVerified: "ईमेल सत्यापित ✓",
    phoneVerified: "मोबाइल सत्यापित ✓",
    skipForNow: "अभी छोड़ें",
    verificationComplete: "सभी सत्यापन पूरे हुए!",
    sendingCode: "कोड भेजा जा रहा है…",
    verifyingCode: "सत्यापित हो रहा है…",
    genericAuthError: "कुछ गलत हुआ। कृपया फिर कोशिश करें।",
  },
  मराठी: {
    collector: "संकलक",
    recycler: "रिसायकलर",
    workspace: "कार्यस्थान",
    fieldData: "फील्ड डेटा",
    recoveryZones: "डंपिंग क्षेत्रे",
    yourImpact: "तुमचा प्रभाव",
    ewasteDiverted: "या महिन्यात वळवलेला ई-कचरा",
    monthlyGoal: "मासिक उद्दिष्टापैकी",
    online: "ऑनलाइन",
    offlineMode: "ऑफलाइन मोड",
    syncing: "सिंक होत आहे…",
    reconnect: "पुन्हा जोडा",
    voiceGuide: "व्हॉइस गाइड",
    offlineReady: "ऑफलाइन तयार",
    verifiedRoute: "पडताळलेला मार्ग",
    fairPriceRange: "योग्य किंमत श्रेणी",
    safetyFirst: "सुरक्षितता प्रथम",
    keepHandsSafe: "तुमचे हात सुरक्षित ठेवा",
    listen: "ऐका",
    viewSafeHandling: "सुरक्षित हाताळणी पहा",
    readyToWorkOffline: "ऑफलाइन कामासाठी तयार",
    tryItNow: "आता वापरा",
    backToOverview: "← आढाव्यावर परत जा",
    draftSavedLocally: "ड्राफ्ट स्थानिकरित्या जतन केला",
    newMaterialLot: "नवीन साहित्य लॉट",
    createLot: "लॉट तयार करा",
    captureOnce: "एकदाच नोंद करा. योग्य मार्ग मिळवा.",
    stepCapture: "पायरी ०१ / नोंद",
    stepCategorize: "पायरी ०२ / वर्गीकरण",
    stepEstimate: "पायरी ०३ / अंदाज",
    capture: "नोंद",
    categorize: "वर्गीकरण",
    estimate: "अंदाज",
    whatCollectedToday: "आज तुम्ही काय गोळा केले?",
    required: "आवश्यक",
    takePhotoUpload: "फोटो घ्या किंवा अपलोड करा",
    replacePhoto: "फोटो बदला",
    openCamera: "कॅमेरा उघडा",
    demoPhotoReady: "डेमो फोटो तयार आहे",
    goodLight: "चांगला प्रकाश श्रेणी सुचवण्यास मदत करतो",
    aiAssist: "AI श्रेणी सुचवेल. नियंत्रण तुमच्याकडे राहील.",
    whyAskPhoto: "आम्ही फोटो का मागतो",
    photoHelps: "यामुळे रिसायकलर योग्य मार्गाची तयारी करू शकतात आणि हँडओव्हरवेळी किमतीचे वाद कमी होतात.",
    aiSuggestionReady: "AI सूचना तयार आहे",
    uploadedEwasteLot: "अपलोड केलेला ई-कचरा लॉट",
    takesLessThanMinute: "एका मिनिटापेक्षा कमी वेळ लागतो",
    chooseClosestMatch: "सर्वात जवळचा पर्याय निवडा",
    estimateIndicative: "तुमचा अंदाज संकेतात्मक आहे",
    continue: "पुढे चला",
    saveLot: "लॉट जतन करा",
    reportZone: "झोन नोंदवा",
    allSources: "सर्व स्रोत",
    manual: "मॅन्युअल",
    municipal: "महापालिका",
    satellite: "उपग्रह",
    allStatuses: "सर्व स्थिती",
    active: "सक्रिय",
    verified: "पडताळलेले",
    unverified: "अपडताळलेले",
    cleared: "साफ केलेले",
    filters: "फिल्टर",
    all: "सर्व",
    legend: "दर्शक",
    score: "स्कोअर",
    chooseLanguage: "Language",
    chooseLogin: "Choose how you want to login",
    emailTab: "Email & Password",
    mobileTab: "Mobile OTP",
    email: "Email",
    mobileNumber: "Mobile Number",
    countryCode: "Country code",
    password: "Password",
    confirmPassword: "Confirm Password",
    name: "Full Name",
    otp: "Enter OTP",
    sendOtp: "Send OTP",
    verifyOtp: "Verify OTP",
    resendOtp: "Resend OTP",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password",
    signIn: "Sign In",
    createAccount: "Create Account",
    login: "Login",
    signUp: "Sign Up",
    logout: "Logout",
    or: "OR",
    otpInstructions: "We will send a one-time code to your mobile number.",
    otpSentTo: "OTP sent to",
    changeNumber: "Change number",
    loadingSignIn: "Signing in…",
    loadingCreate: "Creating account…",
    loadingSendOtp: "Sending OTP…",
    loadingVerifyOtp: "Verifying OTP…",
    emailRequired: "Please enter your email.",
    passwordRequired: "Please enter your password.",
    signupFieldsRequired: "Please complete all fields.",
    invalidEmail: "Please enter a valid email address.",
    invalidMobile: "Please enter a valid mobile number with country code.",
    passwordMismatch: "Passwords do not match.",
    passwordWeak: "Password must be at least 8 characters and include a letter and a number.",
    invalidCredentials: "Invalid email or password.",
    otpInvalidOrExpired: "Invalid or expired OTP. Please try again.",
    accountExists: "An account with this email already exists.",
    mobileAccountExists: "An account with this mobile number already exists.",
    accountCreated: "Account created successfully.",
    loginSuccessful: "Login successful.",
    unableToSendOtp: "Unable to send OTP. Please try again.",
    noMobileAccount: "Unable to sign in with this mobile number.",
    forgotPasswordPlaceholder: "Password reset is not available yet. Please contact an administrator.",
    fullNameRequired: "Please enter your full name.",
    noAccount: "Don’t have an account?",
    haveAccount: "Already have an account?",
    showPassword: "Show password",
    hidePassword: "Hide password",
    unableToVerifyOtp: "Unable to verify OTP. Please try again.",
    rateLimited: "Too many attempts. Please try again later.",
    accountCreateError: "Unable to create the account. Please try again.",
    verificationRequired: "कृपया तुमचा ईमेल आणि मोबाइल नंबर पडताळा.",
    verifyYourEmail: "तुमचा ईमेल पडताळा",
    verifyYourPhone: "तुमचा मोबाइल नंबर पडताळा",
    emailNotVerified: "ईमेल पडताळलेले नाही",
    phoneNotVerified: "मोबाइल नंबर पडताळलेले नाही",
    verificationCodeSent: "पडताळणी कोड पाठवला!",
    enterEmailCode: "तुमच्या ईमेलवर पाठवलेला कोड टाका",
    enterPhoneCode: "तुमच्या मोबाइलवर पाठवलेला कोड टाका",
    verifyEmail: "ईमेल पडताळा",
    verifyPhone: "मोबाइल पडताळा",
    resendCode: "कोड पुन्हा पाठवा",
    emailVerified: "ईमेल पडताळले ✓",
    phoneVerified: "मोबाइल पडताळले ✓",
    skipForNow: "आत्ता सोडा",
    verificationComplete: "सर्व पडताळणी पूर्ण!",
    sendingCode: "कोड पाठवत आहे…",
    verifyingCode: "पडताळत आहे…",
    genericAuthError: "Something went wrong. Please try again.",
  },
};

const LanguageContext = createContext<{ language: Language; t: (key: TranslationKey) => string } | null>(null);

export function LanguageProvider({ language, children }: { language: Language; children: ReactNode }) {
  return <LanguageContext.Provider value={{ language, t: (key) => translations[language][key] }}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used within LanguageProvider");
  return context;
}
