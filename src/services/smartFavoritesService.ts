import { SmartFavorite } from '../types';

const DEFAULT_FAVORITES: SmartFavorite[] = [
  {
    id: 'FAV-01',
    type: 'home',
    label: 'Maison',
    originPlace: 'Total Bacongo',
    destinationPlace: 'Total Bacongo',
    icon: 'home',
    badge: 'Bacongo'
  },
  {
    id: 'FAV-02',
    type: 'work',
    label: 'Travail (Centre-Ville)',
    originPlace: 'Total Bacongo',
    destinationPlace: 'Centre-Ville Plateau',
    icon: 'business_center',
    badge: 'Plateau des 15 Ans'
  },
  {
    id: 'FAV-03',
    type: 'university',
    label: 'Université Marien Ngouabi',
    originPlace: 'Total Bacongo',
    destinationPlace: 'Université Marien Ngouabi (Campus Bayardelle)',
    icon: 'school',
    badge: 'Campus Central'
  },
  {
    id: 'FAV-04',
    type: 'market',
    label: 'Marché Total',
    originPlace: 'Rond-Point Moungali',
    destinationPlace: 'Marché Total Bacongo',
    icon: 'storefront',
    badge: 'Bacongo'
  },
  {
    id: 'FAV-05',
    type: 'route',
    label: 'Ligne 01 • Bifouiti ↔ Kintélé',
    originPlace: 'Bifouiti',
    destinationPlace: 'Stade de Kintélé',
    icon: 'directions_bus',
    badge: 'Ligne Régulière'
  }
];

class SmartFavoritesService {
  private favorites: SmartFavorite[] = [...DEFAULT_FAVORITES];

  getFavorites(): SmartFavorite[] {
    return [...this.favorites];
  }

  addFavorite(fav: Omit<SmartFavorite, 'id'>): SmartFavorite {
    const newFav: SmartFavorite = {
      ...fav,
      id: `FAV-${Date.now()}`
    };
    this.favorites.push(newFav);
    return newFav;
  }

  removeFavorite(id: string): void {
    this.favorites = this.favorites.filter((f) => f.id !== id);
  }
}

export const smartFavoritesService = new SmartFavoritesService();
