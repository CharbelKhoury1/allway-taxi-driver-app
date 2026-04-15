export interface Driver {
  id: string;
  full_name: string;
  phone: string;
  plate: string;
  car_model: string;
  photo_url: string | null;
  rating: number;
  total_trips: number;
  online: boolean;
  status: "available" | "on_trip" | "offline";
  lat: number | null;
  lng: number | null;
  last_seen: string;
  pwa_pin?: string | null;
  created_at: string;
}

export interface Trip {
  id: string;
  customer_id: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  status:
    | "pending"
    | "dispatching"
    | "accepted"
    | "on_trip"
    | "completed"
    | "cancelled"
    | "no_driver";
  fare_usd: number | null;
  distance_km: number | null;
  duration_min: number | null;
  notes: string | null;
  cancel_reason: string | null;
  requested_at: string;
  accepted_at: string | null;
  pickup_at: string | null;
  completed_at: string | null;
  customers?: { full_name: string; phone: string; status: string } | null;
}
