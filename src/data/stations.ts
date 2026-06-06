export type StationStatus = "available" | "busy" | "offline";
export type ConnectorType = "Type 2" | "CCS" | "CHAdeMO";

export interface Port {
  id: string;
  type: ConnectorType;
  occupied: boolean;
}

export interface Review {
  user: string;
  rating: number;
  comment: string;
}

export interface Station {
  id: string;
  name: string;
  operator: string;
  city: "Lagos" | "Abuja" | "Port Harcourt" | "Ibadan";
  address: string;
  lat: number;
  lng: number;
  status: StationStatus;
  connectors: ConnectorType[];
  powerKw: number;
  pricePerKwh: number;
  rating: number;
  waitMins: number;
  open24: boolean;
  free: boolean;
  ports: Port[];
  reviews: Review[];
  distanceKm: number;
  image: string;
}

const img = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?auto=format&fit=crop&w=1200&q=70`;

export const stations: Station[] = [
  {
    id: "lg-01", name: "Lekki Phase 1 Hub", operator: "GreenVolt NG", city: "Lagos",
    address: "12 Admiralty Way, Lekki Phase 1", lat: 6.4416, lng: 3.4789,
    status: "available", connectors: ["Type 2", "CCS"], powerKw: 60, pricePerKwh: 220,
    rating: 4.8, waitMins: 0, open24: true, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "Type 2", occupied: false },
      { id: "p3", type: "CCS", occupied: true },
      { id: "p4", type: "CCS", occupied: false },
    ],
    reviews: [
      { user: "Tunde A.", rating: 5, comment: "Super fast and reliable." },
      { user: "Amaka O.", rating: 4, comment: "Clean spot, good lighting at night." },
    ],
    distanceKm: 1.2,
    image: img("1593941707882-a5bba14938c7"),
  },
  {
    id: "lg-02", name: "Victoria Island Energy Point", operator: "EcoCharge", city: "Lagos",
    address: "Ahmadu Bello Way, VI", lat: 6.4281, lng: 3.4216,
    status: "busy", connectors: ["CCS", "CHAdeMO"], powerKw: 120, pricePerKwh: 260,
    rating: 4.5, waitMins: 12, open24: true, free: false,
    ports: [
      { id: "p1", type: "CCS", occupied: true },
      { id: "p2", type: "CCS", occupied: true },
      { id: "p3", type: "CHAdeMO", occupied: true },
    ],
    reviews: [{ user: "Kemi B.", rating: 4, comment: "Powerful but often busy at lunch." }],
    distanceKm: 3.4,
    image: img("1633077705107-4ddcfa1996f8"),
  },
  {
    id: "lg-03", name: "Ikeja City Mall Charger", operator: "GreenVolt NG", city: "Lagos",
    address: "Obafemi Awolowo Way, Ikeja", lat: 6.6018, lng: 3.3515,
    status: "available", connectors: ["Type 2"], powerKw: 22, pricePerKwh: 180,
    rating: 4.2, waitMins: 0, open24: false, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "Type 2", occupied: true },
    ],
    reviews: [{ user: "Seyi M.", rating: 4, comment: "Convenient while shopping." }],
    distanceKm: 8.1,
    image: img("1632833239869-a37e3a5806d2"),
  },
  {
    id: "lg-04", name: "Ikoyi Bridge Fast Lane", operator: "VoltAfrica", city: "Lagos",
    address: "Falomo Roundabout, Ikoyi", lat: 6.4476, lng: 3.4329,
    status: "offline", connectors: ["CCS"], powerKw: 150, pricePerKwh: 280,
    rating: 4.6, waitMins: 0, open24: true, free: false,
    ports: [{ id: "p1", type: "CCS", occupied: false }],
    reviews: [{ user: "Bola I.", rating: 5, comment: "Blazing fast when working." }],
    distanceKm: 2.7,
    image: img("1581094488379-6c1f3a72d3a8"),
  },
  {
    id: "lg-05", name: "Yaba Tech Park", operator: "EcoCharge", city: "Lagos",
    address: "Herbert Macaulay Way, Yaba", lat: 6.5158, lng: 3.3712,
    status: "available", connectors: ["Type 2", "CCS"], powerKw: 50, pricePerKwh: 0,
    rating: 4.7, waitMins: 0, open24: false, free: true,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "CCS", occupied: false },
    ],
    reviews: [{ user: "Chuka E.", rating: 5, comment: "Free charging for tenants — amazing." }],
    distanceKm: 5.6,
    image: img("1647500666543-b9c3b1e3a5b6"),
  },
  {
    id: "lg-06", name: "Surulere Community Stop", operator: "GreenVolt NG", city: "Lagos",
    address: "Adeniran Ogunsanya, Surulere", lat: 6.4969, lng: 3.3578,
    status: "busy", connectors: ["Type 2"], powerKw: 22, pricePerKwh: 200,
    rating: 4.0, waitMins: 18, open24: false, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: true },
      { id: "p2", type: "Type 2", occupied: true },
    ],
    reviews: [{ user: "Funmi A.", rating: 4, comment: "Slow but reliable." }],
    distanceKm: 6.9,
    image: img("1558425025-fd0fce5b1f87"),
  },
  {
    id: "ab-01", name: "Wuse II Power Plaza", operator: "VoltAfrica", city: "Abuja",
    address: "Aminu Kano Crescent, Wuse II", lat: 9.0820, lng: 7.4828,
    status: "available", connectors: ["Type 2", "CCS", "CHAdeMO"], powerKw: 100, pricePerKwh: 240,
    rating: 4.9, waitMins: 0, open24: true, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "CCS", occupied: false },
      { id: "p3", type: "CHAdeMO", occupied: false },
    ],
    reviews: [{ user: "Aisha M.", rating: 5, comment: "Flagship of Abuja — spotless." }],
    distanceKm: 0.8,
    image: img("1593941707874-ef25b8b4a92b"),
  },
  {
    id: "ab-02", name: "Garki Government Hub", operator: "EcoCharge", city: "Abuja",
    address: "Area 11, Garki", lat: 9.0301, lng: 7.4886,
    status: "available", connectors: ["Type 2"], powerKw: 22, pricePerKwh: 210,
    rating: 4.3, waitMins: 0, open24: false, free: false,
    ports: [{ id: "p1", type: "Type 2", occupied: false }],
    reviews: [{ user: "Ibrahim S.", rating: 4, comment: "Good for slow office charging." }],
    distanceKm: 2.2,
    image: img("1581092335397-9583eb92d232"),
  },
  {
    id: "ab-03", name: "Maitama Express Charger", operator: "GreenVolt NG", city: "Abuja",
    address: "IBB Way, Maitama", lat: 9.0900, lng: 7.4970,
    status: "busy", connectors: ["CCS"], powerKw: 150, pricePerKwh: 290,
    rating: 4.7, waitMins: 9, open24: true, free: false,
    ports: [
      { id: "p1", type: "CCS", occupied: true },
      { id: "p2", type: "CCS", occupied: false },
    ],
    reviews: [{ user: "Zara K.", rating: 5, comment: "Ultra rapid — great for road trips." }],
    distanceKm: 3.0,
    image: img("1597149959395-8a4a0bd4e5b1"),
  },
  {
    id: "ab-04", name: "Jabi Lake Mall", operator: "VoltAfrica", city: "Abuja",
    address: "Jabi District", lat: 9.0739, lng: 7.4196,
    status: "available", connectors: ["Type 2", "CCS"], powerKw: 50, pricePerKwh: 230,
    rating: 4.6, waitMins: 0, open24: false, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "CCS", occupied: true },
    ],
    reviews: [{ user: "David O.", rating: 5, comment: "Charge while you shop. Perfect." }],
    distanceKm: 5.4,
    image: img("1561364776-2090b6d9c1bd"),
  },
  {
    id: "ph-01", name: "GRA Phase 2 Energy Point", operator: "EcoCharge", city: "Port Harcourt",
    address: "Tombia St, GRA", lat: 4.8156, lng: 7.0498,
    status: "available", connectors: ["Type 2", "CCS"], powerKw: 50, pricePerKwh: 250,
    rating: 4.4, waitMins: 0, open24: true, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "CCS", occupied: false },
    ],
    reviews: [{ user: "Ngozi P.", rating: 4, comment: "Reliable in PH." }],
    distanceKm: 1.6,
    image: img("1581093588401-fbb62a02f120"),
  },
  {
    id: "ph-02", name: "Trans-Amadi Industrial", operator: "VoltAfrica", city: "Port Harcourt",
    address: "Trans-Amadi Industrial Layout", lat: 4.8002, lng: 7.0317,
    status: "offline", connectors: ["CCS", "CHAdeMO"], powerKw: 120, pricePerKwh: 270,
    rating: 4.1, waitMins: 0, open24: true, free: false,
    ports: [{ id: "p1", type: "CCS", occupied: false }],
    reviews: [{ user: "Emeka R.", rating: 3, comment: "Often down — needs attention." }],
    distanceKm: 4.2,
    image: img("1611288875785-cfa2c80f1d6f"),
  },
  {
    id: "ph-03", name: "Mile 1 Market Charger", operator: "GreenVolt NG", city: "Port Harcourt",
    address: "Diobu, Mile 1", lat: 4.7902, lng: 7.0125,
    status: "busy", connectors: ["Type 2"], powerKw: 22, pricePerKwh: 200,
    rating: 4.0, waitMins: 15, open24: false, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: true },
      { id: "p2", type: "Type 2", occupied: true },
    ],
    reviews: [{ user: "Tamara W.", rating: 4, comment: "Always packed but works." }],
    distanceKm: 6.0,
    image: img("1632823469850-2f77dd9c0e3a"),
  },
  {
    id: "ib-01", name: "Bodija Main Hub", operator: "GreenVolt NG", city: "Ibadan",
    address: "Awolowo Ave, Bodija", lat: 7.4344, lng: 3.9120,
    status: "available", connectors: ["Type 2", "CCS"], powerKw: 60, pricePerKwh: 220,
    rating: 4.6, waitMins: 0, open24: true, free: false,
    ports: [
      { id: "p1", type: "Type 2", occupied: false },
      { id: "p2", type: "CCS", occupied: false },
    ],
    reviews: [{ user: "Ola B.", rating: 5, comment: "Best in Ibadan." }],
    distanceKm: 2.0,
    image: img("1605648916361-9bc12ad6a569"),
  },
  {
    id: "ib-02", name: "Ring Road Express", operator: "EcoCharge", city: "Ibadan",
    address: "Ring Road, Challenge", lat: 7.3601, lng: 3.8965,
    status: "available", connectors: ["CCS"], powerKw: 100, pricePerKwh: 250,
    rating: 4.5, waitMins: 0, open24: true, free: false,
    ports: [
      { id: "p1", type: "CCS", occupied: false },
      { id: "p2", type: "CCS", occupied: true },
    ],
    reviews: [{ user: "Yemi T.", rating: 5, comment: "Great rapid charger." }],
    distanceKm: 5.7,
    image: img("1607349913338-fca6f7fc42d0"),
  },
  {
    id: "ib-03", name: "University of Ibadan Gate", operator: "VoltAfrica", city: "Ibadan",
    address: "UI Main Gate, Agbowo", lat: 7.4434, lng: 3.9006,
    status: "busy", connectors: ["Type 2"], powerKw: 22, pricePerKwh: 0,
    rating: 4.4, waitMins: 10, open24: false, free: true,
    ports: [
      { id: "p1", type: "Type 2", occupied: true },
      { id: "p2", type: "Type 2", occupied: false },
    ],
    reviews: [{ user: "Dami O.", rating: 5, comment: "Free for students. Lovely." }],
    distanceKm: 3.3,
    image: img("1593941707882-a5bba14938c7"),
  },
];

export const cityCenters: Record<Station["city"], { lat: number; lng: number }> = {
  Lagos: { lat: 6.4541, lng: 3.3947 },
  Abuja: { lat: 9.0765, lng: 7.4986 },
  "Port Harcourt": { lat: 4.8156, lng: 7.0498 },
  Ibadan: { lat: 7.3775, lng: 3.9470 },
};

export const getStation = (id: string) => stations.find((s) => s.id === id);