export interface StatPoint {
  timestamp: number;
  value: number;
}

export interface StatSeries {
  id: string;
  name: string;
  color: string;
  data: StatPoint[];
}
