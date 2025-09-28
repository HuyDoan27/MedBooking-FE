export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  reviews: number;
  distance: string;
  price: string;
  nextSlot: string;
  image?: string;
  isOnline: boolean;
}

export interface Specialty {
  name: string;
  color: string;
  textColor: string;
}

export interface QuickAction {
  icon: string;
  title: string;
  subtitle: string;
}