// High-resolution realistic photography for TRANSIGO fleet, vehicles, and mobility scenes

export interface VehiclePhotoInfo {
  id: string;
  name: string;
  type: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption: string;
}

export const REAL_VEHICLE_PHOTOS: Record<string, VehiclePhotoInfo> = {
  'BUS-DEMO-001': {
    id: 'BUS-DEMO-001',
    name: 'Autobus Urbain Vert STPU',
    type: 'Bus Urbain 45 Places',
    colorName: 'Vert Forêt & Blanc',
    colorHex: '#006948',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80',
    caption: 'Autobus urbain standard grand gabarit STPU Brazzaville',
  },
  'BUS-DEMO-002': {
    id: 'BUS-DEMO-002',
    name: 'Autobus Express Bleu Métropolitain',
    type: 'Bus Articulé / Standard',
    colorName: 'Bleu Océan',
    colorHex: '#1e40af',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=400&q=80',
    caption: 'Bus urbain bleu réseau express avenue Denis Sassou Nguesso',
  },
  'BUS-DEMO-004': {
    id: 'BUS-DEMO-004',
    name: 'Autobus Ligne Nord Rouge',
    type: 'Bus Standard 40 Places',
    colorName: 'Rouge Écarlate',
    colorHex: '#dc2626',
    imageUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=400&q=80',
    caption: 'Autobus grand flux axe Talangaï - Kintélé',
  },
  'COASTER-DEMO-003': {
    id: 'COASTER-DEMO-003',
    name: 'Minibus Coaster Urbain',
    type: 'Toyota Coaster 22 Places',
    colorName: 'Blanc & Vert',
    colorHex: '#059669',
    imageUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=400&q=80',
    caption: 'Minibus Coaster de transport collectif homologué Brazzaville',
  },
  'TAXI-DEMO-005': {
    id: 'TAXI-DEMO-005',
    name: 'Taxi Urbain Vert & Blanc',
    type: 'Berline Taxi Conventionnée 4 Places',
    colorName: 'Vert & Blanc Réglementaire',
    colorHex: '#006948',
    imageUrl: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1200&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=400&q=80',
    caption: 'Taxi urbain officiel 100/100 de Brazzaville',
  },
};

export const REAL_CAROUSEL_SLIDES = [
  {
    id: 'slide-1',
    title: 'Réseau Urbain STPU — Lignes Majeures',
    subtitle: 'Autobus modernes climatisés desservant les grands axes de Brazzaville',
    category: 'Autobus Vert Standard',
    colorBadge: 'bg-emerald-600',
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=85',
    route: 'Ligne 01 : Bacongo → Poto-Poto → Ouenze → Talangaï',
  },
  {
    id: 'slide-2',
    title: 'Liaisons Express Métropolitaines',
    subtitle: 'Flotte d’autobus bleus pour les trajets directs et le centre d’affaires',
    category: 'Bus Bleu Express',
    colorBadge: 'bg-blue-600',
    imageUrl: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1600&q=85',
    route: 'Ligne 02 : Makélékélé → Rond-Point Moungali → Mfilou',
  },
  {
    id: 'slide-3',
    title: 'Taxis Urbains Verts & Blancs Conventionnés',
    subtitle: 'Prise en charge à la demande et suivi GPS porte-à-porte',
    category: 'Taxi Urbain 100/100',
    colorBadge: 'bg-emerald-700',
    imageUrl: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&w=1600&q=85',
    route: 'Courses urbaines immédiates sur toute l’agglomération',
  },
  {
    id: 'slide-4',
    title: 'Ligne Nord & Rocades Périurbaines',
    subtitle: 'Dessertes renforcées aux heures de pointe vers Kintélé et Djiri',
    category: 'Bus Rouge Grande Capacité',
    colorBadge: 'bg-red-600',
    imageUrl: 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=1600&q=85',
    route: 'Ligne 04 : Talangaï → Kintélé Université',
  },
  {
    id: 'slide-5',
    title: 'Minibus Coasters Collectifs',
    subtitle: 'Liaisons rapides de proximité et maillage inter-quartiers',
    category: 'Coaster Homologué',
    colorBadge: 'bg-teal-600',
    imageUrl: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=1600&q=85',
    route: 'Ligne 03 : Mpila → Marché Total Bacongo',
  },
];

export const MOBILITY_SCENE_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=85',
  station: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=800&q=80',
  cityTraffic: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80',
  passengers: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
};
