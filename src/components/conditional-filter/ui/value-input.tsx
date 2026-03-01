"use client";

import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFilterOptions } from "../hooks/use-filter-options";
import { useFilterContext } from "../provider/filter-context";
import type { FilterFieldDefinition, FilterValue, OperatorType } from "../types";

interface ValueInputProps {
  rowId: string;
  field: FilterFieldDefinition;
  operator: OperatorType;
  value: FilterValue;
}

export function ValueInput({ rowId, field, operator, value }: ValueInputProps) {
  const { updateValue } = useFilterContext();

  if (operator === "is_empty" || operator === "is_not_empty") {
    return null; // value doesn't matter
  }

  const handleChange = (val: FilterValue) => {
    updateValue(rowId, val);
  };

  const isDateField = field.type === "date" || field.type === "datetime";

  // Range
  if (operator === "between") {
    const valArr = Array.isArray(value) ? value : ["", ""];

    if (isDateField) {
      return (
        <div className="flex items-center flex-1 space-x-2">
          <DatePickerInput
            value={valArr[0] as string}
            onChange={(dateStr) => handleChange([dateStr, String(valArr[1])] as FilterValue)}
            placeholder="Start date"
          />
          <span className="text-muted-foreground">-</span>
          <DatePickerInput
            value={valArr[1] as string}
            onChange={(dateStr) => handleChange([String(valArr[0]), dateStr] as FilterValue)}
            placeholder="End date"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center flex-1 space-x-2">
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder="Min"
          value={(valArr[0] as string | number) || ""}
          onChange={(e) => handleChange([e.target.value, String(valArr[1])] as FilterValue)}
          className="flex-1 min-w-[80px]"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          type={field.type === "number" ? "number" : "text"}
          placeholder="Max"
          value={(valArr[1] as string | number) || ""}
          onChange={(e) => handleChange([String(valArr[0]), e.target.value] as FilterValue)}
          className="flex-1 min-w-[80px]"
        />
      </div>
    );
  }

  // Boolean
  if (field.type === "boolean") {
    return (
      <Select
        value={value === true ? "true" : value === false ? "false" : ""}
        onValueChange={(val) => handleChange(val === "true")}
      >
        <SelectTrigger className="flex-1 min-w-[120px]">
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true">Yes</SelectItem>
          <SelectItem value="false">No</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  // Select (Static options)
  if (field.type === "select" && field.options) {
    return (
      <Select value={(value as string) || ""} onValueChange={handleChange}>
        <SelectTrigger className="flex-1 min-w-[120px]">
          <SelectValue placeholder="Select option..." />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  // Combobox (Dynamic options)
  if (field.type === "combobox" && field.fetchOptions) {
    return <ComboboxValueInput field={field} value={value} onChange={handleChange} />;
  }

  // Date Picker
  if (isDateField) {
    return (
      <DatePickerInput
        value={value as string}
        onChange={handleChange}
        placeholder="Pick a date"
        className="flex-1 min-w-[120px]"
      />
    );
  }

  // Default Input (Text, Number)
  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      placeholder="Value..."
      value={(value as string | number) || ""}
      onChange={(e) => handleChange(e.target.value)}
      className="flex-1 min-w-[120px]"
    />
  );
}

function DatePickerInput({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const date = value ? new Date(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("justify-start text-left font-normal flex-1", !date && "text-muted-foreground", className)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

function ComboboxValueInput({
  field,
  value,
  onChange,
}: {
  field: FilterFieldDefinition;
  value: FilterValue;
  onChange: (val: FilterValue) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const { options, loading, search } = useFilterOptions(field.fetchOptions);

  const selectedLabel = React.useMemo(() => {
    if (!value) return "Select...";
    const opt = options.find((o) => o.value === value);
    return opt ? opt.label : value;
  }, [value, options]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="flex-1 min-w-[120px] justify-between font-normal"
        >
          {selectedLabel}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search..." onValueChange={search} />
          <CommandList>
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : options.length === 0 ? (
              <CommandEmpty>No results found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check className={cn("mr-2 h-4 w-4", value === opt.value ? "opacity-100" : "opacity-0")} />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
