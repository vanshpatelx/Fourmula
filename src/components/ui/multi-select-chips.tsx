import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MultiSelectChipsProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function MultiSelectChips({
  options,
  selected,
  onChange,
  className,
}: MultiSelectChipsProps) {
  const toggleOption = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        return (
          <Badge
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-all",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleOption(option.value)}
          >
            {option.label}
          </Badge>
        );
      })}
    </div>
  );
}
