export interface Coupon {
  id: string
  storeName: string
  title: string
  description: string
  discount: string
  category:
    | 'Alimentação'
    | 'Moda'
    | 'Serviços'
    | 'Eletrônicos'
    | 'Lazer'
    | 'Outros'
  distance: number // in meters
  expiryDate: string
  image: string
  logo?: string
  code: string
  isFeatured?: boolean
  isTrending?: boolean
  terms?: string
  coordinates: {
    lat: number
    lng: number
  }
}

export type CategoryType = Coupon['category']

export interface UserLocation {
  lat: number
  lng: number
  address?: string
}
