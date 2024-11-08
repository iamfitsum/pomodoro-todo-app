/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
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
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { toast } from "~/components/ui/use-toast";
import TimerContext from "~/state/timer/TimerContext";
import { api } from "~/utils/api";
import { cn } from "~/utils/utils";

dayjs.extend(relativeTime);

const todoFormSchema = z.object({
  title: z
    .string()
    .min(1, {
      message: "Must be at least 1 character",
    })
    .max(32, {
      message: "Must be less than 32 characters",
    }),
  description: z.string().optional(),
  done: z.boolean().optional(),
  duedate: z.date().optional(),
  priority: z.string().optional(),
});

type Props = {
  fullTodo: {
    id: string;
    createdAt: Date;
    title: string;
    description: string | null | undefined;
    done: boolean;
    dueDate: Date | null | undefined;
    priority: string | null | undefined;
    tomatoes: number;
    authorId: string;
  };
};

const EditTodoForm = ({ fullTodo }: Props) => {
  const ctx = api.useContext();
  const { isPomodoroFinished, setIsPomodoroFinished } =
    useContext(TimerContext);
  const form = useForm<z.infer<typeof todoFormSchema>>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: fullTodo.title,
      description: fullTodo.description!,
      done: fullTodo.done,
      duedate: fullTodo.dueDate!,
      priority: fullTodo.priority!,
    },
  });
  useEffect(() => {
    if (isPomodoroFinished) {
      updateTodo({
        id: fullTodo.id,
        title: fullTodo.title,
        description: fullTodo.description!,
        done: fullTodo.done,
        duedate: fullTodo.dueDate!,
        priority: fullTodo.priority!,
        tomatoes: fullTodo.tomatoes + 1,
      });
      setIsPomodoroFinished(false);
    }
  }, [isPomodoroFinished, setIsPomodoroFinished]);

  useEffect(() => {
    form.reset({
      title: fullTodo.title,
      description: fullTodo.description!,
      done: fullTodo.done,
      duedate: fullTodo.dueDate!,
      priority: fullTodo.priority!,
    });
  }, [fullTodo, form]);

  const { mutate: updateTodo } = api.todo.update.useMutation({
    onSuccess: () => {
      toast({
        title: "Todo updated",
        description: "Your todo has been updated",
      });
      void ctx.todo.getAll.invalidate();
      void ctx.todo.getSelectedTodo.invalidate();
      void ctx.todo.doneTodosByMonth.invalidate();
      void ctx.todo.undoneTodosByMonth.invalidate();

      form.reset({
        title: fullTodo.title,
        description: fullTodo.description!,
        done: fullTodo.done,
        duedate: fullTodo.dueDate!,
        priority: fullTodo.priority!,
      });
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast({
          variant: "destructive",
          title: "Todo update failed",
          description: errorMessage[0],
        });
      } else {
        toast({
          variant: "destructive",
          title: "Todo update failed",
          description: "Failed to update todo! Please try again later.",
        });
      }
    },
  });

  function onSubmit(data: z.infer<typeof todoFormSchema>) {
    updateTodo({
      id: fullTodo.id,
      title: data.title,
      description: data.description,
      done: data.done,
      duedate: data.duedate,
      priority: data.priority,
      tomatoes: fullTodo.tomatoes,
    });
  }

  const handleFormChange = () => {
    void form.handleSubmit(onSubmit)();
  };

  const deleteTodo = api.todo.delete.useMutation({});

  const handleDelete = () => {
    deleteTodo.mutate(
      { id: fullTodo.id },
      {
        onSuccess: () => {
          toast({
            title: "Todo deleted",
            description: "Your todo has been deleted",
          });
          void ctx.todo.getAll.invalidate();
          void ctx.todo.getSelectedTodo.invalidate();
          void ctx.todo.doneTodosByMonth.invalidate();
          void ctx.todo.undoneTodosByMonth.invalidate();

          location.reload();
        },
        onError: (err) => {
          const errorMessage = err.data?.zodError?.fieldErrors.content;
          if (errorMessage && errorMessage[0]) {
            toast({
              variant: "destructive",
              title: "Todo deletion failed",
              description: errorMessage[0],
            });
          } else {
            toast({
              variant: "destructive",
              title: "Todo deletion failed",
              description: "Failed to delete todo! Please try again later.",
            });
          }
        },
      }
    );
  };

  return (
    <div>
      <Form {...form}>
        <form
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2"
        >
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {dayjs(fullTodo.createdAt).fromNow()}
            </Badge>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">Edit</Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 md:w-96">
                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your todo"
                              {...field}
                              onBlur={handleFormChange}
                            />
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
                              onBlur={handleFormChange}
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Select
                                onValueChange={(value: string) => {
                                  field.onChange(
                                    addDays(new Date(), parseInt(value))
                                  );
                                  handleFormChange();
                                }}
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
                                onSelect={(value: Date | undefined) => {
                                  field.onChange(value);
                                  handleFormChange();
                                }}
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
                            value={field.value}
                            onValueChange={(value: string) => {
                              field.onChange(value);
                              handleFormChange();
                            }}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Priority is the level of urgency of your todo." />
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
                  </div>
                </PopoverContent>
              </Popover>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the selected todo.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <FormField
            control={form.control}
            name="done"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Done</FormLabel>
                  <FormDescription>Mark your todo as done.</FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(value: boolean) => {
                      field.onChange(value);
                      handleFormChange();
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default EditTodoForm;
