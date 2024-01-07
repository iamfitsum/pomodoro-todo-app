import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "~/utils/utils";
import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { api } from "~/utils/api";

type Props = {
  selectedTodo: {
    value: string;
    label: string;
  };
  setSelectedTodo: React.Dispatch<
    React.SetStateAction<{
      value: string;
      label: string;
    }>
  >;
};

const TodoCombobox = ({ selectedTodo, setSelectedTodo }: Props) => {
  const [open, setOpen] = useState(false);

  const [todos, setTodos] = useState<
    | {
        value: string;
        label: string;
      }[]
    | null
  >(null);

  const getTodos = api.todo.getAll.useQuery(undefined, {
    onSuccess(data) {
      const todos = data.map((todo) => {
        return {
          value: todo.id,
          label: todo.title,
        };
      });
      setTodos([...new Set(todos)]);
    },
  });

  if (!getTodos) return <div />;

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-sm text-[#0ea5e9] md:w-[339px]"
          >
            {selectedTodo.value
              ? todos?.find((todo) => todo.value === selectedTodo.value)?.label
              : "Select todo..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 md:w-[339px]">
          <Command className="text-[#0ea5e9] dark:text-[#0ea5e9]">
            <CommandInput placeholder="Search todo..." />
            <CommandEmpty>No todo found.</CommandEmpty>
            <CommandGroup className="h-fit max-h-96 overflow-y-auto text-[#0ea5e9] dark:text-[#0ea5e9]">
              {todos?.map((todo) => (
                <CommandItem
                  key={todo.value}
                  onSelect={() => {
                    setSelectedTodo(todo);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTodo.value === todo.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {todo.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
};

export default TodoCombobox;
