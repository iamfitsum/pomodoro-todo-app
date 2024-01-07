import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Calendar } from "~/components/ui/calendar";
import { addDays, format } from "date-fns";
import { CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "~/utils/utils";
import { api } from "~/utils/api";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "~/components/ui/use-toast";
import { useState } from "react";

const todoFormSchema = z.object({
  title: z.string().min(1, {
    message: "Must be at least 1 character",
  }).max(32,{
    message: "Must be less than 32 characters"
  }),
  description: z.string().optional(),
  duedate: z.date().optional(),
  priority: z.string().optional(),
});

const TodoForm = () => {
      const [openDialog, setOpenDialog] = useState(false);

      const ctx = api.useContext();

      const form = useForm<z.infer<typeof todoFormSchema>>({
        resolver: zodResolver(todoFormSchema),
        defaultValues: {
          title: "",
          description: "",
          duedate: new Date(),
          priority: "LOW",
        },
      });

      const { mutate, isLoading: isPosting } = api.todo.create.useMutation({
        onSuccess: () => {
          toast({
            title: "Todo created",
            description: "Your todo has been created",
          });
          void ctx.todo.getAll.invalidate();
          form.reset();
          setOpenDialog(false);
        },
        onError: (err) => {
          const errorMessage = err.data?.zodError?.fieldErrors.content;
          if (errorMessage && errorMessage[0]) {
            toast({
              variant: "destructive",
              title: "Todo creation failed",
              description: errorMessage[0],
            });
          } else {
            toast({
              variant: "destructive",
              title: "Todo creation failed",
              description: "Failed to create todo! Please try again later.",
            });
          }
        },
      });

      function onSubmit(data: z.infer<typeof todoFormSchema>) {
        mutate(data);
      }
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger asChild onClick={() => setOpenDialog(true)}>
        <Button
          variant="outline"
          className="w-fit space-x-1 text-center font-semibold text-[#0ea5e9]"
        >
          <PlusCircle size={14} />
          <span className="text-md">Todo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>Add Todo</DialogTitle>
              <DialogDescription>
                You can add todos here. Click submit when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your todo" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the title of your todo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add description to your to do"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can add more information about your todo here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duedate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Select
                        onValueChange={(value: string) =>
                          field.onChange(addDays(new Date(), parseInt(value)))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="0">Today</SelectItem>
                          <SelectItem value="1">Tomorrow</SelectItem>
                          <SelectItem value="3">In 3 days</SelectItem>
                          <SelectItem value="7">In a week</SelectItem>
                        </SelectContent>
                      </Select>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Due Date is the due date or deadline for your todo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LOW">LOW</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Priority is the level of urgency of your todo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button disabled={isPosting} type="submit">
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TodoForm;
