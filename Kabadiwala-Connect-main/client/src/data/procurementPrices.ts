export type RateRange = {
  min: number;
  max: number;
};

export type NationalPriceBenchmark = {
  category: string;
  grade: string;
  min: number;
  max: number;
  endUser: string;
};

export type StatePriceBenchmark = {
  state: string;
  ironHms: RateRange;
  copper: RateRange;
  aluminium: RateRange;
  petPlastic: RateRange;
  cartonOcc: RateRange;
  driver: string;
};

export const nationalPriceBenchmarks: NationalPriceBenchmark[] = [
  {
    category: "Ferrous Metals",
    grade: "Heavy Melting Scrap (HMS 1 & 2 / Angle / Beams)",
    min: 34,
    max: 42,
    endUser: "Induction furnaces, mini steel plants",
  },
  {
    category: "Ferrous Metals",
    grade: "Light Melting Scrap (LMS / Tin sheets / Thin iron)",
    min: 24,
    max: 29,
    endUser: "Re-rolling mills, ingot casting",
  },
  {
    category: "Ferrous Metals",
    grade: "Cast Iron Scrap",
    min: 32,
    max: 38,
    endUser: "Foundry casting units",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Copper Scrap (Armature / Bright wire / Millberry)",
    min: 720,
    max: 820,
    endUser: "Copper rod plants, wire drawing units",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Copper Mixed / Heavy scrap",
    min: 620,
    max: 710,
    endUser: "Secondary smelters",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Brass Scrap (Honey / Utensil / Radiator)",
    min: 430,
    max: 510,
    endUser: "Brass ingot manufacturers, brass extrusion",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Aluminium Scrap (Extrusion / Sections)",
    min: 170,
    max: 215,
    endUser: "Billets, aluminium rolling units",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Aluminium Taint Tabor (Sheet / Mixed utensils)",
    min: 130,
    max: 160,
    endUser: "De-ox casting units, auto alloys",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Stainless Steel 304 Grade",
    min: 75,
    max: 95,
    endUser: "Stainless steel refining units",
  },
  {
    category: "Non-Ferrous Metals",
    grade: "Battery Scrap (Drained Lead-Acid Plates)",
    min: 92,
    max: 115,
    endUser: "Secondary lead smelters",
  },
  {
    category: "Paper & Fibre",
    grade: "Corrugated Boxes / Carton (OCC Grade)",
    min: 11.5,
    max: 15.5,
    endUser: "Kraft paper mills, packaging plants",
  },
  {
    category: "Paper & Fibre",
    grade: "Old Newspaper (ONP)",
    min: 14,
    max: 18,
    endUser: "Newsprint & duplex board mills",
  },
  {
    category: "Paper & Fibre",
    grade: "Office Paper / White Records (SWL)",
    min: 15,
    max: 19.5,
    endUser: "Tissue mills, writing/printing paper mills",
  },
  {
    category: "Paper & Fibre",
    grade: "Mixed Waste Paper (Magazines / Notebooks)",
    min: 10,
    max: 14,
    endUser: "Grey board & paperboard manufacturers",
  },
  {
    category: "Plastics",
    grade: "PET Bottles (Clear / Transparent Baled)",
    min: 32,
    max: 42,
    endUser: "Recycled Polyester Staple Fibre (RPSF) plants",
  },
  {
    category: "Plastics",
    grade: "HDPE (Milk cans, shampoo bottles, drums)",
    min: 42,
    max: 55,
    endUser: "Pipe extrusion, blow molding re-granulators",
  },
  {
    category: "Plastics",
    grade: "LDPE / LLDPE Film (Clean transparent packaging)",
    min: 35,
    max: 46,
    endUser: "Blown film, black poly pipe units",
  },
  {
    category: "Plastics",
    grade: "PP (Polypropylene woven bags, buckets, crates)",
    min: 28,
    max: 38,
    endUser: "Injection moulding, raffia recyclers",
  },
  {
    category: "Plastics",
    grade: "Mixed Soft / Low-Grade Plastics (MLP / Crushed)",
    min: 6,
    max: 11,
    endUser: "Pyrolysis oil units, cement kilns (AFR)",
  },
  {
    category: "E-Waste & Glass",
    grade: "Computer Motherboards / Server PCBs",
    min: 280,
    max: 420,
    endUser: "Precious metal recovery refineries",
  },
  {
    category: "E-Waste & Glass",
    grade: "Glass Cullet / Broken Bottles (per kg equiv)",
    min: 1.5,
    max: 3,
    endUser: "Glass container plants (HNG, Piramal)",
  },
];

