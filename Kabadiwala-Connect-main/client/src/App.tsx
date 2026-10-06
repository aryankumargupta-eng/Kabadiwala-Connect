import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BatteryWarning,
  ClipboardCheck,
  Database,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Copy,
  FileCheck2,
  History,
  Languages,
  Leaf,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  PackagePlus,
  Phone,
  Plus,
  Recycle,
  RefreshCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  Upload,
  Volume2,
  WalletCards,
  Wifi,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { trpc } from "./lib/trpc";
import RecoveryZonesPage from "./pages/RecoveryZones";
import LoginPage from "./pages/LoginPage";
import { LanguageProvider, type Language, useI18n } from "./i18n";
import "./index.css";

type View =
  | "home"
  | "create"
  | "matches"
  | "prices"
  | "activity"
  | "data"
  | "recovery"
  | "recycler";
type Role = "collector" | "recycler";
type DraftLot = {
  category: string;
  subcategory: string;
  weight: number;
  location: string;
  hasPhoto: boolean;
  photoUrl?: string;
};

type LiveLot = {
  id: string;
  title: string;
  collector: string;
  weight: string;
  location: string;
  price: string;
  category: string;
  createdAt: string;
};

type OfferMessage = {
  type: "offer" | "offer-response";
  offerId: string;
  lotId: string;
  material: string;
  collector: string;
  weight: string;
  amount: number;
  location: string;
  response?: "accepted" | "renegotiated";
  counterAmount?: number;
};

type Transaction = {
  id: string;
  material: string;
  weight: string;
  amount: string;
  date: string;
  status: "Paid" | "Pending";
  icon: "pcb" | "battery" | "cable";
};

type ChatMessage = {
  id: number;
  sender: "collector" | "recycler";
  text: string;
  time: string;
};

const initialChatMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "recycler",
    text: "Hi Ramesh, can we confirm the recyclable weight before I finalize the offer?",
    time: "10:24 AM",
  },
  {
    id: 2,
    sender: "collector",
    text: "Sure. The lot is approximately 3.2 kg, including the sorted cables.",
    time: "10:26 AM",
  },
];

const categories = [
  { name: "PCBs", sub: "Laptop boards", rate: 420, color: "mint", icon: "▦" },
  { name: "Cables", sub: "Copper cable", rate: 280, color: "amber", icon: "⌁" },
  {
    name: "Batteries",
    sub: "Li-ion packs",
    rate: 165,
    color: "rose",
    icon: "▣",
  },
  {
    name: "LCD panels",
    sub: "Display units",
    rate: 95,
    color: "blue",
    icon: "▤",
  },
  {
    name: "Motors",
    sub: "Small motors",
    rate: 210,
    color: "violet",
    icon: "◉",
  },
  {
    name: "Mixed plastic",
    sub: "Sorted plastic",
    rate: 48,
    color: "slate",
    icon: "◌",
  },
];

const recyclers = [
  {
    name: "EcoCircuit Recycling",
    code: "ECR-2047",
    distance: "4.8 km",
    time: "Pickup in 24h",
    quoteMultiplier: 1.08,
    score: "98% match",
    verified: true,
    accent: "green",
    why: ["Accepts PCBs", "Pickup available", "Above local median"],
  },
  {
    name: "GreenLoop Materials",
    code: "GLM-1892",
    distance: "7.2 km",
    time: "Drop-off today",
    quoteMultiplier: 0.975,
    score: "91% match",
    verified: true,
    accent: "blue",
    why: ["Accepts mixed lots", "Verified facility", "Same-day intake"],
  },
  {
    name: "Narmada Circulars",
    code: "NCR-0931",
    distance: "11.4 km",
    time: "Pickup in 48h",
    quoteMultiplier: 0.942,
    score: "86% match",
    verified: false,
    accent: "orange",
    why: ["Good price", "Status pending", "Pickup available"],
  },
];

function getIndicativeValue(weight: number, rate: number) {
  return Math.round(weight * rate * 1.03);
}

async function analyzeImageForMaterial(
  file: File,
  fallbackWeight: number
): Promise<{
  category: string;
  suggestion: string;
  estimatedValue: number;
  confidence: number;
} | null> {
  if (!file.type.startsWith("image/")) return null;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to decode image"));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.drawImage(image, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);

  let red = 0;
  let green = 0;
  let blue = 0;
  let brightness = 0;
  let highContrast = 0;
  let warmPixels = 0;
  let coolPixels = 0;

  for (let index = 0; index < data.length; index += 16) {
    const r = data[index];
    const g = data[index + 1];
    const b = data[index + 2];
    const avg = (r + g + b) / 3;

    red += r;
    green += g;
    blue += b;
    brightness += avg;
    highContrast += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);

    if (r > g + 20 && r > b + 20) warmPixels += 1;
    if (g > r + 20 && g > b + 20) coolPixels += 1;
  }

  const sampleCount = Math.max(1, Math.floor(data.length / 16 / 4));
  const avgRed = red / sampleCount;
  const avgGreen = green / sampleCount;
  const avgBlue = blue / sampleCount;
  const avgBrightness = brightness / sampleCount;
  const avgContrast = highContrast / sampleCount;
  const isGreenDominant = avgGreen > avgRed + 12 && avgGreen > avgBlue + 10;
  const isWarmDominant = avgRed > avgGreen + 15 && avgRed > avgBlue + 15;
  const isCoolDominant = avgBlue > avgRed + 10 && avgBlue > avgGreen + 10;
  const isMetallic = avgContrast > 110 && avgBrightness > 90;

  const scores: Record<string, number> = {
    PCBs: 0,
    Batteries: 0,
    Cables: 0,
    "LCD panels": 0,
    Motors: 0,
    "Mixed plastic": 0,
  };

  if (isGreenDominant) scores["PCBs"] += 42;
  if (avgBrightness > 80 && avgContrast < 55) scores["LCD panels"] += 26;
  if (isWarmDominant || warmPixels > coolPixels) scores["Batteries"] += 44;
  if (isCoolDominant || (avgBlue > 90 && avgBrightness < 170)) {
    scores["Cables"] += 38;
  }
  if (isMetallic) scores["Motors"] += 28;
  if (avgBrightness < 75 && avgContrast < 90) scores["Mixed plastic"] += 22;

  if (scores["PCBs"] > 0 && avgBrightness > 60) scores["PCBs"] += 15;
  if (Math.abs(avgRed - avgGreen) < 15 && Math.abs(avgGreen - avgBlue) < 15) {
    scores["Mixed plastic"] += 10;
  }

  const [category, confidence] = Object.entries(scores).sort(
    ([, scoreA], [, scoreB]) => scoreB - scoreA
  )[0];

  const fallbackRate =
    categories.find(item => item.name === category)?.rate ?? 180;
  const estimatedValue = getIndicativeValue(fallbackWeight, fallbackRate);

  return {
    category,
    suggestion:
      category === "PCBs"
        ? "Board-like electronics detected with green/metallic traces."
        : category === "Batteries"
          ? "Battery pack or energy cell pattern detected."
          : category === "Cables"
            ? "Copper or cable-like material detected in the image."
            : category === "LCD panels"
              ? "Display or panel-like waste detected."
              : category === "Motors"
                ? "Metallic motor or mechanical component detected."
                : "Mixed waste pattern detected; valuation uses the broader market range.",
    estimatedValue,
    confidence: Math.min(96, Math.max(55, confidence + 45)),
  };
}

function getRecyclerQuote(
  weight: number,
  rate: number,
  quoteMultiplier: number
) {
  return Math.round(weight * rate * quoteMultiplier);
}

const initialTransactions: Transaction[] = [
  {
    id: "LOT-240821",
    material: "Laptop PCBs",
    weight: "3.2 kg",
    amount: "₹1,344",
    date: "21 Aug 2026",
    status: "Paid",
    icon: "pcb",
  },
  {
    id: "LOT-240814",
    material: "Li-ion batteries",
    weight: "4.0 kg",
    amount: "₹660",
    date: "14 Aug 2026",
    status: "Pending",
    icon: "battery",
  },
  {
    id: "LOT-240806",
    material: "Copper cables",
    weight: "7.8 kg",
    amount: "₹2,184",
    date: "06 Aug 2026",
    status: "Paid",
    icon: "cable",
  },
];

const dictionary = {
  EN: {
    home: "Overview",
    create: "Create a lot",
    prices: "Price board",
    activity: "My activity",
    greeting: "Good morning",
    hero: "Turn every lot into a fairer handover.",
    heroSub:
      "Create a digital lot, compare local rates, and connect with verified recyclers — even when you are offline.",
    primary: "Create new lot",
  },
  हिंदी: {
    home: "अवलोकन",
    create: "लॉट बनाएं",
    prices: "कीमत बोर्ड",
    activity: "मेरी गतिविधि",
    greeting: "सुप्रभात",
    hero: "हर लॉट को बेहतर सौदे में बदलें।",
    heroSub:
      "डिजिटल लॉट बनाएं, स्थानीय कीमत देखें और प्रमाणित रिसाइकलर से जुड़ें — ऑफलाइन भी।",
    primary: "नया लॉट बनाएं",
  },
  मराठी: {
    home: "आढावा",
    create: "लॉट तयार करा",
    prices: "किंमत फलक",
    activity: "माझी नोंद",
    greeting: "शुभ सकाळ",
    hero: "प्रत्येक लॉटचा योग्य व्यवहार करा.",
    heroSub:
      "डिजिटल लॉट तयार करा, स्थानिक दर पहा आणि अधिकृत रिसायकलरशी जोडा — ऑफलाइन देखील.",
    primary: "नवीन लॉट तयार करा",
  },
} as const;

const offlineModeCopy = {
  EN: {
    title: "Offline mode is active",
    detail: "Your new lot will sync automatically when you reconnect.",
    caution:
      "Price caution: rates may change when you are back online. Please verify the final price before handover.",
  },
  हिंदी: {
    title: "ऑफ़लाइन मोड सक्रिय है",
    detail: "जब आप फिर से जुड़ेंगे तो आपका नया लॉट अपने आप सिंक हो जाएगा।",
    caution:
      "कीमत चेतावनी: ऑनलाइन लौटने पर दर बदल सकती हैं। हेंडओवर से पहले अंतिम कीमत की पुष्टि करें।",
  },
  मराठी: {
    title: "ऑफलाइन मोड सक्रिय आहे",
    detail: "तुम्ही पुन्हा जोडल्यावर तुमचा नवीन लॉट आपोआप समक्रमित होईल.",
    caution:
      "किंमत सावधानता: ऑनलाइन परत आल्यावर दर बदलू शकतात. हँडओव्हरपूर्वी अंतिम किंमत तपासा.",
  },
} as const;

const voiceGuideCopy = {
  EN: {
    title: "Get a fairer price for your lot.",
    text: "Take a photo of your lot, enter its weight, and connect with a verified recycler for a fairer price.",
    toast: "Voice guidance is available in Online Mode — reconnect to use it",
  },
  हिंदी: {
    title: "अपने लॉट की सही कीमत पाएं।",
    text: "अपने लॉट की तस्वीर लें, वजन दर्ज करें और बेहतर कीमत के लिए प्रमाणित रिसाइकलर से जुड़ें।",
    toast:
      "वॉइस गाइड केवल ऑनलाइन मोड में उपलब्ध है — इसे उपयोग करने के लिए फिर से जुड़ें",
  },
  मराठी: {
    title: "तुमच्या लॉटची योग्य किंमत मिळवा.",
    text: "तुमच्या लॉटचा फोटो काढा, वजन लिहा आणि योग्य किमतीसाठी अधिकृत रिसायकलरशी जोडा.",
    toast:
      "व्हॉइस गाइड केवळ ऑनलाइन मोडमध्ये उपलब्ध आहे — वापरण्यासाठी पुन्हा कनेक्ट करा",
  },
} as const;

