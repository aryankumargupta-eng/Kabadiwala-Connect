import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, ArrowRight, Filter, MapPin, Navigation, Plus, ShieldCheck, SlidersHorizontal, Trash2, TriangleAlert, WifiOff } from "lucide-react";
import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { trpc } from "../lib/trpc";
import { recoveryZoneCreateSchema, type RecoveryZone, type RecoveryZoneCreateInput } from "@shared/recoveryZones";
import { useI18n, type Language } from "../i18n";
import "leaflet/dist/leaflet.css";

const GAUTAM_BUDDHA_NAGAR_CENTER: [number, number] = [28.5355, 77.391];
const defaultFilters = {
  source: "all",
  status: "all",
  minScore: "0",
  wasteType: "all",
};

const sourceLabels: Record<string, string> = {
  all: "All sources",
  manual: "Manual",
  municipal: "Municipal",
  satellite: "Satellite",
};

const statusLabels: Record<string, string> = {
  all: "All statuses",
  active: "Active",
  verified: "Verified",
  unverified: "Unverified",
  cleared: "Cleared",
};

const wasteTypeOptions = ["all", "plastic", "metal", "paper", "e-waste", "mixed", "organic"] as const;

const demoDumpingAreas: RecoveryZone[] = [
  {
    id: 9001,
    name: "Hindon Riverbank Dumping Area",
    address: "Near Sector 145, Noida, Gautam Buddha Nagar",
    latitude: 28.478,
    longitude: 77.396,
    wasteType: "mixed",
    estimatedVolume: "high",
    recyclabilityScore: 72,
    status: "active",
    source: "municipal",
    confidence: 86,
    reportedBy: "Demo municipal survey",
    lastReportedAt: new Date("2026-09-01"),
    notes: "Demo location: mixed packaging, plastic and metal waste likely recoverable.",
    externalRef: "demo-gbn-001",
  },
  {
    id: 9002,
    name: "Sector 63 E-Waste Dumping Area",
    address: "IT belt service lane, Sector 63, Noida",
    latitude: 28.6203,
    longitude: 77.3736,
    wasteType: "e-waste",
    estimatedVolume: "medium",
    recyclabilityScore: 88,
    status: "active",
    source: "satellite",
    confidence: 79,
    reportedBy: "Demo field intelligence",
    lastReportedAt: new Date("2026-08-29"),
    notes: "Demo location: laptops, cables, monitors and UPS units may be recoverable.",
    externalRef: "demo-gbn-002",
  },
  {
    id: 9003,
    name: "Surajpur Industrial Scrap Area",
    address: "Surajpur Industrial Area, Greater Noida",
    latitude: 28.4949,
    longitude: 77.483,
    wasteType: "metal",
    estimatedVolume: "high",
    recyclabilityScore: 91,
    status: "active",
    source: "municipal",
    confidence: 83,
    reportedBy: "Demo industrial survey",
    lastReportedAt: new Date("2026-08-30"),
    notes: "Demo location: sheet metal and machinery scrap with high recovery potential.",
    externalRef: "demo-gbn-003",
  },
  {
    id: 9004,
    name: "Kasna Mixed Waste Dumping Area",
    address: "Kasna Industrial Area, Greater Noida",
    latitude: 28.427,
    longitude: 77.533,
    wasteType: "plastic",
    estimatedVolume: "medium",
    recyclabilityScore: 66,
    status: "active",
    source: "manual",
    confidence: 71,
    reportedBy: "Demo collector report",
    lastReportedAt: new Date("2026-08-27"),
    notes: "Demo location: packaging plastic and mixed recyclable waste.",
    externalRef: "demo-gbn-004",
  },
  {
    id: 9005,
    name: "Dadri Market Dumping Area",
    address: "Main market edge, Dadri, Gautam Buddha Nagar",
    latitude: 28.551,
    longitude: 77.556,
    wasteType: "paper",
    estimatedVolume: "medium",
    recyclabilityScore: 61,
    status: "active",
    source: "manual",
    confidence: 68,
    reportedBy: "Demo collector report",
    lastReportedAt: new Date("2026-08-25"),
    notes: "Demo location: cardboard and paper packaging from market activity.",
    externalRef: "demo-gbn-005",
  },
  {
    id: 9006,
    name: "Sector 18 Market Dumping Area",
    address: "Market service road, Sector 18, Noida",
    latitude: 28.5697,
    longitude: 77.326,
    wasteType: "mixed",
    estimatedVolume: "high",
    recyclabilityScore: 74,
    status: "active",
    source: "municipal",
    confidence: 82,
    reportedBy: "Demo municipal survey",
    lastReportedAt: new Date("2026-08-31"),
    notes: "Demo location: retail packaging, plastic and metal containers near the market.",
    externalRef: "demo-gbn-006",
  },
  {
    id: 9007,
    name: "Bhangel Market Collection Point",
    address: "Market edge, Sector 82, Noida",
    latitude: 28.601,
    longitude: 77.384,
    wasteType: "paper",
    estimatedVolume: "medium",
    recyclabilityScore: 69,
    status: "active",
    source: "manual",
    confidence: 76,
    reportedBy: "Demo collector report",
    lastReportedAt: new Date("2026-08-26"),
    notes: "Demo location: cardboard, paper and reusable packaging from wholesale activity.",
    externalRef: "demo-gbn-007",
  },
  {
    id: 9008,
    name: "Knowledge Park E-Waste Area",
    address: "Knowledge Park III, Greater Noida",
    latitude: 28.4736,
    longitude: 77.504,
    wasteType: "e-waste",
    estimatedVolume: "medium",
    recyclabilityScore: 84,
    status: "active",
    source: "satellite",
    confidence: 73,
    reportedBy: "Demo field intelligence",
    lastReportedAt: new Date("2026-08-28"),
    notes: "Demo location: discarded electronics, cables and small appliances near institutions.",
    externalRef: "demo-gbn-008",
  },
  {
    id: 9009,
    name: "Ecotech Plastic Dumping Area",
    address: "Ecotech Extension, Greater Noida",
    latitude: 28.467,
    longitude: 77.456,
    wasteType: "plastic",
    estimatedVolume: "high",
    recyclabilityScore: 79,
    status: "active",
    source: "municipal",
    confidence: 81,
    reportedBy: "Demo industrial survey",
    lastReportedAt: new Date("2026-08-24"),
    notes: "Demo location: packaging plastic from nearby industrial and consumer-goods units.",
    externalRef: "demo-gbn-009",
  },
  {
    id: 9010,
    name: "NSEZ Electronics Scrap Area",
    address: "Noida Special Economic Zone, Sector 81",
    latitude: 28.5807,
    longitude: 77.3623,
    wasteType: "e-waste",
    estimatedVolume: "high",
    recyclabilityScore: 93,
    status: "active",
    source: "municipal",
    confidence: 89,
    reportedBy: "Demo industrial survey",
    lastReportedAt: new Date("2026-09-02"),
    notes: "Demo location: circuit boards, casings and electronics manufacturing scrap.",
    externalRef: "demo-gbn-010",
  },
];