export const statePriceBenchmarks: StatePriceBenchmark[] = [
  {
    state: "Maharashtra",
    ironHms: { min: 37, max: 41 },
    copper: { min: 740, max: 790 },
    aluminium: { min: 175, max: 200 },
    petPlastic: { min: 34, max: 40 },
    cartonOcc: { min: 13.5, max: 16 },
    driver: "Alang shipbreaking proximity, Jalna & Wada re-rolling clusters",
  },
  {
    state: "Gujarat",
    ironHms: { min: 38, max: 42 },
    copper: { min: 750, max: 810 },
    aluminium: { min: 175, max: 205 },
    petPlastic: { min: 35, max: 41 },
    cartonOcc: { min: 14, max: 16.5 },
    driver: "Vapi paper hub, Alang steel, Kandla chemical & plastic zones",
  },
  {
    state: "Tamil Nadu",
    ironHms: { min: 36, max: 40 },
    copper: { min: 730, max: 780 },
    aluminium: { min: 165, max: 195 },
    petPlastic: { min: 33, max: 39 },
    cartonOcc: { min: 13, max: 15.5 },
    driver: "Coimbatore foundry belt, Tirupur textile-grade PET mills",
  },
  {
    state: "Karnataka",
    ironHms: { min: 35, max: 39 },
    copper: { min: 720, max: 770 },
    aluminium: { min: 160, max: 190 },
    petPlastic: { min: 32, max: 38 },
    cartonOcc: { min: 12.5, max: 15 },
    driver: "Bengaluru IT corridor e-waste & Peenya foundry consumption",
  },
  {
    state: "Telangana",
    ironHms: { min: 35, max: 38 },
    copper: { min: 715, max: 765 },
    aluminium: { min: 160, max: 185 },
    petPlastic: { min: 31, max: 37 },
    cartonOcc: { min: 12, max: 14.5 },
    driver: "Balanagar, Jeedimetla, Kattedan industrial zones",
  },
  {
    state: "Andhra Pradesh",
    ironHms: { min: 34, max: 38 },
    copper: { min: 710, max: 760 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 30, max: 36 },
    cartonOcc: { min: 11.5, max: 14 },
    driver: "Vizag steel ecosystem, coastal packaging supply lines",
  },
  {
    state: "Punjab",
    ironHms: { min: 37, max: 42 },
    copper: { min: 735, max: 785 },
    aluminium: { min: 170, max: 195 },
    petPlastic: { min: 32, max: 38 },
    cartonOcc: { min: 12.5, max: 15 },
    driver: "Mandi Gobindgarh (iron hub), Ludhiana light engineering",
  },
  {
    state: "Haryana",
    ironHms: { min: 36, max: 40 },
    copper: { min: 730, max: 780 },
    aluminium: { min: 165, max: 190 },
    petPlastic: { min: 32, max: 38 },
    cartonOcc: { min: 13, max: 15.5 },
    driver: "Panipat yarn/reclaimed fiber, Kundli & Manesar auto clusters",
  },
  {
    state: "Uttar Pradesh",
    ironHms: { min: 34, max: 38 },
    copper: { min: 720, max: 770 },
    aluminium: { min: 160, max: 185 },
    petPlastic: { min: 30, max: 36 },
    cartonOcc: { min: 12, max: 14.5 },
    driver: "Moradabad brass units, Muzaffarnagar paper/steel belts",
  },
  {
    state: "Rajasthan",
    ironHms: { min: 35, max: 39 },
    copper: { min: 725, max: 775 },
    aluminium: { min: 165, max: 190 },
    petPlastic: { min: 31, max: 37 },
    cartonOcc: { min: 12, max: 14.5 },
    driver: "Bhiwadi & Jaipur industrial belts, proximity to Delhi NCR",
  },
  {
    state: "West Bengal",
    ironHms: { min: 34, max: 38 },
    copper: { min: 710, max: 760 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 29, max: 35 },
    cartonOcc: { min: 11.5, max: 14 },
    driver: "Howrah foundry cluster, Durgapur-Asansol metal hubs",
  },
  {
    state: "Odisha",
    ironHms: { min: 33, max: 37 },
    copper: { min: 700, max: 750 },
    aluminium: { min: 150, max: 175 },
    petPlastic: { min: 28, max: 34 },
    cartonOcc: { min: 11, max: 13.5 },
    driver: "Angul-Rourkela heavy metallurgy clusters, coastal mills",
  },
  {
    state: "Chhattisgarh",
    ironHms: { min: 34, max: 38 },
    copper: { min: 705, max: 755 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 28, max: 34 },
    cartonOcc: { min: 11, max: 13.5 },
    driver: "Raipur sponge iron capital, Urla & Siltara smelting belts",
  },
  {
    state: "Madhya Pradesh",
    ironHms: { min: 34, max: 38 },
    copper: { min: 710, max: 760 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 30, max: 35 },
    cartonOcc: { min: 11.5, max: 14 },
    driver: "Pithampur auto zone, Govindpura & Mandideep scrap plants",
  },
  {
    state: "Bihar",
    ironHms: { min: 31, max: 35 },
    copper: { min: 690, max: 740 },
    aluminium: { min: 145, max: 170 },
    petPlastic: { min: 27, max: 33 },
    cartonOcc: { min: 10.5, max: 13 },
    driver: "Transit market via Patna; outgoing scrap routed to Bengal/UP",
  },
  {
    state: "Jharkhand",
    ironHms: { min: 33, max: 37 },
    copper: { min: 700, max: 750 },
    aluminium: { min: 150, max: 175 },
    petPlastic: { min: 28, max: 34 },
    cartonOcc: { min: 11, max: 13.5 },
    driver: "Jamshedpur-Bokaro-Dhanbad scrap yards and re-rollers",
  },
  {
    state: "Kerala",
    ironHms: { min: 33, max: 37 },
    copper: { min: 710, max: 760 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 29, max: 35 },
    cartonOcc: { min: 12, max: 14.5 },
    driver: "Kochi industrial hub; high freight costs to mainland smelters",
  },
  {
    state: "Uttarakhand",
    ironHms: { min: 34, max: 38 },
    copper: { min: 715, max: 765 },
    aluminium: { min: 160, max: 185 },
    petPlastic: { min: 30, max: 36 },
    cartonOcc: { min: 12.5, max: 15 },
    driver: "Haridwar & Pantnagar packaging and automotive suppliers",
  },
  {
    state: "Himachal Pradesh",
    ironHms: { min: 33, max: 37 },
    copper: { min: 710, max: 760 },
    aluminium: { min: 155, max: 180 },
    petPlastic: { min: 29, max: 35 },
    cartonOcc: { min: 11.5, max: 14 },
    driver: "Baddi-Barotiwala-Nalagarh industrial & packaging units",
  },
  {
    state: "Assam",
    ironHms: { min: 30, max: 34 },
    copper: { min: 680, max: 730 },
    aluminium: { min: 140, max: 165 },
    petPlastic: { min: 26, max: 32 },
    cartonOcc: { min: 10, max: 12.5 },
    driver: "Guwahati transit market; long freight legs to East India mills",
  },
  {
    state: "Goa",
    ironHms: { min: 34, max: 38 },
    copper: { min: 720, max: 770 },
    aluminium: { min: 160, max: 185 },
    petPlastic: { min: 30, max: 36 },
    cartonOcc: { min: 12, max: 14.5 },
    driver: "Kundaim & Verna estates, balance exported to Maharashtra",
  },
  {
    state: "Jammu & Kashmir",
    ironHms: { min: 31, max: 35 },
    copper: { min: 685, max: 735 },
    aluminium: { min: 145, max: 170 },
    petPlastic: { min: 26, max: 32 },
    cartonOcc: { min: 10, max: 12.5 },
    driver: "Bari Brahmana (Jammu) units; transport surcharge to Punjab",
  },
  {
    state: "Delhi NCR",
    ironHms: { min: 37, max: 41 },
    copper: { min: 740, max: 790 },
    aluminium: { min: 170, max: 200 },
    petPlastic: { min: 33, max: 39 },
    cartonOcc: { min: 13.5, max: 16 },
    driver: "Mayapuri, Mundka, and Tikri Kalan mega consolidation hubs",
  },
];

export const createLotBenchmarkRates = {
  PCBs: 350,
  Cables: 765,
  "Mixed plastic": 8.5,
} as const;

export const defaultStatePriceBenchmark = "Maharashtra";

export function getAverageRate(range: RateRange) {
  return (range.min + range.max) / 2;
}

export function formatRate(rate: number) {
  return rate.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
