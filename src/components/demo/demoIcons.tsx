import React from 'react';
import {
  BarChart3,
  BellRing,
  ChefHat,
  ClipboardCheck,
  Cpu,
  CreditCard,
  Gift,
  Globe,
  HeartPulse,
  Monitor,
  Printer,
  Router,
  Scale,
  ScanLine,
  ScanText,
  Smartphone,
  Sparkles,
  Store,
  Tablet,
  Tag,
  TrendingUp,
  Wallet,
  WifiOff,
  Wrench,
} from 'lucide-react';

/**
 * One icon table shared by every demo surface (agenda rail, chapter stage,
 * hardware theater) so a name in the data files always renders the same mark.
 */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  BellRing,
  ChefHat,
  ClipboardCheck,
  Cpu,
  CreditCard,
  Gift,
  Globe,
  HeartPulse,
  Monitor,
  Printer,
  Router,
  Scale,
  ScanLine,
  ScanText,
  Smartphone,
  Sparkles,
  Store,
  Tablet,
  Tag,
  TrendingUp,
  Wallet,
  WifiOff,
};

export const DemoIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  const Cmp = ICONS[name] || Wrench;
  return <Cmp className={className} />;
};

export default DemoIcon;
