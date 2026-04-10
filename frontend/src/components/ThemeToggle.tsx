import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore, type ThemePreference } from '@/store/themeStore';
import { motion } from 'framer-motion';

const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

type Props = {
  /** Compact icon-only trigger (navbar) */
  variant?: 'default' | 'icon';
};

export function ThemeToggle({ variant = 'icon' }: Props) {
  const { preference, setPreference } = useThemeStore();
  const CurrentIcon =
    preference === 'dark' ? Moon : preference === 'light' ? Sun : Monitor;

  if (variant === 'icon') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="relative rounded-full border border-transparent hover:border-border"
              aria-label="Theme"
            >
              <CurrentIcon className="h-[1.15rem] w-[1.15rem]" />
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          {options.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => setPreference(value)}
              className={preference === value ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
      {options.map(({ value, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPreference(value)}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            preference === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
          {value === 'system' ? 'Auto' : value}
        </button>
      ))}
    </div>
  );
}
