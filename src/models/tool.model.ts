import { UserRole } from "../services/user.service";

export interface Tool {
  id: string;
  name: string;
  englishName: string;
  category: string;
  description: string;
  iconSvg: string;
  iconColor: string; // Tailwind CSS color class e.g., 'text-blue-500'
  isActive: boolean;
  isFavorite: boolean;
  isVisiblePublicly: boolean; // Controls visibility on the public homepage
  allowedRoles: UserRole[]; // Defines which roles can see/use the tool
}