"use client";

import { Check, ChevronsUpDown } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useFilterContext } from "../provider/filter-context";
import type { FilterFieldDefinition } from "../types";

export interface FieldSelectProps {
  rowId: string;
  selectedField: FilterFieldDefinition | null;
}

export function FieldSelect({ rowId, selectedField }: FieldSelectProps) {
  const { config, updateField } = useFilterContext();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between font-normal"
        >
          {selectedField ? selectedField.label : "Select field..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search field..." />
          <CommandList>
            <CommandEmpty>No field found.</CommandEmpty>
            <CommandGroup>
              {config.fields.map((field) => (
                <CommandItem
                  key={field.name}
                  value={field.name}
                  onSelect={() => {
                    updateField(rowId, field);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedField?.name === field.name ? "opacity-100" : "opacity-0")}
                  />
                  {field.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
