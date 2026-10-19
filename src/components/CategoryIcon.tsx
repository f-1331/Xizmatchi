import React from 'react';
import {
  Wrench,
  Zap,
  Tv,
  Wind,
  Hammer,
  Sparkles,
  Armchair,
  KeyRound,
  Camera,
  Maximize,
  Flame,
  Truck,
  Trees,
  Bug,
  Car,
  Thermometer,
  ShieldCheck,
  Clock,
  Phone,
  Send,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Heart,
  FileText,
  User,
  ThumbsUp,
  Image as ImageIcon,
  HelpCircle,
  Info,
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className = 'w-5 h-5' }: CategoryIconProps) {
  switch (name) {
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Wind':
      return <Wind className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Armchair':
      return <Armchair className={className} />;
    case 'KeyRound':
      return <KeyRound className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Maximize':
      return <Maximize className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'Trees':
      return <Trees className={className} />;
    case 'Bug':
      return <Bug className={className} />;
    case 'Car':
      return <Car className={className} />;
    case 'Thermometer':
      return <Thermometer className={className} />;
    default:
      return <Wrench className={className} />;
  }
}

export {
  Wrench,
  Zap,
  Tv,
  Wind,
  Hammer,
  Sparkles,
  Armchair,
  KeyRound,
  Camera,
  Maximize,
  Flame,
  Truck,
  Trees,
  Bug,
  Car,
  Thermometer,
  ShieldCheck,
  Clock,
  Phone,
  Send,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  X,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Plus,
  Heart,
  FileText,
  User,
  ThumbsUp,
  ImageIcon,
  HelpCircle,
  Info,
};