const pageCopy = {
  EN: {
    back: "← Back to overview",
    priceKicker: "PRICE DISCOVERY",
    priceTitle: "Know your worth before you sell.",
    priceSub: "Indicative buying rates from recent local observations.",
    refresh: "Refresh board",
    updated: "Updated today · Pimpri, Pune",
    transparency: "Price transparency is your superpower.",
    compare:
      "Compare recycler offers against the local range before you accept.",
    median: "Today's local median",
    material: "MATERIAL",
    range: "LOCAL RANGE / KG",
    trend: "7-DAY TREND",
    observed: "LAST OBSERVED",
    indicative: "Indicative",
    today: "Today",
    yesterday: "Yesterday",
    fieldQuote: "field quote",
    ledgerKicker: "YOUR LEDGER",
    ledgerTitle: "Every handover, accounted for.",
    ledgerSub: "A simple record of your work, earnings, and pending dues.",
    ledgerSynced: "Ledger synced",
    exportRecord: "Export record",
    history: "TRANSACTION HISTORY",
    handovers: "Recent handovers",
    search: "Search",
    filter: "Filter",
    lotMaterial: "LOT / MATERIAL",
    weight: "WEIGHT",
    date: "DATE",
    value: "VALUE",
    status: "STATUS",
    dataKicker: "FIELD PILOT / SIH26229",
    dataTitle: "Make the formal route measurable.",
    dataSub:
      "Every lot becomes a safer handover, a better dataset, and a stronger case for scale.",
    exportPack: "Export evidence pack",
    evidence: "Evidence overview",
    datasets: "Live datasets",
    economics: "Unit economics",
    pilotStatus: "Field pilot · 2 collectors interviewed",
    structuredDatasets: "Structured datasets",
    traceabilityCoverage: "Traceability coverage",
    aiAssists: "AI assists",
    collectorUplift: "Avg. collector uplift",
    dataLineage: "DATA LINEAGE",
    lineageTitle: "From field action to verified record",
    aiReadiness: "AI / ML READINESS",
    automationTitle: "Useful automation, not buzzwords.",
    fieldCheckpoint: "Field validation checkpoint",
    checkpointText:
      "Two working collectors / aggregators were used to validate the core flow: photo → price → recycler → receipt.",
    openNotes: "Open notes",
    viewModel: "View model card",
    collected: "Collected",
    validated: "Validated",
    ranked: "Ranked",
    traceable: "Traceable",
    capture: "Capture",
    price: "Price",
    match: "Match",
    handover: "Handover",
    materialClassifier: "Material classifier",
    fairValue: "Fair-value estimator",
    abnormalFlag: "Abnormal-value flag",
  },
  हिंदी: {
    back: "← अवलोकन पर वापस जाएं",
    priceKicker: "कीमत जानकारी",
    priceTitle: "बेचने से पहले अपनी सही कीमत जानें।",
    priceSub: "हाल के स्थानीय निरीक्षणों से संकेतात्मक खरीद दरें।",
    refresh: "बोर्ड रीफ्रेश करें",
    updated: "आज अपडेट · पिंपरी, पुणे",
    transparency: "कीमत में पारदर्शिता आपकी ताकत है।",
    compare:
      "स्वीकार करने से पहले रिसाइकलर की पेशकशों की स्थानीय सीमा से तुलना करें।",
    median: "आज का स्थानीय औसत",
    material: "सामग्री",
    range: "स्थानीय सीमा / किलो",
    trend: "7-दिन का रुझान",
    observed: "अंतिम निरीक्षण",
    indicative: "संकेतात्मक",
    today: "आज",
    yesterday: "कल",
    fieldQuote: "फील्ड दर",
    ledgerKicker: "आपका लेखा",
    ledgerTitle: "हर हैंडओवर का पूरा हिसाब।",
    ledgerSub: "आपके काम, कमाई और बकाया का सरल रिकॉर्ड।",
    ledgerSynced: "लेखा सिंक है",
    exportRecord: "रिकॉर्ड निर्यात करें",
    history: "लेन-देन इतिहास",
    handovers: "हाल के हैंडओवर",
    search: "खोजें",
    filter: "फ़िल्टर",
    lotMaterial: "लॉट / सामग्री",
    weight: "वजन",
    date: "तारीख",
    value: "मूल्य",
    status: "स्थिति",
    dataKicker: "फील्ड पायलट / SIH26229",
    dataTitle: "औपचारिक मार्ग को मापने योग्य बनाएं।",
    dataSub:
      "हर लॉट सुरक्षित हैंडओवर, बेहतर डेटा और विस्तार के लिए मजबूत आधार बनता है।",
    exportPack: "साक्ष्य पैक निर्यात करें",
    evidence: "साक्ष्य अवलोकन",
    datasets: "लाइव डेटासेट",
    economics: "इकाई अर्थशास्त्र",
    pilotStatus: "फील्ड पायलट · 2 कलेक्टरों से बातचीत",
    structuredDatasets: "संरचित डेटासेट",
    traceabilityCoverage: "ट्रेसबिलिटी कवरेज",
    aiAssists: "AI सहायता",
    collectorUplift: "औसत कलेक्टर लाभ",
    dataLineage: "डेटा वंशावली",
    lineageTitle: "फील्ड कार्रवाई से सत्यापित रिकॉर्ड तक",
    aiReadiness: "AI / ML तैयारी",
    automationTitle: "उपयोगी ऑटोमेशन, सिर्फ दिखावा नहीं।",
    fieldCheckpoint: "फील्ड सत्यापन जांच",
    checkpointText:
      "फोटो → कीमत → रिसाइकलर → रसीद के मुख्य प्रवाह को दो सक्रिय कलेक्टरों से सत्यापित किया गया।",
    openNotes: "नोट्स खोलें",
    viewModel: "मॉडल कार्ड देखें",
    collected: "एकत्रित",
    validated: "सत्यापित",
    ranked: "क्रमित",
    traceable: "ट्रेस करने योग्य",
    capture: "दर्ज करना",
    price: "कीमत",
    match: "मिलान",
    handover: "हैंडओवर",
    materialClassifier: "सामग्री वर्गीकरण",
    fairValue: "उचित मूल्य अनुमान",
    abnormalFlag: "असामान्य मूल्य संकेत",
  },
  मराठी: {
    back: "← आढाव्यावर परत जा",
    priceKicker: "किंमत शोध",
    priceTitle: "विक्रीपूर्वी तुमची योग्य किंमत जाणून घ्या.",
    priceSub: "अलीकडील स्थानिक निरीक्षणांवर आधारित संकेतात्मक खरेदी दर.",
    refresh: "फलक रिफ्रेश करा",
    updated: "आज अपडेट · पिंपरी, पुणे",
    transparency: "किमतीतील पारदर्शकता ही तुमची ताकद आहे.",
    compare: "स्वीकारण्यापूर्वी रिसायकलरच्या ऑफरची स्थानिक श्रेणीशी तुलना करा.",
    median: "आजची स्थानिक सरासरी",
    material: "साहित्य",
    range: "स्थानिक श्रेणी / किलो",
    trend: "७ दिवसांचा कल",
    observed: "शेवटचे निरीक्षण",
    indicative: "संकेतात्मक",
    today: "आज",
    yesterday: "काल",
    fieldQuote: "फील्ड दर",
    ledgerKicker: "तुमची नोंद",
    ledgerTitle: "प्रत्येक हँडओव्हरचा पूर्ण हिशोब.",
    ledgerSub: "तुमचे काम, कमाई आणि बाकी रकमेची साधी नोंद.",
    ledgerSynced: "नोंद सिंक झाली",
    exportRecord: "नोंद निर्यात करा",
    history: "व्यवहार इतिहास",
    handovers: "अलीकडील हँडओव्हर",
    search: "शोधा",
    filter: "फिल्टर",
    lotMaterial: "लॉट / साहित्य",
    weight: "वजन",
    date: "तारीख",
    value: "मूल्य",
    status: "स्थिती",
    dataKicker: "फील्ड पायलट / SIH26229",
    dataTitle: "औपचारिक मार्ग मोजता येण्याजोगा करा.",
    dataSub:
      "प्रत्येक लॉट सुरक्षित हँडओव्हर, चांगला डेटा आणि विस्तारासाठी मजबूत आधार बनतो.",
    exportPack: "पुरावा पॅक निर्यात करा",
    evidence: "पुरावा आढावा",
    datasets: "लाइव्ह डेटासेट",
    economics: "युनिट इकॉनॉमिक्स",
    pilotStatus: "फील्ड पायलट · २ संकलकांच्या मुलाखती",
    structuredDatasets: "संरचित डेटासेट",
    traceabilityCoverage: "ट्रेसबिलिटी कव्हरेज",
    aiAssists: "AI सहाय्य",
    collectorUplift: "सरासरी संकलक लाभ",
    dataLineage: "डेटा प्रवाह",
    lineageTitle: "फील्ड कृतीपासून पडताळलेल्या नोंदीपर्यंत",
    aiReadiness: "AI / ML तयारी",
    automationTitle: "उपयुक्त ऑटोमेशन, केवळ दिखावा नाही.",
    fieldCheckpoint: "फील्ड पडताळणी तपासणी",
    checkpointText:
      "फोटो → किंमत → रिसायकलर → पावती हा मुख्य प्रवाह दोन सक्रिय संकलकांकडून पडताळला.",
    openNotes: "नोंदी उघडा",
    viewModel: "मॉडेल कार्ड पहा",
    collected: "गोळा केले",
    validated: "पडताळले",
    ranked: "क्रमांकित",
    traceable: "ट्रेस करण्यायोग्य",
    capture: "नोंद",
    price: "किंमत",
    match: "जुळणी",
    handover: "हँडओव्हर",
    materialClassifier: "साहित्य वर्गीकरण",
    fairValue: "योग्य मूल्य अंदाज",
    abnormalFlag: "असामान्य मूल्य संकेत",
  },
} as const;