const regionCopy = {
  EN: { region: "GAUTAM BUDDHA NAGAR · FIELD INTELLIGENCE", demo: "Demo database · estimated recyclable waste", recoverable: "Estimated recoverable", kg: "kg", total: "Total recoverable waste", zones: "Zones shown", ai: "AI flagged", avg: "Avg. score", source: "Source", status: "Status", waste: "Waste", volume: "Volume", lastReported: "Last reported", clickPin: "Click map to place a pin", pinLocation: "PIN LOCATION" },
  हिंदी: { region: "गौतम बुद्ध नगर · फील्ड इंटेलिजेंस", demo: "डेमो डेटाबेस · अनुमानित रिसाइकिल योग्य कचरा", recoverable: "अनुमानित रिसाइकिल योग्य", kg: "किलो", total: "कुल रिसाइकिल योग्य कचरा", zones: "दिखाए गए ज़ोन", ai: "AI संकेत", avg: "औसत स्कोर", source: "स्रोत", status: "स्थिति", waste: "कचरा", volume: "मात्रा", lastReported: "अंतिम रिपोर्ट", clickPin: "पिन लगाने के लिए मानचित्र पर क्लिक करें", pinLocation: "पिन स्थान" },
  मराठी: { region: "गौतम बुद्ध नगर · फील्ड इंटेलिजन्स", demo: "डेमो डेटाबेस · अंदाजे पुनर्वापरयोग्य कचरा", recoverable: "अंदाजे पुनर्वापरयोग्य", kg: "किलो", total: "एकूण पुनर्वापरयोग्य कचरा", zones: "दाखवलेले झोन", ai: "AI संकेत", avg: "सरासरी स्कोअर", source: "स्रोत", status: "स्थिती", waste: "कचरा", volume: "प्रमाण", lastReported: "शेवटचा अहवाल", clickPin: "पिन ठेवण्यासाठी नकाशावर क्लिक करा", pinLocation: "पिन स्थान" },
} as const;

