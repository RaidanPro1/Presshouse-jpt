
export interface Violation {
  id: number;
  case: string; // Type of violation (e.g., 'اعتقال', 'قتل')
  journalist: string; // Victim name
  governorate: string;
  date: string;
  perpetrator: string;
  status: 'Verified' | 'Pending' | 'Closed';
  summary?: string;
}