function App() {
  const authQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation();
  const [view, setView] = useState<View>("home");
  const [role, setRole] = useState<Role>(() =>
    window.location.pathname.startsWith("/recycler") ||
    new URLSearchParams(window.location.search).get("workspace") === "recycler"
      ? "recycler"
      : "collector"
  );
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const localDemoWorkspace = useRef(false);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem("app_language") as Language) || "EN"
  );
  const [isOnline, setIsOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [showHandover, setShowHandover] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialChatMessages);
  const chatChannel = useRef<BroadcastChannel | null>(null);
  const [lotCreated, setLotCreated] = useState(false);
  const [lotId] = useState(
    () =>
      `LOT-${new Date().toISOString().slice(0, 10).replace(/-/g, "").slice(2)}-${Math.floor(Math.random() * 90 + 10)}`
  );
  const [transactions, setTransactions] = useState(initialTransactions);
  const [liveLots, setLiveLots] = useState<LiveLot[]>([]);
  const [incomingOffers, setIncomingOffers] = useState<OfferMessage[]>([]);
  const offerChannel = useRef<BroadcastChannel | null>(null);
  const [draftLot, setDraftLot] = useState<DraftLot>({
    category: "PCBs",
    subcategory: "Laptop boards",
    weight: 3.2,
    location: "Pimpri, Pune",
    hasPhoto: true,
  });
  const fieldDataQuery = trpc.fieldData.useQuery(undefined, {
    enabled: workspaceOpen,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const trpcUtils = trpc.useUtils();
  const createLotMutation = trpc.lots.create.useMutation();
  const createHandoverMutation = trpc.handovers.create.useMutation();

  const t = dictionary[language];
  const displayName =
    authQuery.data?.name?.trim() ||
    userName?.trim() ||
    (role === "collector" ? "Ramesh K." : "EcoCircuit Recycling");

  useEffect(() => {
    const stored = window.localStorage.getItem("kabadiwala-lot-created");
    if (stored) setLotCreated(true);
  }, []);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("kabadiwala-offers");
    offerChannel.current = channel;
    channel.onmessage = (event: MessageEvent<OfferMessage>) => {
      const message = event.data;
      if (message?.type === "offer" && message.offerId) {
        setIncomingOffers(items =>
          items.some(item => item.offerId === message.offerId)
            ? items
            : [message, ...items]
        );
        if (role === "collector")
          setToast(`New offer received for ${message.lotId}`);
      }
      if (message?.type === "offer-response" && message.response) {
        setToast(
          message.response === "accepted"
            ? `Collector accepted the offer for ${message.lotId}`
            : `Collector countered with ₹${message.counterAmount?.toLocaleString("en-IN")}`
        );
      }
    };
    return () => {
      channel.close();
      offerChannel.current = null;
    };
  }, [role]);

  const respondToOffer = (
    offer: OfferMessage,
    response: "accepted" | "renegotiated",
    counterAmount?: number
  ) => {
    offerChannel.current?.postMessage({
      ...offer,
      type: "offer-response",
      response,
      counterAmount,
    } satisfies OfferMessage);
    setIncomingOffers(items =>
      items.filter(item => item.offerId !== offer.offerId)
    );
    setToast(
      response === "accepted"
        ? `Offer accepted for ${offer.lotId}`
        : `Counter-offer sent for ${offer.lotId}`
    );
  };

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("kabadiwala-lot-updates");
    channel.onmessage = (event: MessageEvent<LiveLot>) => {
      if (!event.data?.id || !event.data.title) return;
      setLiveLots(items =>
        items.some(item => item.id === event.data.id)
          ? items
          : [event.data, ...items]
      );
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("kabadiwala-live-chat");
    chatChannel.current = channel;
    channel.onmessage = (event: MessageEvent<ChatMessage>) => {
      if (event.data?.id && event.data?.text) {
        setChatMessages(items =>
          items.some(item => item.id === event.data.id)
            ? items
            : [...items, event.data]
        );
      }
    };
    return () => {
      channel.close();
      chatChannel.current = null;
    };
  }, []);

  const sendChatMessage = (text: string) => {
    const message: ChatMessage = {
      id: Date.now(),
      sender: role,
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };
    setChatMessages(items => [...items, message]);
    chatChannel.current?.postMessage(message);
  };

  useEffect(() => {
    const syncFromPath = () => {
      if (authQuery.isLoading) return;
      const path = window.location.pathname;
      const authenticated = Boolean(authQuery.data);
      if (path === "/" || path === "/login" || (!authenticated && !localDemoWorkspace.current)) {
        setWorkspaceOpen(false);
        setView("home");
        if (!authenticated && !localDemoWorkspace.current && path !== "/" && path !== "/login") {
          window.history.replaceState({}, "", "/login");
        }
        return;
      }
      setWorkspaceOpen(true);
      const nextRole: Role =
        path.startsWith("/recycler") ||
        new URLSearchParams(window.location.search).get("workspace") ===
          "recycler"
          ? "recycler"
          : "collector";
      setRole(nextRole);
      if (path === "/recovery-zones") {
        setView("recovery");
        return;
      }
      setView("home");
    };

    syncFromPath();
    window.addEventListener("popstate", syncFromPath);
    return () => window.removeEventListener("popstate", syncFromPath);
  }, [authQuery.data, authQuery.isLoading]);

  const navigate = (next: View) => {
    setView(next);
    if (next === "recovery") {
      window.history.pushState({}, "", `/recovery-zones?workspace=${role}`);
    } else {
      window.history.pushState({}, "", `/${role}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openWorkspace = (nextRole: Role, name?: string, isDemo = false) => {
    localDemoWorkspace.current = isDemo;
    setRole(nextRole);
    setView("home");
    setWorkspaceOpen(true);
    if (name) setUserName(name);
    window.history.pushState({}, "", `/${nextRole}`);
    void authQuery.refetch();
  };

  const changeRole = (nextRole: Role) => {
    setRole(nextRole);
    window.history.replaceState(
      {},
      "",
      view === "recovery"
        ? `/recovery-zones?workspace=${nextRole}`
        : `/${nextRole}`
    );
  };

  const openVoice = () => {
    if (!isOnline) {
      setToast(voiceGuideCopy[language].toast);
      return;
    }
    setShowVoice(true);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
    localDemoWorkspace.current = false;
    setWorkspaceOpen(false);
    window.history.replaceState({}, "", "/login");
    await authQuery.refetch();
  };

  const setOffline = () => {
    setIsOnline(previous => {
      const next = !previous;
      setToast(
        next
          ? "Back online — 1 pending lot synced"
          : "Offline mode on — core actions still work"
      );
      return next;
    });
  };

  const completeHandover = async () => {
    setShowHandover(false);
    setSyncing(true);
    const activeCategory =
      categories.find(item => item.name === draftLot.category) ?? categories[0];
    const estimatedValue = getIndicativeValue(
      draftLot.weight,
      activeCategory.rate
    );
    try {
      await createHandoverMutation.mutateAsync({
        handoverReference: `KC-${lotId}`,
        lotId,
        recyclerCode: "ECR-2047",
        recordedWeight: draftLot.weight,
        gpsLocation: draftLot.location,
        handoverCode: "482906",
        paymentStatus: "cash_paid",
        transactionStatus: "confirmed",
      });
      await trpcUtils.fieldData.invalidate();
    } catch {
      setToast("Saved locally — database sync will retry when you reconnect");
    }
    window.setTimeout(() => {
      setSyncing(false);
      setLotCreated(true);
      window.localStorage.setItem("kabadiwala-lot-created", "true");
      setTransactions(items => [
        {
          id: lotId,
          material: draftLot.category,
          weight: `${draftLot.weight.toFixed(1)} kg`,
          amount: `₹${estimatedValue.toLocaleString("en-IN")}`,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          status: "Paid",
          icon: "pcb",
        },
        ...items,
      ]);
      setToast("Handover verified — receipt added to your ledger");
      navigate("activity");
    }, 900);
  };

  const saveLot = async () => {
    const activeCategory =
      categories.find(item => item.name === draftLot.category) ?? categories[0];
    const estimatedValue = getIndicativeValue(
      draftLot.weight,
      activeCategory.rate
    );
    try {
      await createLotMutation.mutateAsync({
        lotId,
        collectorId: "KC-0084",
        category: draftLot.category,
        subcategory: draftLot.subcategory,
        description: `${draftLot.subcategory} collected through field pilot`,
        approximateWeight: draftLot.weight,
        condition: "mixed",
        sourceType: "informal_collection",
        collectionLocation: draftLot.location,
        estimatedValue,
        quotedPrice: getRecyclerQuote(
          draftLot.weight,
          activeCategory.rate,
          recyclers[0].quoteMultiplier
        ),
        status: "matched",
      });
      await trpcUtils.fieldData.invalidate();
      setToast("Lot saved to the persistent field dataset");
    } catch {
      setToast(
        "Lot kept offline — it will sync when the database is reachable"
      );
    }
    const liveLot: LiveLot = {
      id: lotId,
      title: `${draftLot.category} + ${draftLot.subcategory}`,
      collector: "Ramesh K.",
      weight: `${draftLot.weight.toFixed(1)} kg`,
      location: draftLot.location,
      price: `₹${getRecyclerQuote(
        draftLot.weight,
        activeCategory.rate,
        recyclers[0].quoteMultiplier
      ).toLocaleString("en-IN")}`,
      category: draftLot.category,
      createdAt: new Date().toISOString(),
    };
    setLiveLots(items =>
      items.some(item => item.id === liveLot.id) ? items : [liveLot, ...items]
    );
    if (typeof BroadcastChannel !== "undefined") {
      const channel = new BroadcastChannel("kabadiwala-lot-updates");
      channel.postMessage(liveLot);
      channel.close();
    }
    navigate("matches");
  };

  const renderCollector = () => {
    switch (view) {
      case "create":
        return (
          <CreateLot
            lotId={lotId}
            draft={draftLot}
            setDraft={setDraftLot}
            onBack={() => navigate("home")}
            onContinue={saveLot}
            onToast={setToast}
          />
        );
      case "matches":
        return (
          <Matches
            lotId={lotId}
            draft={draftLot}
            onBack={() => navigate("create")}
            onSelect={() => setShowHandover(true)}
          />
        );
      case "prices":
        return <PriceBoard onBack={() => navigate("home")} />;
      case "activity":
        return (
          <Activity
            transactions={transactions}
            onBack={() => navigate("home")}
          />
        );
      case "data":
        return (
          <DataHub
            onBack={() => navigate("home")}
            onToast={setToast}
            fieldData={fieldDataQuery.data}
            recyclerMode
          />
        );
      case "recovery":
        return <RecoveryZonesPage />;
      default:
        return (
          <CollectorHome
            language={language}
            t={t}
            userName={displayName}
            isOnline={isOnline}
            lotCreated={lotCreated}
            onNavigate={navigate}
            onVoice={openVoice}
          />
        );
    }
  };

  if (!workspaceOpen) {
    return (
      <LanguageProvider language={language}>
        <LoginPage
          onOpenWorkspace={openWorkspace}
          onLanguageChange={nextLanguage => {
            setLanguage(nextLanguage);
            localStorage.setItem("app_language", nextLanguage);
          }}
        />
      </LanguageProvider>
    );
  }

  // make sure to consider if you need authentication for certain routes
  return (
    <LanguageProvider language={language}>
      <div className="app-shell">
        <div className="grain" aria-hidden="true" />
        <div className="app-layout">
          <Sidebar
            role={role}
            view={view}
            t={t}
            userName={displayName}
            onNavigate={navigate}
          />
          <main className="main-area">
            <Topbar
              role={role}
              language={language}
              isOnline={isOnline}
              syncing={syncing}
              showLanguage={showLanguage}
              unreadMessages={chatMessages.length > initialChatMessages.length}
              onOpenChat={() => setShowLiveChat(true)}
              onOfflineToggle={setOffline}
              onLanguageClick={() => setShowLanguage(open => !open)}
              onLanguageChange={next => {
                setLanguage(next);
                setShowLanguage(false);
              }}
              onLogout={logout}
            />
            {role === "recycler" ? (
              view === "prices" ? (
                <PriceBoard
                  onBack={() => navigate("home")}
                  recyclerMode
                  onToast={setToast}
                />
              ) : view === "create" ? (
                <RecyclerOfferPage
                  liveLots={liveLots}
                  onBack={() => navigate("home")}
                  onToast={setToast}
                  onOfferSent={offer =>
                    offerChannel.current?.postMessage(offer)
                  }
                />
              ) : view === "data" ? (
                <DataHub
                  onBack={() => navigate("home")}
                  onToast={setToast}
                  fieldData={fieldDataQuery.data}
                />
              ) : (
                <RecyclerConsole
                  onToast={setToast}
                  onOpenChat={() => setShowLiveChat(true)}
                  liveLots={liveLots}
                  userName={displayName}
                />
              )
            ) : (
              <>
                {renderCollector()}
                {incomingOffers[0] && (
                  <OfferInbox
                    offer={incomingOffers[0]}
                    onAccept={offer => respondToOffer(offer, "accepted")}
                    onRenegotiate={(offer, amount) =>
                      respondToOffer(offer, "renegotiated", amount)
                    }
                  />
                )}
              </>
            )}
          </main>
        </div>
        <MobileNav
          role={role}
          view={view}
          t={t}
          onNavigate={navigate}
          onRoleChange={changeRole}
        />
        {toast && <Toast message={toast} />}
        {showHandover && (
          <HandoverModal
            lotId={lotId}
            lot={draftLot}
            onClose={() => setShowHandover(false)}
            onConfirm={completeHandover}
          />
        )}
        {showVoice && (
          <VoiceModal language={language} onClose={() => setShowVoice(false)} />
        )}
        {showLiveChat && (
          <LiveChat
            role={role}
            messages={chatMessages}
            onClose={() => setShowLiveChat(false)}
            onSend={sendChatMessage}
          />
        )}
      </div>
    </LanguageProvider>
  );
}

function Sidebar({
  role,
  view,
  t,
  userName,
  onNavigate,
}: {
  role: Role;
  view: View;
  t: (typeof dictionary)[Language];
  userName: string;
  onNavigate: (view: View) => void;
}) {
  const { t: copy } = useI18n();
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <aside className="sidebar">
      <div className="brand-lockup">
        <div className="brand-mark">
          <Leaf size={20} strokeWidth={2.6} />
        </div>
        <div>
          <div className="brand-name">
            kabadiwala<span>connect</span>
          </div>
          <div className="brand-kicker">formalize the chain</div>
        </div>
      </div>
      <div className="sidebar-rule" />
      <div className="nav-label">WORKSPACE</div>
      <nav className="side-nav">
        <NavItem
          icon={<LayoutDashboard size={18} />}
          label={role === "recycler" ? "Incoming lots" : t.home}
          active={view === "home"}
          onClick={() => onNavigate("home")}
        />
        <NavItem
          icon={<PackagePlus size={18} />}
          label={role === "recycler" ? "Apply an offer" : t.create}
          active={view === "create" || view === "matches"}
          onClick={() => onNavigate("create")}
          badge="01"
        />
        <NavItem
          icon={<CircleDollarSign size={18} />}
          label={t.prices}
          active={view === "prices"}
          onClick={() => onNavigate("prices")}
        />
        <NavItem
          icon={<History size={18} />}
          label={t.activity}
          active={view === "activity"}
          onClick={() => onNavigate("activity")}
        />
        <NavItem
          icon={<Database size={18} />}
          label={copy("fieldData")}
          active={view === "data"}
          onClick={() => onNavigate("data")}
        />
        {role === "collector" && (
          <NavItem
            icon={<MapPin size={18} />}
            label={copy("recoveryZones")}
            active={view === "recovery"}
            onClick={() => onNavigate("recovery")}
          />
        )}
      </nav>
      <div className="sidebar-bottom">
        {role === "collector" && (
          <div className="impact-mini">
            <div className="impact-mini-top">
              <Sparkles size={15} />
              <span>{copy("yourImpact")}</span>
            </div>
            <div className="impact-value">14.8 kg</div>
            <div className="impact-caption">{copy("ewasteDiverted")}</div>
            <div className="impact-line">
              <span style={{ width: "72%" }} />
            </div>
            <div className="impact-foot">
              <span>72% {copy("monthlyGoal")}</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        )}
        <div className="profile-row">
          <div className="avatar">{initials}</div>
          <div>
            <div className="profile-name">{userName}</div>
            <div className="profile-meta">
              {role === "collector"
                ? "Collector ID · KC-0084"
                : "Recycler ID · ER-2047"}
            </div>
          </div>
          <Menu size={17} className="muted-icon" />
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <button
      className={active ? "nav-item active" : "nav-item"}
      onClick={onClick}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </button>
  );
}

function Topbar({
  role,
  language,
  isOnline,
  syncing,
  showLanguage,
  unreadMessages,
  onOpenChat,
  onOfflineToggle,
  onLanguageClick,
  onLanguageChange,
  onLogout,
}: {
  role: Role;
  language: Language;
  isOnline: boolean;
  syncing: boolean;
  showLanguage: boolean;
  unreadMessages: boolean;
  onOpenChat: () => void;
  onOfflineToggle: () => void;
  onLanguageClick: () => void;
  onLanguageChange: (language: Language) => void;
  onLogout: () => void;
}) {
  const { t: copy } = useI18n();
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <div className="brand-mark small">
          <Leaf size={17} />
        </div>
        <span>
          kabadiwala<span>connect</span>
        </span>
      </div>
      <div className="topbar-context">
        <span className="context-current">
          {role === "collector" ? copy("collector") : copy("recycler")}{" "}
          {copy("workspace")}
        </span>
      </div>
      <div className="topbar-actions">
        <button
          className={isOnline ? "network-pill online" : "network-pill offline"}
          onClick={onOfflineToggle}
        >
          {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>
            {syncing
              ? copy("syncing")
              : isOnline
                ? copy("online")
                : copy("offlineMode")}
          </span>
          {!isOnline && <span className="queue-count">1</span>}
        </button>
        <div className="language-wrap">
          <button className="language-button" onClick={onLanguageClick}>
            <Languages size={16} />
            <span>{language}</span>
            <ChevronRight
              size={14}
              className={showLanguage ? "rotate-90" : ""}
            />
          </button>
          {showLanguage && (
            <div className="language-menu">
              {(["EN", "हिंदी", "मराठी"] as Language[]).map(item => (
                <button
                  key={item}
                  onClick={() => onLanguageChange(item)}
                  className={item === language ? "selected" : ""}
                >
                  {item}
                  {item === language && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
        <button className="icon-button notification">
          <Bell size={18} />
          <span />
        </button>
        <button
          className={
            unreadMessages ? "chat-topbar-button unread" : "chat-topbar-button"
          }
          onClick={onOpenChat}
          aria-label="Open live chat"
        >
          <MessageCircle size={17} />
          <span>Live chat</span>
          {unreadMessages && <b>NEW</b>}
        </button>
        <button className="logout-button" onClick={onLogout}>
          {copy("logout")}
        </button>
      </div>
    </header>
  );
}

function CollectorHome({
  language,
  t,
  userName,
  isOnline,
  lotCreated,
  onNavigate,
  onVoice,
}: {
  language: Language;
  t: (typeof dictionary)[Language];
  userName?: string;
  isOnline: boolean;
  lotCreated: boolean;
  onNavigate: (view: View) => void;
  onVoice: () => void;
}) {
  const { t: copy } = useI18n();
  return (
    <div className="page-content home-page">
      <section className="welcome-row">
        <div>
          <div className="eyebrow green">COLLECTOR OVERVIEW · 02 SEPT 2026</div>
          <h1>{[t.greeting, userName?.trim()].filter(Boolean).join(", ")}</h1>
          <p className="welcome-sub">
            {language === "मराठी"
              ? "आजच्या लॉटमधून अधिक कमवा."
              : language === "हिंदी"
                ? "आज के लॉट से अधिक कमाएं।"
                : "Let’s make today’s lots count for more."}
          </p>
        </div>
        <div className="welcome-actions">
          <button className="ghost-button" onClick={onVoice}>
            <Volume2 size={16} /> {copy("voiceGuide")} ·{" "}
            {isOnline ? copy("online") : copy("reconnect")}{" "}
          </button>
          <button
            className="primary-button"
            onClick={() => onNavigate("create")}
          >
            <Plus size={17} /> {t.primary}
          </button>
        </div>
      </section>
      <section className="hero-band">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="signal-dot" /> FORMAL RECYCLING, MADE SIMPLE
          </div>
          <h2>{t.hero}</h2>
          <p>{t.heroSub}</p>
          <button className="hero-button" onClick={() => onNavigate("create")}>
            {t.primary} <ArrowRight size={17} />
          </button>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-leaf">
            <Recycle size={68} strokeWidth={1.1} />
          </div>
          <div className="hero-tag tag-one">
            <ShieldCheck size={14} /> {copy("verifiedRoute")}
          </div>
          <div className="hero-tag tag-two">
            <CircleDollarSign size={14} /> {copy("fairPriceRange")}
          </div>
          <div className="hero-tag tag-three">
            <WifiOff size={14} /> {copy("offlineReady")}
          </div>
        </div>
      </section>
      <section className="stat-grid">
        <StatCard
          label="This month’s earnings"
          value="₹4,188"
          change="+18.6%"
          detail="vs. last month"
          icon={<WalletCards size={19} />}
          tone="green"
        />
        <StatCard
          label="Lots formalized"
          value="12"
          change="+4 lots"
          detail="this month"
          icon={<PackageCheck size={19} />}
          tone="amber"
        />
        <StatCard
          label="Material diverted"
          value="14.8 kg"
          change="On track"
          detail="72% of monthly goal"
          icon={<Leaf size={19} />}
          tone="blue"
        />
      </section>
      <section className="home-grid">
        <div className="section-panel recent-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">RECENT LOTS</div>
              <h3>Your traceable activity</h3>
            </div>
            <button
              className="text-button"
              onClick={() => onNavigate("activity")}
            >
              View ledger <ArrowUpRight size={15} />
            </button>
          </div>
          <div className="transaction-list">
            {lotCreated && (
              <div className="transaction-row new-row">
                <MaterialGlyph type="pcb" />
                <div className="transaction-main">
                  <strong>Laptop PCBs</strong>
                  <span>LOT-240902 · just now</span>
                </div>
                <div className="transaction-amount">
                  <strong>₹1,410</strong>
                  <span className="status paid">Paid</span>
                </div>
                <ChevronRight size={16} className="row-chevron" />
              </div>
            )}
            {initialTransactions.slice(0, 3).map(item => (
              <div className="transaction-row" key={item.id}>
                <MaterialGlyph type={item.icon} />
                <div className="transaction-main">
                  <strong>{item.material}</strong>
                  <span>
                    {item.id} · {item.date}
                  </span>
                </div>
                <div className="transaction-amount">
                  <strong>{item.amount}</strong>
                  <span
                    className={
                      item.status === "Paid" ? "status paid" : "status pending"
                    }
                  >
                    {item.status}
                  </span>
                </div>
                <ChevronRight size={16} className="row-chevron" />
              </div>
            ))}
          </div>
        </div>
        <div className="section-panel safety-panel">
          <div className="safety-top">
            <div className="safety-icon">
              <ShieldAlert size={21} />
            </div>
            <div>
              <div className="eyebrow amber-text">{copy("safetyFirst")}</div>
              <h3>{copy("keepHandsSafe")}</h3>
            </div>
          </div>
          <p>
            Never burn cables or break CRTs. Keep damaged batteries away from
            heat and water.
          </p>
          <div className="safety-actions">
            <button onClick={onVoice}>
              <Volume2 size={16} /> {copy("listen")}
            </button>
            <button onClick={() => onNavigate("prices")}>
              {copy("viewSafeHandling")} <ChevronRight size={15} />
            </button>
          </div>
          <div className="safety-illustration">
            <div className="safety-circle">
              <BatteryWarning size={27} />
            </div>
            <div className="safety-line line-a" />
            <div className="safety-line line-b" />
            <div className="safety-dot dot-a" />
            <div className="safety-dot dot-b" />
          </div>
        </div>
      </section>
      <section className="offline-strip">
        <div className="offline-icon">
          <WifiOff size={17} />
        </div>
        <div>
          <strong>
            {isOnline
              ? copy("readyToWorkOffline")
              : offlineModeCopy[language].title}
          </strong>
          <span>
            {isOnline
              ? "Your core actions stay available if the network drops."
              : offlineModeCopy[language].detail}
          </span>
          {!isOnline && (
            <span className="offline-price-caution">
              <ShieldAlert size={13} /> {offlineModeCopy[language].caution}
            </span>
          )}
        </div>
        <button onClick={() => onNavigate("create")}>
          {copy("tryItNow")} <ArrowRight size={15} />
        </button>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  change,
  detail,
  icon,
  tone,
}: {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-card-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-bottom">
        <span className="stat-change">
          <ArrowUpRight size={13} /> {change}
        </span>
        <span>{detail}</span>
      </div>
    </div>
  );
}

function CreateLot({
  lotId,
  draft,
  setDraft,
  onBack,
  onContinue,
  onToast,
}: {
  lotId: string;
  draft: DraftLot;
  setDraft: React.Dispatch<React.SetStateAction<DraftLot>>;
  onBack: () => void;
  onContinue: () => void;
  onToast: (message: string) => void;
}) {
  const [step, setStep] = useState(1);
  const { t: copy } = useI18n();
  const fileInput = useRef<HTMLInputElement>(null);
  const activeCategory =
    categories.find(item => item.name === draft.category) ?? categories[0];
  const estimate = getIndicativeValue(draft.weight, activeCategory.rate);
  const low = Math.round(estimate * 0.92);
  const high = Math.round(estimate * 1.08);
  const handlePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setDraft(current => ({
      ...current,
      hasPhoto: true,
      photoUrl: objectUrl,
    }));

    const analysis = await analyzeImageForMaterial(file, draft.weight);
    if (!analysis) {
      onToast(`${copy("demoPhotoReady")} — ${copy("aiSuggestionReady")}`);
      return;
    }

    setDraft(current => ({
      ...current,
      category: analysis.category,
      subcategory:
        analysis.category === "PCBs"
          ? "Laptop boards"
          : analysis.category === "Batteries"
            ? "Li-ion packs"
            : analysis.category === "Cables"
              ? "Copper cable"
              : analysis.category === "LCD panels"
                ? "Display units"
                : analysis.category === "Motors"
                  ? "Small motors"
                  : "Sorted plastic",
      weight: Number(Math.max(0.5, draft.weight).toFixed(1)),
    }));

    onToast(
      `AI detected ${analysis.category} with ${Math.round(analysis.confidence)}% confidence · estimated market value ₹${analysis.estimatedValue.toLocaleString("en-IN")}`
    );
  };
  return (
    <div className="page-content create-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          {copy("backToOverview")}
        </button>
        <div className="draft-status">
          <span className="green-dot" /> {copy("draftSavedLocally")}
        </div>
      </div>
      <div className="create-header">
        <div>
          <div className="eyebrow green">{copy("newMaterialLot")}</div>
          <h1>{copy("createLot")}</h1>
          <p>{copy("captureOnce")}</p>
        </div>
        <div className="lot-id-chip">
          <span>LOT ID</span>
          <strong>{lotId}</strong>
          <Copy size={14} />
        </div>
      </div>
      <div className="stepper">
        <Step
          number="01"
          label={copy("capture")}
          active={step === 1}
          done={step > 1}
        />
        <div className="step-line" />
        <Step
          number="02"
          label={copy("categorize")}
          active={step === 2}
          done={step > 2}
        />
        <div className="step-line" />
        <Step
          number="03"
          label={copy("estimate")}
          active={step === 3}
          done={false}
        />
      </div>
      {step === 1 && (
        <div className="create-grid">
          <div className="capture-panel">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">{copy("stepCapture")}</div>
                <h3>{copy("whatCollectedToday")}</h3>
              </div>
              <span className="required-tag">{copy("required")}</span>
            </div>
            <div
              className={
                draft.hasPhoto ? "capture-zone has-photo" : "capture-zone"
              }
              onClick={() => fileInput.current?.click()}
            >
              {draft.photoUrl ? (
                <img src={draft.photoUrl} alt={copy("uploadedEwasteLot")} />
              ) : (
                <>
                  <div className="capture-art">
                    <div className="art-board">
                      <div className="art-chip" />
                      <div className="art-trace t1" />
                      <div className="art-trace t2" />
                      <div className="art-trace t3" />
                    </div>
                    <div className="art-cable" />
                    <div className="art-battery" />
                  </div>
                  <div className="capture-copy">
                    <strong>
                      {draft.hasPhoto
                        ? copy("demoPhotoReady")
                        : copy("takePhotoUpload")}
                    </strong>
                    <span>{copy("goodLight")}</span>
                  </div>
                </>
              )}
              <div className="capture-action">
                <CameraIcon />{" "}
                {draft.hasPhoto ? copy("replacePhoto") : copy("openCamera")}
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={handlePhoto}
            />
            <div className="capture-hint">
              <Sparkles size={15} />
              <span>{copy("aiAssist")}</span>
            </div>
          </div>
          <div className="side-note-panel">
            <div className="note-icon">
              <Zap size={18} />
            </div>
            <div>
              <strong>{copy("whyAskPhoto")}</strong>
              <p>{copy("photoHelps")}</p>
            </div>
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="category-step">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">{copy("stepCategorize")}</div>
              <h3>What does this lot contain?</h3>
            </div>
            <span className="ai-pill">
              <Sparkles size={14} /> AI suggests PCBs
            </span>
          </div>
          <div className="category-grid">
            {categories.map(item => (
              <button
                key={item.name}
                className={
                  draft.category === item.name
                    ? "category-tile selected"
                    : "category-tile"
                }
                onClick={() =>
                  setDraft(current => ({
                    ...current,
                    category: item.name,
                    subcategory: item.sub,
                  }))
                }
              >
                <div className={`category-glyph ${item.color}`}>
                  {item.icon}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sub}</span>
                </div>
                {draft.category === item.name && (
                  <CheckCircle2 size={18} className="selected-check" />
                )}
              </button>
            ))}
          </div>
          <div className="hazard-callout">
            <div className="hazard-icon">
              <BatteryWarning size={19} />
            </div>
            <div>
              <strong>Safety note for this category</strong>
              <span>
                Do not burn cables or open boards. Use gloves when sorting.
              </span>
            </div>
            <button
              onClick={() => onToast("Safety card queued for offline playback")}
            >
              <Volume2 size={15} /> Listen
            </button>
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="estimate-step">
          <div className="estimate-form">
            <div className="panel-heading">
              <div>
                <div className="eyebrow">{copy("stepEstimate")}</div>
                <h3>Tell us the approximate weight</h3>
              </div>
              <span className="approx-tag">Approximate is okay</span>
            </div>
            <label className="field-label">
              Weight of lot <span>in kilograms</span>
            </label>
            <div className="weight-input">
              <button
                onClick={() =>
                  setDraft(current => ({
                    ...current,
                    weight: Math.max(
                      0.5,
                      Number((current.weight - 0.5).toFixed(1))
                    ),
                  }))
                }
              >
                −
              </button>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={draft.weight}
                onChange={event =>
                  setDraft(current => ({
                    ...current,
                    weight: Number(event.target.value),
                  }))
                }
              />
              <span>kg</span>{" "}
              <button
                onClick={() =>
                  setDraft(current => ({
                    ...current,
                    weight: Number((current.weight + 0.5).toFixed(1)),
                  }))
                }
              >
                +
              </button>
            </div>
            <label className="field-label location-label">
              Collection location
            </label>
            <div className="location-field">
              <MapPin size={17} />
              <span>{draft.location}</span>
              <button onClick={() => onToast("Location locked for this demo")}>
                Change
              </button>
            </div>
            <div className="offline-check">
              <WifiOff size={15} />
              <span>This lot can be saved offline and synced later.</span>
            </div>
          </div>
          <div className="estimate-card">
            <div className="eyebrow amber-text">INDICATIVE VALUE</div>
            <div className="estimate-value">
              ₹{low.toLocaleString("en-IN")} <span>—</span> ₹
              {high.toLocaleString("en-IN")}
            </div>
            <div className="estimate-meta">
              <span>
                {draft.weight.toFixed(1)} kg · {draft.category}
              </span>
              <span>Local rate · ₹{activeCategory.rate}/kg</span>
            </div>
            <div className="estimate-rule" />
            <div className="estimate-explain">
              <CircleDollarSign size={17} />
              <span>
                Based on recent local observations. Final value is confirmed at
                handover.
              </span>
            </div>
            <button className="primary-button wide" onClick={onContinue}>
              Find my best recycler <ArrowRight size={17} />
            </button>
          </div>
        </div>
      )}
      <div className="create-footer">
        <button
          className="ghost-button"
          onClick={step === 1 ? onBack : () => setStep(current => current - 1)}
        >
          {step === 1 ? "Cancel" : "← Previous"}
        </button>
        <div className="footer-hint">
          {step === 1
            ? copy("takesLessThanMinute")
            : step === 2
              ? copy("chooseClosestMatch")
              : copy("estimateIndicative")}
        </div>
        {step < 3 ? (
          <button
            className="primary-button"
            onClick={() => setStep(current => current + 1)}
          >
            {copy("continue")} <ArrowRight size={17} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Step({
  number,
  label,
  active,
  done,
}: {
  number: string;
  label: string;
  active: boolean;
  done: boolean;
}) {
  return (
    <div className={`step ${active ? "active" : ""} ${done ? "done" : ""}`}>
      <span className="step-number">{done ? <Check size={14} /> : number}</span>
      <span>{label}</span>
    </div>
  );
}
function CameraIcon() {
  return (
    <span className="camera-icon">
      <span />
    </span>
  );
}

function Matches({
  lotId,
  draft,
  onBack,
  onSelect,
}: {
  lotId: string;
  draft: DraftLot;
  onBack: () => void;
  onSelect: () => void;
}) {
  const activeCategory =
    categories.find(item => item.name === draft.category) ?? categories[0];
  return (
    <div className="page-content matches-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          ← Edit lot
        </button>
        <div className="draft-status">
          <span className="green-dot" /> 3 matches found
        </div>
      </div>
      <div className="matches-header">
        <div>
          <div className="eyebrow green">SMART MATCHING · {lotId}</div>
          <h1>Your best formal route</h1>
          <p>
            {draft.weight.toFixed(1)} kg of {draft.category.toLowerCase()} ·{" "}
            {draft.location}
          </p>
        </div>
        <div className="match-confidence">
          <Sparkles size={16} />
          <span>Powered by transparent ranking</span>
        </div>
      </div>
      <div className="matches-layout">
        <div className="offer-list">
          <div className="list-intro">
            <span>RECOMMENDED RECYCLERS</span>
            <button>
              <SlidersHorizontal size={15} /> Filter
            </button>
          </div>
          {recyclers.map((recycler, index) => (
            <OfferCard
              key={recycler.code}
              recycler={recycler}
              rate={activeCategory.rate}
              weight={draft.weight}
              rank={index + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
        <div className="route-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">ROUTE PREVIEW</div>
              <h3>Less travel, more value</h3>
            </div>
            <MapPin size={18} className="panel-icon" />
          </div>
          <div className="map-canvas">
            <div className="map-grid" />
            <div className="map-road road-a" />
            <div className="map-road road-b" />
            <div className="map-road road-c" />
            <div className="map-pin pin-you">
              <span>YOU</span>
              <MapPin size={22} />
            </div>
            <div className="map-pin pin-recycler">
              <span>ECR</span>
              <Recycle size={22} />
            </div>
            <div className="map-route" />
            <div className="map-label label-you">Pimpri</div>
            <div className="map-label label-ecr">EcoCircuit</div>
          </div>
          <div className="route-stats">
            <div>
              <span>Nearest verified</span>
              <strong>4.8 km</strong>
            </div>
            <div>
              <span>Pickup window</span>
              <strong>24 hours</strong>
            </div>
            <div>
              <span>Offer above median</span>
              <strong>+8%</strong>
            </div>
          </div>
          <div className="route-note">
            <ShieldCheck size={16} />
            <span>
              Authorization details are shown from the current demo dataset.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfferCard({
  recycler,
  weight,
  rate,
  rank,
  onSelect,
}: {
  recycler: (typeof recyclers)[number];
  weight: number;
  rate: number;
  rank: number;
  onSelect: () => void;
}) {
  const quote = getRecyclerQuote(weight, rate, recycler.quoteMultiplier);
  return (
    <div className={rank === 1 ? "offer-card featured" : "offer-card"}>
      {rank === 1 && (
        <div className="recommended-ribbon">
          <Sparkles size={13} /> BEST PRACTICAL MATCH
        </div>
      )}
      <div className="offer-top">
        <div className={`recycler-logo ${recycler.accent}`}>
          <Recycle size={19} />
        </div>
        <div className="offer-title">
          <strong>{recycler.name}</strong>
          <span>
            {recycler.code} · {recycler.distance}
          </span>
        </div>
        <div className="match-score">{recycler.score}</div>
      </div>
      <div className="offer-middle">
        <div className="offer-quote">
          <span>Quoted value</span>
          <strong>₹{quote.toLocaleString("en-IN")}</strong>
          <em>
            based on {weight.toFixed(1)} kg × ₹{rate}/kg
          </em>
        </div>
        <div className="offer-details">
          <span>
            <Truck size={14} /> {recycler.time}
          </span>
          <span className={recycler.verified ? "verified" : "pending-verify"}>
            {recycler.verified ? (
              <ShieldCheck size={14} />
            ) : (
              <Clock3 size={14} />
            )}{" "}
            {recycler.verified ? "Authorized" : "Verify status"}
          </span>
        </div>
      </div>
      <div className="why-row">
        {recycler.why.map(reason => (
          <span key={reason}>
            <Check size={12} /> {reason}
          </span>
        ))}
      </div>
      <button
        className={rank === 1 ? "primary-button wide" : "secondary-button wide"}
        onClick={onSelect}
      >
        {rank === 1 ? "Choose this recycler" : "View offer"}{" "}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function LiveChat({
  role,
  messages,
  onClose,
  onSend,
}: {
  role: Role;
  messages: ChatMessage[];
  onClose: () => void;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  };

  return (
    <div className="live-chat-panel" role="dialog" aria-label="Live chat">
      <div className="live-chat-header">
        <div className="live-chat-title">
          <div className="live-chat-icon">
            <MessageCircle size={17} />
          </div>
          <div>
            <strong>Collector ↔ Recycler</strong>
            <span>
              <i /> Live negotiation chat
            </span>
          </div>
        </div>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close live chat"
        >
          <X size={18} />
        </button>
      </div>
      <div className="live-chat-context">
        <Recycle size={14} />
        <span>
          LOT-240902 · Laptop PCBs + cables · <strong>3.2 kg</strong>
        </span>
      </div>
      <div className="live-chat-messages" ref={messageListRef}>
        {messages.map(message => (
          <div
            className={
              message.sender === role
                ? "chat-message own"
                : "chat-message other"
            }
            key={message.id}
          >
            <span className="chat-sender">
              {message.sender === "collector"
                ? "Ramesh · Collector"
                : "Anjali · Recycler"}
            </span>
            <p>{message.text}</p>
            <time>{message.time}</time>
          </div>
        ))}
      </div>
      <div className="live-chat-composer">
        <textarea
          value={draft}
          onChange={event => setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              sendMessage();
            }
          }}
          placeholder={
            role === "collector"
              ? "Reply to the recycler..."
              : "Message the collector..."
          }
          rows={2}
          maxLength={500}
          aria-label="Chat message"
        />
        <button
          className="chat-send-button"
          onClick={sendMessage}
          disabled={!draft.trim()}
          aria-label="Send chat message"
        >
          <ArrowRight size={17} />
        </button>
      </div>
      <span className="chat-hint">
        Press Enter to send · Shift + Enter for a new line
      </span>
    </div>
  );
}

function RecyclerOfferPage({
  liveLots,
  onBack,
  onToast,
  onOfferSent,
}: {
  liveLots: LiveLot[];
  onBack: () => void;
  onToast: (message: string) => void;
  onOfferSent: (offer: OfferMessage) => void;
}) {
  const [offers, setOffers] = useState<Record<string, string>>({});
  const lots = [
    ...liveLots.map(lot => ({
      id: lot.id,
      title: lot.title,
      collector: lot.collector,
      weight: lot.weight,
      location: lot.location,
      suggestedPrice: lot.price,
    })),
    {
      id: "LOT-240902",
      title: "Laptop PCBs + cables",
      collector: "Ramesh K.",
      weight: "3.2 kg",
      location: "Pimpri · 4.8 km away",
      suggestedPrice: "₹1,410",
    },
    {
      id: "LOT-240901",
      title: "Mixed batteries",
      collector: "Meena S.",
      weight: "8.4 kg",
      location: "Bhosari · 6.1 km away",
      suggestedPrice: "₹1,386",
    },
    {
      id: "LOT-240899",
      title: "LCD panels",
      collector: "Salim A.",
      weight: "12 kg",
      location: "Akurdi · 9.2 km away",
      suggestedPrice: "₹1,140",
    },
  ];
  return (
    <div className="page-content recycler-offer-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          ← Back to overview
        </button>
        <div className="draft-status">
          <span className="green-dot" /> Offer desk ready
        </div>
      </div>
      <div className="page-title-row">
        <div>
          <div className="eyebrow green">RECYCLER WORKSPACE</div>
          <h1>Apply an offer to a material lot.</h1>
          <p>
            Review incoming lots, set your price, and send a traceable offer to
            the collector.
          </p>
        </div>
      </div>
      <div className="recycler-offer-list">
        {lots.map(lot => (
          <div className="recycler-offer-card" key={lot.id}>
            <div>
              <div className="eyebrow">INCOMING LOT</div>
              <h3>{lot.title}</h3>
              <p>
                {lot.id} · {lot.collector} · {lot.weight}
              </p>
              <span>{lot.location}</span>
            </div>
            <div className="offer-entry">
              <label>
                Your offer
                <input
                  inputMode="numeric"
                  placeholder={lot.suggestedPrice.replace(/[^\d]/g, "")}
                  value={offers[lot.id] ?? ""}
                  onChange={event =>
                    setOffers(current => ({
                      ...current,
                      [lot.id]: event.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
                <span className="offer-suggestion">
                  Suggested starting price: {lot.suggestedPrice}
                </span>
              </label>
              <button
                className="primary-button"
                onClick={() => {
                  const amount = offers[lot.id];
                  if (!amount || Number(amount) <= 0) {
                    onToast("Enter a valid offer amount before sending");
                    return;
                  }
                  onOfferSent({
                    type: "offer",
                    offerId: `${lot.id}-${Date.now()}`,
                    lotId: lot.id,
                    material: lot.title,
                    collector: lot.collector,
                    weight: lot.weight,
                    amount: Number(amount),
                    location: lot.location,
                  });
                  onToast(
                    `Offer of ₹${Number(amount).toLocaleString("en-IN")} sent for ${lot.id}`
                  );
                }}
              >
                Send offer <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OfferInbox({
  offer,
  onAccept,
  onRenegotiate,
}: {
  offer: OfferMessage;
  onAccept: (offer: OfferMessage) => void;
  onRenegotiate: (offer: OfferMessage, amount: number) => void;
}) {
  const renegotiate = () => {
    const input = window.prompt(
      `Enter your counter-offer for ${offer.lotId}`,
      String(offer.amount)
    );
    if (input === null) return;
    const amount = Number(input.replace(/[^\d]/g, ""));
    if (amount > 0) onRenegotiate(offer, amount);
  };
  return (
    <div className="offer-inbox-backdrop" role="presentation">
      <section
        className="offer-inbox"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-inbox-title"
      >
        <div className="eyebrow green">NEW RECYCLER OFFER</div>
        <h2 id="offer-inbox-title">Offer received for {offer.lotId}</h2>
        <p>
          {offer.material} · {offer.weight} · {offer.location}
        </p>
        <strong className="offer-inbox-amount">
          ₹{offer.amount.toLocaleString("en-IN")}
        </strong>
        <div className="offer-inbox-actions">
          <button className="ghost-button" onClick={renegotiate}>
            Renegotiate
          </button>
          <button className="primary-button" onClick={() => onAccept(offer)}>
            Accept offer
          </button>
        </div>
      </section>
    </div>
  );
}

function PriceBoard({
  onBack,
  recyclerMode = false,
  onToast,
}: {
  onBack: () => void;
  recyclerMode?: boolean;
  onToast?: (message: string) => void;
}) {
  const { language } = useI18n();
  const c = pageCopy[language];
  const [updatedAt, setUpdatedAt] = useState("Updated today · Pimpri, Pune");
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
  const refreshPrices = () => {
    setUpdatedAt(
      `Updated just now · ${recyclerMode ? "Recycler desk" : "Pimpri, Pune"}`
    );
    onToast?.("Price board refreshed with the latest local rates");
  };
  return (
    <div className="page-content prices-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          {c.back}
        </button>
        <div className="draft-status">
          <span className="green-dot" /> {updatedAt}
        </div>
      </div>
      <div className="page-title-row">
        <div>
          <div className="eyebrow green">{c.priceKicker}</div>
          <h1>{c.priceTitle}</h1>
          <p>{c.priceSub}</p>
        </div>
        <button className="ghost-button" onClick={refreshPrices}>
          <RefreshCcw size={16} /> {c.refresh}
        </button>
      </div>
      <div className="price-highlight">
        <div className="highlight-icon">
          <CircleDollarSign size={23} />
        </div>
        <div>
          <strong>{c.transparency}</strong>
          <span>{c.compare}</span>
        </div>
        <div className="highlight-stat">
          <span>{c.median}</span>
          <strong>₹280/kg</strong>
          <ArrowUpRight size={15} />
        </div>
      </div>
      <div className="price-table">
        <div className="price-table-head">
          <span>{c.material}</span>
          <span>{c.range}</span>
          <span>{c.trend}</span>
          <span>{c.observed}</span>
          <span />
        </div>
        {categories.map((item, index) => (
          <div
            className={
              selectedMaterial === item.name
                ? "price-row selected"
                : "price-row"
            }
            key={item.name}
            onClick={() => {
              setSelectedMaterial(item.name);
              onToast?.(
                `${item.name} selected — use this rate when applying an offer`
              );
            }}
            role="button"
            tabIndex={0}
            onKeyDown={event => {
              if (event.key === "Enter" || event.key === " ") {
                setSelectedMaterial(item.name);
              }
            }}
          >
            <div className="price-material">
              <div className={`category-glyph mini ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <strong>{item.name}</strong>
                <span>{item.sub}</span>
              </div>
            </div>
            <div className="price-range">
              <strong>
                ₹{Math.round(item.rate * 0.92)} — ₹
                {Math.round(item.rate * 1.08)}
              </strong>
              <span>{c.indicative}</span>
            </div>
            <div className="trend">
              <div className="spark-bars">
                {[36, 44, 30, 48, 42, index % 2 ? 52 : 58].map((height, i) => (
                  <span
                    key={i}
                    style={{ height: `${height}%` }}
                    className={i === 5 ? "current" : ""}
                  />
                ))}
              </div>
              <span className={index === 1 ? "trend-down" : "trend-up"}>
                {index === 1 ? (
                  <ArrowDownRight size={13} />
                ) : (
                  <ArrowUpRight size={13} />
                )}{" "}
                {index === 1 ? "2.4%" : `${(index + 1) * 1.6}%`}
              </span>
            </div>
            <div className="observed">
              <span>{index < 2 ? c.today : c.yesterday}</span>
              <small>{c.fieldQuote}</small>
            </div>
            <ChevronRight size={16} className="row-chevron" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Activity({
  transactions,
  onBack,
}: {
  transactions: Transaction[];
  onBack: () => void;
}) {
  const { language } = useI18n();
  const c = pageCopy[language];
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Transaction["status"]
  >("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return transactions.filter(item => {
      const dateParts = item.date.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
      const monthIndex = dateParts
        ? [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].indexOf(dateParts[2])
        : -1;
      const itemDateKey =
        dateParts && monthIndex >= 0
          ? `${dateParts[3]}-${String(monthIndex + 1).padStart(2, "0")}-${dateParts[1].padStart(2, "0")}`
          : "";
      const matchesSearch =
        !query ||
        [item.id, item.material].join(" ").toLowerCase().includes(query);
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesDateFrom = !dateFrom || itemDateKey >= dateFrom;
      const matchesDateTo = !dateTo || itemDateKey <= dateTo;
      return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [dateFrom, dateTo, searchQuery, statusFilter, transactions]);

  const exportRecords = () => {
    const headers = ["Lot ID", "Material", "Weight", "Date", "Value", "Status"];
    const rows = filteredTransactions.map(item => [
      item.id,
      item.material,
      item.weight,
      item.date,
      item.amount,
      item.status,
    ]);
    const csv = [headers, ...rows]
      .map(row => row.map(value => `"${value.replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kabadiwala-ledger.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-content activity-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          {c.back}
        </button>
        <div className="draft-status">
          <span className="green-dot" /> {c.ledgerSynced}
        </div>
      </div>
      <div className="page-title-row">
        <div>
          <div className="eyebrow green">{c.ledgerKicker}</div>
          <h1>{c.ledgerTitle}</h1>
          <p>{c.ledgerSub}</p>
        </div>
        <button className="secondary-button" onClick={exportRecords}>
          <Upload size={16} /> {c.exportRecord}
        </button>
      </div>
      <div className="ledger-summary">
        <div>
          <span>Total earned · Aug 2026</span>
          <strong>₹4,188</strong>
          <small>
            <ArrowUpRight size={13} /> 18.6% vs previous month
          </small>
        </div>
        <div>
          <span>Pending dues</span>
          <strong>₹660</strong>
          <small className="pending-copy">
            <Clock3 size={13} /> Due after handover
          </small>
        </div>
        <div>
          <span>Lots formalized</span>
          <strong>12</strong>
          <small>
            <PackageCheck size={13} /> 14.8 kg diverted
          </small>
        </div>
      </div>
      <div className="ledger-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">{c.history}</div>
            <h3>{c.handovers}</h3>
          </div>
          <div className="ledger-tools">
            <button
              className={searchOpen ? "active" : ""}
              onClick={() => setSearchOpen(open => !open)}
              aria-expanded={searchOpen}
            >
              <Search size={15} /> {c.search}
            </button>
            <button
              className={filterOpen ? "active" : ""}
              onClick={() => setFilterOpen(open => !open)}
              aria-expanded={filterOpen}
            >
              <SlidersHorizontal size={15} /> {c.filter}
            </button>
          </div>
        </div>
        {(searchOpen || filterOpen) && (
          <div className="ledger-controls">
            {searchOpen && (
              <label>
                <span className="sr-only">{c.search}</span>
                <Search size={15} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  placeholder="Material name or LOT ID..."
                  aria-label="Search material name or LOT ID"
                />
              </label>
            )}
            {filterOpen && (
              <>
                <label>
                  <span>{c.status}</span>
                  <select
                    value={statusFilter}
                    onChange={event =>
                      setStatusFilter(
                        event.target.value as "all" | Transaction["status"]
                      )
                    }
                  >
                    <option value="all">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </label>
                <label>
                  <span>From date</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={event => setDateFrom(event.target.value)}
                    aria-label="Filter from date"
                  />
                </label>
                <label>
                  <span>To date</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={event => setDateTo(event.target.value)}
                    aria-label="Filter to date"
                  />
                </label>
              </>
            )}
          </div>
        )}
        <div className="ledger-table">
          <div className="ledger-head">
            <span>{c.lotMaterial}</span>
            <span>{c.weight}</span>
            <span>{c.date}</span>
            <span>{c.value}</span>
            <span>{c.status}</span>
          </div>
          {filteredTransactions.map(item => (
            <div className="ledger-row" key={item.id}>
              <div className="ledger-material">
                <MaterialGlyph type={item.icon} />
                <div>
                  <strong>{item.material}</strong>
                  <span>{item.id}</span>
                </div>
              </div>
              <span>{item.weight}</span>
              <span>{item.date}</span>
              <strong>{item.amount}</strong>
              <span
                className={
                  item.status === "Paid" ? "status paid" : "status pending"
                }
              >
                {item.status}
              </span>
            </div>
          ))}
          {filteredTransactions.length === 0 && (
            <div className="ledger-empty">No matching handovers found.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function DataHub({
  onBack,
  onToast,
  fieldData,
  recyclerMode = false,
}: {
  onBack: () => void;
  onToast: (message: string) => void;
  recyclerMode?: boolean;
  fieldData?: {
    collectors: unknown[];
    lots: unknown[];
    prices: unknown[];
    recyclers: unknown[];
  };
}) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showModelCard, setShowModelCard] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(
    () =>
      window.localStorage.getItem("kabadiwala-field-notes") ??
      "Validate material classification and final weight at handover."
  );
  const { language } = useI18n();
  const c = pageCopy[language];
  const exportFieldData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      workspace: recyclerMode ? "recycler" : "collector",
      summary: {
        collectors: fieldData?.collectors.length ?? 0,
        lots: fieldData?.lots.length ?? 0,
        prices: fieldData?.prices.length ?? 0,
        recyclers: fieldData?.recyclers.length ?? 0,
      },
      data: fieldData ?? null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kabadiwala-field-data.json";
    link.click();
    URL.revokeObjectURL(url);
    onToast("Field data exported successfully");
  };
  const saveNotes = () => {
    window.localStorage.setItem("kabadiwala-field-notes", notes);
    setShowNotes(false);
    onToast("Field notes saved");
  };
  const tabs = [
    { id: "overview", label: c.evidence, icon: <ClipboardCheck size={15} /> },
    { id: "datasets", label: c.datasets, icon: <Database size={15} /> },
    { id: "economics", label: c.economics, icon: <TrendingUp size={15} /> },
  ];
  return (
    <div className="page-content data-page">
      <div className="back-row">
        <button className="back-button" onClick={onBack}>
          {c.back}
        </button>
        <div className="draft-status">
          <span className="green-dot" /> {c.pilotStatus}
        </div>
      </div>
      <section className="data-header">
        <div>
          <div className="eyebrow green">
            {recyclerMode ? "RECYCLER INTELLIGENCE" : c.dataKicker}
          </div>
          <h1>
            {recyclerMode ? "Make every intake measurable." : c.dataTitle}
          </h1>
          <p>
            {recyclerMode
              ? "Track incoming lots, pricing evidence, and handover completeness in one field dataset."
              : c.dataSub}
          </p>
        </div>
        <button className="primary-button" onClick={exportFieldData}>
          <Upload size={15} /> {c.exportPack}
        </button>
      </section>
      {recyclerMode && (
        <div className="recycler-data-strip">
          <StatCard
            label="Lots in dataset"
            value={String(fieldData?.lots.length ?? 0)}
            change="Live"
            detail="traceable material records"
            icon={<Database size={19} />}
            tone="green"
          />
          <StatCard
            label="Price observations"
            value={String(fieldData?.prices.length ?? 0)}
            change="Current"
            detail="local rate signals"
            icon={<CircleDollarSign size={19} />}
            tone="amber"
          />
          <StatCard
            label="Recycler partners"
            value={String(fieldData?.recyclers.length ?? 0)}
            change="Verified"
            detail="available for routing"
            icon={<Store size={19} />}
            tone="blue"
          />
          <StatCard
            label="Evidence coverage"
            value="96%"
            change="On target"
            detail="complete handover records"
            icon={<FileCheck2 size={19} />}
            tone="violet"
          />
        </div>
      )}
      <div className="data-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "data-tab active" : "data-tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "overview" && (
        <>
          <div className="evidence-grid">
            <DataMetric
              icon={<Database size={19} />}
              value="6"
              label={c.structuredDatasets}
              detail="material · price · recycler · transaction · traceability · collector"
              tone="green"
            />
            <DataMetric
              icon={<ShieldCheck size={19} />}
              value="96%"
              label={c.traceabilityCoverage}
              detail={`${fieldData?.lots.length ?? 0} persisted lots currently in the database`}
              tone="blue"
            />
            <DataMetric
              icon={<Sparkles size={19} />}
              value="3"
              label={c.aiAssists}
              detail="classification · valuation · anomaly flags"
              tone="amber"
            />
            <DataMetric
              icon={<WalletCards size={19} />}
              value="₹612"
              label={c.collectorUplift}
              detail="illustrative formal-route uplift per lot"
              tone="violet"
            />
          </div>
          <div className="data-grid">
            <div className="section-panel dataset-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">{c.dataLineage}</div>
                  <h3>{c.lineageTitle}</h3>
                </div>
                <Database size={18} className="green-icon" />
              </div>
              <div className="lineage-list">
                <LineageRow
                  step="01"
                  title={c.capture}
                  detail="Photo, material category, approximate weight, condition, source and GPS"
                  status={c.collected}
                />
                <LineageRow
                  step="02"
                  title={c.price}
                  detail="Dated local buying range, recycler quote and anomaly check"
                  status={c.validated}
                />
                <LineageRow
                  step="03"
                  title={c.match}
                  detail="Authorized status, accepted material, service area and pickup"
                  status={c.ranked}
                />
                <LineageRow
                  step="04"
                  title={c.handover}
                  detail="OTP, timestamp, photo, weight, GPS and recycler confirmation"
                  status={c.traceable}
                />
              </div>
            </div>
            <div className="section-panel model-panel">
              <div className="panel-heading">
                <div>
                  <div className="eyebrow">{c.aiReadiness}</div>
                  <h3>{c.automationTitle}</h3>
                </div>
                <Sparkles size={18} className="green-icon" />
              </div>
              <div className="model-card">
                <div className="model-top">
                  <span className="model-dot ready" />
                  <strong>{c.materialClassifier}</strong>
                  <span>Demo-ready</span>
                </div>
                <p>
                  Image + collector correction suggests PCBs, cables, batteries,
                  LCDs, motors or mixed plastic.
                </p>
              </div>
              <div className="model-card">
                <div className="model-top">
                  <span className="model-dot ready" />
                  <strong>{c.fairValue}</strong>
                  <span>Rule + trend</span>
                </div>
                <p>
                  Weight × local rate × condition band, with a transparent range
                  instead of a false exact price.
                </p>
              </div>
              <div className="model-card">
                <div className="model-top">
                  <span className="model-dot watch" />
                  <strong>{c.abnormalFlag}</strong>
                  <span>Needs data</span>
                </div>
                <p>
                  Flags quotes outside the local range before acceptance; train
                  after 200+ verified transactions.
                </p>
              </div>
              <button
                className="text-button"
                onClick={() => setShowModelCard(true)}
              >
                {c.viewModel} <ArrowUpRight size={15} />
              </button>
            </div>
          </div>
          <div className="field-callout">
            <div className="callout-icon">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <strong>{c.fieldCheckpoint}</strong>
              <span>
                Two working collectors / aggregators were used to validate the
                core flow: photo → price → recycler → receipt.
              </span>
            </div>
            <button
              className="secondary-button"
              onClick={() => setShowNotes(true)}
            >
              {c.openNotes}
            </button>
          </div>
        </>
      )}
      {activeTab === "datasets" && <DatasetTable onToast={onToast} />}
      {activeTab === "economics" && <UnitEconomics />}
      {showModelCard && (
        <div className="data-dialog-backdrop" role="presentation">
          <section
            className="data-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-card-title"
          >
            <div className="panel-heading">
              <div>
                <div className="eyebrow green">MODEL CARD</div>
                <h3 id="model-card-title">Field intelligence models</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowModelCard(false)}
                aria-label="Close model card"
              >
                <X size={17} />
              </button>
            </div>
            <div className="data-dialog-content">
              <strong>Material classifier</strong>
              <p>
                Suggests PCBs, cables, batteries, LCDs, motors, or mixed plastic
                from a photo and collector correction.
              </p>
              <strong>Fair-value estimator</strong>
              <p>
                Uses weight, local buying rate, condition band, and recent trend
                to return a transparent range.
              </p>
              <strong>Abnormal-quote flag</strong>
              <p>
                Flags offers outside the local range for human review. It
                requires 200+ verified transactions for training.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={() => setShowModelCard(false)}
            >
              Done
            </button>
          </section>
        </div>
      )}
      {showNotes && (
        <div className="data-dialog-backdrop" role="presentation">
          <section
            className="data-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notes-title"
          >
            <div className="panel-heading">
              <div>
                <div className="eyebrow green">FIELD NOTES</div>
                <h3 id="notes-title">Validation notes</h3>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowNotes(false)}
                aria-label="Close notes"
              >
                <X size={17} />
              </button>
            </div>
            <textarea
              className="data-notes-input"
              value={notes}
              onChange={event => setNotes(event.target.value)}
              rows={6}
              aria-label="Field validation notes"
            />
            <div className="data-dialog-actions">
              <button
                className="ghost-button"
                onClick={() => setShowNotes(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={saveNotes}>
                Save notes
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DataMetric({
  icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  detail: string;
  tone: string;
}) {
  return (
    <div className={`data-metric ${tone}`}>
      <div className="data-metric-icon">{icon}</div>
      <div className="data-metric-value">{value}</div>
      <strong>{label}</strong>
      <span>{detail}</span>
    </div>
  );
}
function LineageRow({
  step,
  title,
  detail,
  status,
}: {
  step: string;
  title: string;
  detail: string;
  status: string;
}) {
  return (
    <div className="lineage-row">
      <span className="lineage-step">{step}</span>
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <b>{status}</b>
    </div>
  );
}
function DatasetTable({ onToast }: { onToast: (message: string) => void }) {
  const rows = [
    {
      name: "Material dataset",
      count: "124 lots",
      fresh: "2 min ago",
      fields: "category · condition · image · weight",
    },
    {
      name: "Price dataset",
      count: "486 quotes",
      fresh: "Today",
      fields: "location · date · buy / sell rate",
    },
    {
      name: "Recycler dataset",
      count: "18 facilities",
      fresh: "Yesterday",
      fields: "authorization · rates · service area",
    },
    {
      name: "Traceability dataset",
      count: "40 handovers",
      fresh: "Live",
      fields: "GPS · photo · OTP · confirmation",
    },
  ];
  return (
    <div className="dataset-view">
      <div className="dataset-summary">
        <div>
          <span>Rows generated by field operations</span>
          <strong>692</strong>
        </div>
        <div>
          <span>Last validation run</span>
          <strong>04 Sep · 17:28</strong>
        </div>
        <div>
          <span>Sync queue</span>
          <strong>01 pending</strong>
        </div>
      </div>
      <div className="section-panel dataset-table-panel">
        <div className="panel-heading">
          <div>
            <div className="eyebrow">STRUCTURED DATASETS</div>
            <h3>Created by the product, not a static spreadsheet.</h3>
          </div>
          <button
            className="secondary-button"
            onClick={() => onToast("Dataset schema copied")}
          >
            Copy schema
          </button>
        </div>
        <div className="dataset-table">
          <div className="dataset-head">
            <span>DATASET</span>
            <span>VOLUME</span>
            <span>LAST UPDATED</span>
            <span>KEY FIELDS</span>
            <span />
          </div>
          {rows.map(row => (
            <div className="dataset-row" key={row.name}>
              <div className="dataset-name">
                <div className="dataset-row-icon">
                  <Database size={15} />
                </div>
                <strong>{row.name}</strong>
              </div>
              <strong>{row.count}</strong>
              <span className="fresh-status">
                <span className="green-dot" /> {row.fresh}
              </span>
              <span className="dataset-fields">{row.fields}</span>
              <ChevronRight size={15} className="row-chevron" />
            </div>
          ))}
        </div>
      </div>
      <div className="privacy-note">
        <ShieldCheck size={16} />
        <span>
          Privacy by design: collector records use a minimal ID, preferred
          language and operating area — no unnecessary personal information.
        </span>
      </div>
    </div>
  );
}
function UnitEconomics() {
  return (
    <div className="economics-view">
      <div className="economics-hero">
        <div>
          <div className="eyebrow amber-text">
            DEMO UNIT ECONOMICS · PER 10 KG LOT
          </div>
          <h2>Formal should pay more by making trust visible.</h2>
          <p>
            Illustrative field-pilot comparison. Replace with validated local
            numbers after two weeks of transactions.
          </p>
        </div>
        <div className="uplift-badge">
          <ArrowUpRight size={16} />
          <strong>+22%</strong>
          <span>collector take-home</span>
        </div>
      </div>
      <div className="economics-grid">
        <div className="section-panel econ-card">
          <div className="eyebrow">COLLECTOR OUTCOME</div>
          <h3>Where the uplift comes from</h3>
          <div className="econ-line">
            <span>Informal route</span>
            <strong>₹2,760</strong>
            <i className="bar informal" />
          </div>
          <div className="econ-line">
            <span>Formal route</span>
            <strong>₹3,372</strong>
            <i className="bar formal" />
          </div>
          <div className="econ-breakdown">
            <div>
              <span>Price transparency</span>
              <strong>+₹280</strong>
            </div>
            <div>
              <span>Verified pickup</span>
              <strong>+₹192</strong>
            </div>
            <div>
              <span>Receipt / payment proof</span>
              <strong>+₹140</strong>
            </div>
          </div>
        </div>
        <div className="section-panel econ-card">
          <div className="eyebrow">PLATFORM SUSTAINABILITY</div>
          <h3>Lightweight operating model</h3>
          <div className="sustain-row">
            <span>Recycler success fee</span>
            <strong>1.5%</strong>
          </div>
          <div className="sustain-row">
            <span>Average fee on ₹3,372 lot</span>
            <strong>₹51</strong>
          </div>
          <div className="sustain-row">
            <span>Field support cost target</span>
            <strong>₹24</strong>
          </div>
          <div className="sustain-surplus">
            <span>Contribution / lot</span>
            <strong>₹27</strong>
            <small>
              Reinvest into onboarding, safety and sync reliability.
            </small>
          </div>
        </div>
      </div>
      <div className="assumption-note">
        <CircleDollarSign size={16} />
        <span>
          Assumptions are clearly labelled for judging: no collector fee, cash
          remains supported, digital payment is optional, and the platform earns
          only after a successful recycler handover.
        </span>
      </div>
    </div>
  );
}

function RecyclerConsole({
  onToast,
  onOpenChat,
  liveLots,
  userName,
}: {
  onToast: (message: string) => void;
  onOpenChat: () => void;
  liveLots: LiveLot[];
  userName?: string;
}) {
  const [activeTab, setActiveTab] = useState("incoming");
  const [accepted, setAccepted] = useState(false);
  const [messageLot, setMessageLot] = useState<{
    id: string;
    collector: string;
    weight: string;
  } | null>(null);
  return (
    <div className="page-content recycler-page">
      <section className="recycler-welcome">
        <div>
          <div className="eyebrow green">
            RECYCLER CONSOLE · ECOCIRCUIT RECYCLING
          </div>
          <h1>
            {["Good morning", userName?.trim()].filter(Boolean).join(", ")}.
          </h1>
          <p>Keep verified material moving through the formal chain.</p>
        </div>
        <div className="recycler-actions">
          <button className="ghost-button" onClick={onOpenChat}>
            <MessageCircle size={16} /> Live chat
          </button>
          <button
            className="ghost-button"
            onClick={() => onToast("Recycler report export queued")}
          >
            {" "}
            <BarChart3 size={16} /> Monthly report
          </button>
          <button
            className="primary-button"
            onClick={() => onToast("Add facility flow coming soon")}
          >
            {" "}
            <Plus size={17} /> Add facility
          </button>
        </div>
      </section>
      <div className="recycler-kpis">
        <StatCard
          label="Open lots"
          value="08"
          change="+3 today"
          detail="awaiting a quote"
          icon={<PackagePlus size={19} />}
          tone="green"
        />
        <StatCard
          label="This month intake"
          value="184 kg"
          change="+12.4%"
          detail="vs. last month"
          icon={<Recycle size={19} />}
          tone="amber"
        />
        <StatCard
          label="Traceability rate"
          value="96%"
          change="On target"
          detail="handover records complete"
          icon={<FileCheck2 size={19} />}
          tone="blue"
        />
        <StatCard
          label="Avg. response time"
          value="2.4h"
          change="-38 min"
          detail="faster this week"
          icon={<Clock3 size={19} />}
          tone="violet"
        />
      </div>
      <div className="recycler-content-grid">
        <div className="section-panel incoming-panel">
          <div className="tab-row">
            {[
              { id: "incoming", label: "Incoming lots", count: "08" },
              { id: "active", label: "Active handovers", count: "03" },
              { id: "complete", label: "Completed", count: "42" },
            ].map(tab => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "tab active" : "tab"}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                <span>{tab.count}</span>
              </button>
            ))}
          </div>
          {activeTab === "incoming" && (
            <div className="incoming-list">
              {liveLots.map(lot => (
                <RecyclerLot
                  key={lot.id}
                  title={lot.title}
                  id={lot.id}
                  collector={`${lot.collector} · ${lot.weight}`}
                  location={lot.location}
                  price={lot.price}
                  urgent
                  onAccept={() =>
                    onToast(`Offer accepted — ${lot.id} collector notified`)
                  }
                  onMessage={() =>
                    setMessageLot({
                      id: lot.id,
                      collector: lot.collector,
                      weight: lot.weight,
                    })
                  }
                />
              ))}
              <RecyclerLot
                title="Laptop PCBs + cables"
                id="LOT-240902"
                collector="Ramesh K. · 3.2 kg"
                location="Pimpri · 4.8 km away"
                price="₹1,410"
                urgent
                onAccept={() => {
                  setAccepted(true);
                  onToast("Offer accepted — collector notified");
                }}
                onMessage={() =>
                  setMessageLot({
                    id: "LOT-240902",
                    collector: "Ramesh K.",
                    weight: "3.2 kg",
                  })
                }
                accepted={accepted}
              />
              <RecyclerLot
                title="Mixed batteries"
                id="LOT-240901"
                collector="Meena S. · 8.4 kg"
                location="Bhosari · 6.1 km away"
                price="₹1,386"
                onAccept={() => onToast("Offer sent to Meena S.")}
                onMessage={() =>
                  setMessageLot({
                    id: "LOT-240901",
                    collector: "Meena S.",
                    weight: "8.4 kg",
                  })
                }
              />
              <RecyclerLot
                title="LCD panels"
                id="LOT-240899"
                collector="Salim A. · 12 kg"
                location="Akurdi · 9.2 km away"
                price="₹1,140"
                onAccept={() => onToast("Offer sent to Salim A.")}
                onMessage={() =>
                  setMessageLot({
                    id: "LOT-240899",
                    collector: "Salim A.",
                    weight: "12 kg",
                  })
                }
              />
            </div>
          )}
          {activeTab !== "incoming" && (
            <div className="empty-tab">
              <CheckCircle2 size={25} />
              <strong>
                {activeTab === "active"
                  ? "3 active handovers"
                  : "42 completed this month"}
              </strong>
              <span>
                All records are available in your traceability export.
              </span>
            </div>
          )}
        </div>
        <div className="section-panel compliance-panel">
          <div className="panel-heading">
            <div>
              <div className="eyebrow">COMPLIANCE SNAPSHOT</div>
              <h3>Traceability health</h3>
            </div>
            <ShieldCheck size={18} className="green-icon" />
          </div>
          <div className="compliance-score">
            <div className="score-ring">
              <span>96</span>
              <small>%</small>
            </div>
            <div>
              <strong>Strong record coverage</strong>
              <p>38 of 40 recent lots have complete handover evidence.</p>
            </div>
          </div>
          <div className="compliance-row">
            <span>Photo evidence</span>
            <strong>100%</strong>
            <div>
              <i style={{ width: "100%" }} />
            </div>
          </div>
          <div className="compliance-row">
            <span>Weight recorded</span>
            <strong>98%</strong>
            <div>
              <i style={{ width: "98%" }} />
            </div>
          </div>
          <div className="compliance-row">
            <span>Final payment</span>
            <strong>90%</strong>
            <div>
              <i style={{ width: "90%" }} />
            </div>
          </div>
          <button
            className="text-button"
            onClick={() => onToast("Compliance export queued")}
          >
            Open traceability export <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
      {messageLot && (
        <WeightNegotiationModal
          lot={messageLot}
          onClose={() => setMessageLot(null)}
          onSend={message => {
            setMessageLot(null);
            onToast(`Message sent to ${messageLot.collector}`);
            void message;
          }}
        />
      )}
    </div>
  );
}

function RecyclerLot({
  title,
  id,
  collector,
  location,
  price,
  urgent,
  onAccept,
  onMessage,
  accepted,
}: {
  title: string;
  id: string;
  collector: string;
  location: string;
  price: string;
  urgent?: boolean;
  onAccept: () => void;
  onMessage: () => void;
  accepted?: boolean;
}) {
  return (
    <div className={urgent ? "recycler-lot urgent" : "recycler-lot"}>
      <div className="lot-material-icon">
        <Recycle size={18} />
      </div>
      <div className="lot-main">
        <div className="lot-title-row">
          <strong>{title}</strong>
          {urgent && (
            <span className="urgent-tag">
              <Zap size={11} /> New
            </span>
          )}
        </div>
        <span>
          {id} · {collector}
        </span>
        <span>
          <MapPin size={13} /> {location}
        </span>
      </div>
      <div className="lot-offer">
        <span>Expected value</span>
        <strong>{price}</strong>
        <button
          className={accepted ? "accepted-button" : "secondary-button"}
          onClick={onAccept}
        >
          {accepted ? (
            <>
              <Check size={14} /> Accepted
            </>
          ) : (
            "Make offer"
          )}
        </button>
        <button
          className="message-button"
          onClick={onMessage}
          aria-label={`Message ${collector.split(" · ")[0]} about recyclable weight`}
        >
          <MessageCircle size={13} /> Message collector
        </button>
      </div>
    </div>
  );
}

function WeightNegotiationModal({
  lot,
  onClose,
  onSend,
}: {
  lot: { id: string; collector: string; weight: string };
  onClose: () => void;
  onSend: (message: string) => void;
}) {
  const [proposedWeight, setProposedWeight] = useState(
    Number.parseFloat(lot.weight)
  );
  const [message, setMessage] = useState(
    `Could we recheck the recyclable weight for ${lot.id}? I have a proposed weight of ${lot.weight}.`
  );

  return (
    <div className="modal-backdrop">
      <div className="message-modal">
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close message dialog"
        >
          <X size={18} />
        </button>
        <div className="modal-kicker">
          <MessageCircle size={16} /> WEIGHT NEGOTIATION
        </div>
        <h2>Message {lot.collector}</h2>
        <p>
          Discuss the recyclable weight before you finalize the offer for{" "}
          <strong>{lot.id}</strong>.
        </p>
        <label className="message-field-label" htmlFor="proposed-weight">
          Proposed recyclable weight
        </label>
        <div className="proposed-weight-input">
          <input
            id="proposed-weight"
            type="number"
            min="0.1"
            step="0.1"
            value={proposedWeight}
            onChange={event => setProposedWeight(Number(event.target.value))}
          />
          <span>kg</span>
        </div>
        <label className="message-field-label" htmlFor="collector-message">
          Message
        </label>
        <textarea
          id="collector-message"
          className="message-textarea"
          value={message}
          onChange={event => setMessage(event.target.value)}
          rows={4}
          maxLength={500}
        />
        <div className="message-modal-actions">
          <button className="ghost-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="primary-button"
            disabled={
              !message.trim() ||
              !Number.isFinite(proposedWeight) ||
              proposedWeight <= 0
            }
            onClick={() =>
              onSend(
                `${message.trim()} Proposed weight: ${proposedWeight.toFixed(1)} kg.`
              )
            }
          >
            <MessageCircle size={15} /> Send message
          </button>
        </div>
      </div>
    </div>
  );
}

function HandoverModal({
  lotId,
  lot,
  onClose,
  onConfirm,
}: {
  lotId: string;
  lot: DraftLot;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleCreateReceipt = () => {
    setIsSubmitted(true);
    onConfirm();
  };

  return (
    <div className="modal-backdrop">
      <div className="handover-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        {!isSubmitted ? (
          <>
            <div className="modal-kicker">
              <FileCheck2 size={16} /> FINAL STEP / VERIFIED HANDOVER
            </div>
            <h2>Confirm your handover</h2>
            <p>
              Your lot has been created successfully. A respected authenticator
              will contact you as soon as possible.
            </p>
            <div className="handover-summary">
              <div>
                <span>Lot</span>
                <strong>{lotId}</strong>
              </div>
              <div>
                <span>Material</span>
                <strong>{lot.category}</strong>
              </div>
              <div>
                <span>Weight</span>
                <strong>{lot.weight.toFixed(1)} kg</strong>
              </div>
              <div>
                <span>Quoted value</span>
                <strong>₹1,410</strong>
              </div>
            </div>
            <div className="otp-card">
              <div className="otp-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <strong>Your handover code</strong>
                <span>Show this code to the recycler at pickup.</span>
              </div>
              <b>482 906</b>
            </div>
            <div className="modal-check">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={event => setTermsAccepted(event.target.checked)}
              />
              <span>
                I confirm the lot details are approximate and the final value
                will be recorded at handover.
              </span>
            </div>
            <button
              className="primary-button wide"
              disabled={!termsAccepted}
              onClick={handleCreateReceipt}
            >
              Confirm & create receipt <ArrowRight size={16} />
            </button>
            <div className="modal-safe">
              <WifiOff size={14} /> This proof is saved offline first.
            </div>
          </>
        ) : (
          <div className="confirmed-state">
            <div className="success-mark">
              <Check size={28} />
            </div>
            <div className="modal-kicker">HANDOVER CONFIRMED</div>
            <h2>Lot created.</h2>
            <p>
              Your lot has been successfully created. A respected authenticator
              will contact you as soon as possible.
            </p>
            <div className="receipt-code">KC-{lotId}</div>
            <button className="primary-button wide" onClick={onClose}>
              Go to my ledger <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VoiceModal({
  language,
  onClose,
}: {
  language: Language;
  onClose: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<
    SpeechSynthesisVoice[]
  >([]);
  const voiceText = voiceGuideCopy[language].text;
  const voiceLanguage =
    language === "EN" ? "en-IN" : language === "हिंदी" ? "hi-IN" : "mr-IN";

  useEffect(() => {
    const loadVoices = () => {
      setAvailableVoices(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  const selectVoice = (voices: SpeechSynthesisVoice[]) => {
    const languagePrefix = voiceLanguage.slice(0, 2).toLowerCase();
    const languageVoices = voices.filter(voice =>
      voice.lang.toLowerCase().startsWith(languagePrefix)
    );
    const candidates = languageVoices.length > 0 ? languageVoices : voices;
    const femaleNamePattern =
      /female|woman|girl|swara|heera|kalpana|google हिन्दी|microsoft/i;

    return (
      candidates.find(voice => femaleNamePattern.test(voice.name)) ??
      candidates.find(voice => voice.lang.toLowerCase() === voiceLanguage) ??
      candidates[0]
    );
  };

  useEffect(() => {
    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.lang = voiceLanguage;
      const selectedVoice = selectVoice(availableVoices);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    };

    speak();
    return () => window.speechSynthesis.cancel();
  }, [language, voiceText, voiceLanguage, availableVoices]);

  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPlaying(false);
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
    } else {
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.lang = voiceLanguage;
      const selectedVoice = selectVoice(availableVoices);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="voice-modal">
        <button className="modal-close" onClick={onClose}>
          <X size={18} />
        </button>
        <div className="voice-orb">
          <Volume2 size={32} />
        </div>
        <div className="eyebrow green">ONLINE VOICE GUIDE · {language}</div>
        <h2>{voiceGuideCopy[language].title}</h2>
        <p>{voiceText}</p>
        <div className="voice-progress">
          <span style={{ width: isPlaying ? "62%" : "100%" }} />
        </div>
        <div className="voice-controls">
          <button onClick={togglePlayback}>
            <Volume2 size={16} /> {isPlaying ? "Pause" : "Play again"}
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function MaterialGlyph({ type }: { type: Transaction["icon"] }) {
  return (
    <div className={`material-glyph ${type}`}>
      {type === "pcb" ? (
        <Zap size={17} />
      ) : type === "battery" ? (
        <BatteryWarning size={17} />
      ) : (
        <span>⌁</span>
      )}
    </div>
  );
}
function MobileNav({
  role,
  view,
  t,
  onNavigate,
  onRoleChange,
}: {
  role: Role;
  view: View;
  t: (typeof dictionary)[Language];
  onNavigate: (view: View) => void;
  onRoleChange: (role: Role) => void;
}) {
  return (
    <nav className="mobile-nav">
      <button
        className={view === "home" ? "active" : ""}
        onClick={() => onNavigate("home")}
      >
        <LayoutDashboard size={19} />
        <span>{role === "recycler" ? "Incoming lots" : t.home}</span>
      </button>
      <button
        className={view === "prices" ? "active" : ""}
        onClick={() => onNavigate("prices")}
      >
        <CircleDollarSign size={19} />
        <span>{t.prices}</span>
      </button>
      <button className="mobile-create" onClick={() => onNavigate("create")}>
        <Plus size={23} />
      </button>
      {role === "collector" && (
        <button
          className={view === "recovery" ? "active" : ""}
          onClick={() => onNavigate("recovery")}
        >
          <MapPin size={19} />
          <span>Zones</span>
        </button>
      )}
      <button
        className={view === "activity" ? "active" : ""}
        onClick={() => onNavigate("activity")}
      >
        <History size={19} />
        <span>{t.activity}</span>
      </button>
    </nav>
  );
}
function Toast({ message }: { message: string }) {
  return (
    <div className="toast">
      <CheckCircle2 size={17} />
      <span>{message}</span>
    </div>
  );
}

export default App;