function getRecoverableWasteKg(zone: RecoveryZone) {
  const baseKg = { low: 35, medium: 120, high: 280 }[zone.estimatedVolume];
  return Math.round(baseKg * (0.55 + zone.recyclabilityScore / 200));
}

function getAreaRadius(zone: RecoveryZone) {
  return 180 + Math.min(520, getRecoverableWasteKg(zone) * 1.25);
}

function getScoreColor(score: number) {
  if (score >= 70) return "#1c8c5d";
  if (score >= 40) return "#d48a22";
  return "#be3a2b";
}

function FlyToZone({ center }: { center: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 12, { duration: 1.2 });
    }
  }, [center, map]);

  return null;
}

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 0);
    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

function RecoveryZoneMap({ zones, selectedId, onSelect, labels }: { zones: RecoveryZone[]; selectedId: number | null; onSelect: (zoneId: number) => void; labels: typeof regionCopy[Language] }) {
  const activeZone = zones.find((zone) => zone.id === selectedId) ?? zones[0] ?? null;
  const selectedCenter = activeZone ? ([activeZone.latitude, activeZone.longitude] as [number, number]) : GAUTAM_BUDDHA_NAGAR_CENTER;

  return (
    <div className="recovery-map-shell">
      <div className="recovery-legend">
        <span className="legend-title">Dumping area intensity</span>
        <div className="legend-pills">
          <div className="legend-pill green"><span className="legend-dot green" /> Score ≥ 70</div>
          <div className="legend-pill amber"><span className="legend-dot amber" /> 40-69</div>
          <div className="legend-pill red"><span className="legend-dot red" /> &lt; 40</div>
        </div>
      </div>
      <MapContainer center={selectedCenter} zoom={11} scrollWheelZoom className="recovery-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyToZone center={selectedCenter} />
        {zones.map((zone) => (
          <Circle
            key={zone.id}
            center={[zone.latitude, zone.longitude]}
            radius={getAreaRadius(zone)}
            pathOptions={{
              color: getScoreColor(zone.recyclabilityScore),
              fillColor: getScoreColor(zone.recyclabilityScore),
              fillOpacity: 0.28,
              weight: 2,
            }}
            eventHandlers={{ click: () => onSelect(zone.id) }}
          >
            <Popup>
              <div className="popup-card">
                <strong>{zone.name}</strong>
                <div className="popup-meta">{labels.source}: {zone.source.toUpperCase()} · {labels.waste}: {zone.wasteType}</div>
                <div className="popup-meta">{labels.recoverable}: {getRecoverableWasteKg(zone)} {labels.kg}</div>
                <div className="popup-meta">Confidence: {zone.confidence ?? "n/a"}%</div>
                <div className="popup-meta">{labels.volume}: {zone.estimatedVolume}</div>
                <div className="popup-meta">Score: {zone.recyclabilityScore}</div>
                <div className="popup-meta">Status: {zone.status}</div>
                <div className="popup-meta">{labels.lastReported}: {new Date(zone.lastReportedAt).toLocaleDateString("en-IN")}</div>
                {zone.notes && <div className="popup-notes">{zone.notes}</div>}
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}

function RecoveryZonesPage() {
  const { t: copy, language } = useI18n();
  const labels = regionCopy[language];
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<[number, number] | null>(null);

  const listQuery = trpc.recoveryZones.list.useQuery({
    source: filters.source === "all" ? undefined : filters.source as "manual" | "municipal" | "satellite",
    status: filters.status === "all" ? undefined : filters.status as "active" | "verified" | "unverified" | "cleared",
    wasteType: filters.wasteType === "all" ? undefined : filters.wasteType as RecoveryZone["wasteType"],
    minRecyclabilityScore: Number(filters.minScore) || 0,
  });

  const hasActiveFilters = filters.source !== "all" || filters.status !== "all" || filters.minScore !== "0" || filters.wasteType !== "all";
  const zones = listQuery.data?.length || hasActiveFilters ? (listQuery.data ?? []) : demoDumpingAreas;
  const aiFlagged = zones.filter((zone) => zone.source === "satellite").length;
  const avgScore = zones.length ? Math.round(zones.reduce((sum, zone) => sum + zone.recyclabilityScore, 0) / zones.length) : 0;
  const totalRecoverableKg = zones.reduce((sum, zone) => sum + getRecoverableWasteKg(zone), 0);

  const mutation = trpc.recoveryZones.create.useMutation({
    onSuccess: () => {
      setDialogOpen(false);
      setSelectedPoint(null);
      void listQuery.refetch();
    },
  });

  const form = useForm<RecoveryZoneCreateInput>({
    resolver: zodResolver(recoveryZoneCreateSchema),
    defaultValues: {
      name: "",
      address: "",
      latitude: GAUTAM_BUDDHA_NAGAR_CENTER[0],
      longitude: GAUTAM_BUDDHA_NAGAR_CENTER[1],
      wasteType: "mixed",
      estimatedVolume: "medium",
      recyclabilityScore: 65,
      status: "active",
      source: "manual",
      reportedBy: "Collector report",
      notes: "",
      externalRef: "manual-",
    },
  });

  const formValues = form.watch();

  const handleFormSubmit = (values: RecoveryZoneCreateInput) => {
    if (!selectedPoint) return;
    mutation.mutate({
      ...values,
      latitude: selectedPoint[0],
      longitude: selectedPoint[1],
      reportedBy: values.reportedBy || "Collector report",
      externalRef: values.externalRef || `manual-${Date.now()}`,
      lastReportedAt: new Date(),
      status: "active",
      source: "manual",
      notes: values.notes ?? null,
    });
  };

  const selectedZone = useMemo(
    () => zones.find((zone) => zone.id === selectedId) ?? zones[0] ?? null,
    [zones, selectedId]
  );

  return (
    <div className="page-content recovery-zones-page">
      <div className="recovery-header-row">
        <div>
          <div className="eyebrow green">{labels.region}</div>
          <h1>{copy("recoveryZones")}</h1>
          <p className="recovery-demo-note">{labels.demo}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="primary-button"><Plus size={16} /> {copy("reportZone")}</Button>
          </DialogTrigger>
          <DialogContent className="report-dialog-content p-0">
            <div className="report-dialog-grid">
              <div className="report-map-panel">
                <div className="report-map-header">
                  <span className="eyebrow green">{labels.pinLocation}</span>
                  <strong>{selectedPoint ? `${selectedPoint[0].toFixed(4)}, ${selectedPoint[1].toFixed(4)}` : labels.clickPin}</strong>
                </div>
                <MapContainer center={GAUTAM_BUDDHA_NAGAR_CENTER} zoom={11} scrollWheelZoom className="report-mini-map">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <ResizeMap />
                  <MapClickHandler onSelect={(lat, lng) => setSelectedPoint([lat, lng])} />
                  {selectedPoint && <Marker position={selectedPoint} icon={L.divIcon({ className: "manual-report-pin", html: '<span class="manual-pin"></span>', iconSize: [16, 16], iconAnchor: [8, 8] })} />}
                </MapContainer>
              </div>
              <div className="report-form-panel">
                <DialogHeader>
                  <DialogTitle>Report a recovery zone</DialogTitle>
                  <DialogDescription>Capture a manual sighting and push it to the recovery map.</DialogDescription>
                </DialogHeader>
                <form className="report-form" onSubmit={form.handleSubmit(handleFormSubmit)}>
                  <div className="form-grid">
                    <div className="field-block">
                      <label>Name</label>
                      <Input {...form.register("name")} placeholder="Narela scrap lane" />
                    </div>
                    <div className="field-block">
                      <label>Reported by</label>
                      <Input {...form.register("reportedBy")} placeholder="Kabadiwala name" />
                    </div>
                    <div className="field-block full-width">
                      <label>Address</label>
                      <Input {...form.register("address")} placeholder="Street, locality, city" />
                    </div>
                    <div className="field-block">
                      <label>Waste type</label>
                      <select className="form-select" {...form.register("wasteType")}>
                        {wasteTypeOptions.filter((option) => option !== "all").map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field-block">
                      <label>Volume</label>
                      <select className="form-select" {...form.register("estimatedVolume")}>
                        {(["low", "medium", "high"] as const).map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field-block">
                      <label>Score</label>
                      <Input type="number" min={0} max={100} {...form.register("recyclabilityScore", { valueAsNumber: true })} />
                    </div>
                    <div className="field-block full-width">
                      <label>Notes</label>
                      <textarea className="form-textarea" {...form.register("notes")} placeholder="Describe visible material, access, or hazards" />
                    </div>
                  </div>
                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button type="submit" className="primary-button" disabled={mutation.isPending || !selectedPoint}>Save zone</Button>
                  </DialogFooter>
                </form>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="recovery-layout">
        <aside className="recovery-sidebar">
          <div className="stat-strip">
            <div className="stat-box"><span>{labels.zones}</span><strong>{zones.length}</strong></div>
            <div className="stat-box"><span>{labels.ai}</span><strong>{aiFlagged}</strong></div>
            <div className="stat-box"><span>{labels.avg}</span><strong>{avgScore}</strong></div>
            <div className="stat-box recoverable-stat"><span>{labels.total}</span><strong>{totalRecoverableKg} {labels.kg}</strong></div>
          </div>

          <div className="filter-panel">
            <div className="panel-header"><Filter size={15} /> {copy("filters")}</div>
            <div className="filter-grid">
              <div className="filter-group">
                <label>Source</label>
                <select value={filters.source} onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))} className="form-select compact">
                  {Object.entries(sourceLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Status</label>
                <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} className="form-select compact">
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Min score</label>
                <input type="range" min={0} max={100} step={5} value={Number(filters.minScore)} onChange={(event) => setFilters((current) => ({ ...current, minScore: event.target.value }))} />
                <span className="range-value">{filters.minScore}</span>
              </div>
            </div>
            <div className="toggle-row">
              {wasteTypeOptions.map((type) => (
                <button
                  key={type}
                  className={cn("chip-button", filters.wasteType === type && "active")}
                  onClick={() => setFilters((current) => ({ ...current, wasteType: type }))}
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>
          </div>

          <div className="zone-list-panel">
            {listQuery.isLoading ? (
              <div className="list-loading">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            ) : zones.length === 0 ? (
              <div className="empty-state">
                <WifiOff size={22} />
                <strong>No matching zones</strong>
                <span>Try widening the filters or report a new recovery zone.</span>
              </div>
            ) : (
              <div className="zone-list">
                {zones.map((zone) => (
                  <button key={zone.id} className={cn("zone-card", selectedZone?.id === zone.id && "selected")} onClick={() => setSelectedId(zone.id)}>
                    <div className="zone-card-top">
                      <div className="zone-badge" style={{ backgroundColor: `${getScoreColor(zone.recyclabilityScore)}20`, color: getScoreColor(zone.recyclabilityScore) }}>{zone.source}</div>
                      <div className="zone-score" style={{ color: getScoreColor(zone.recyclabilityScore) }}>{zone.recyclabilityScore}</div>
                    </div>
                    <strong>{zone.name}</strong>
                    <span>{zone.address}</span>
                    <div className="zone-meta-grid">
                      <span><MapPin size={12} /> {zone.wasteType}</span>
                      <span>{getRecoverableWasteKg(zone)} {labels.kg}</span>
                    </div>
                    <div className="zone-meta-grid subtle">
                      <span>Status: {zone.status}</span>
                      {zone.confidence !== undefined && zone.confidence !== null && <span>Conf: {zone.confidence}%</span>}
                    </div>
                    <div className="zone-notes">{labels.recoverable}: {getRecoverableWasteKg(zone)} {labels.kg}. {zone.notes ?? "No notes provided."}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div className="map-panel">
          <RecoveryZoneMap zones={zones} selectedId={selectedId} onSelect={setSelectedId} labels={labels} />
        </div>
      </div>
    </div>
  );
}

export default RecoveryZonesPage;
