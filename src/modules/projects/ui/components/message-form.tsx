import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import { ArrowUpIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Form } from "@/components/ui/form";
import TextareaAutosize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Usage } from "./usage";
import { useRouter } from "next/navigation";

interface Props {
  projectId: string;
}

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Message is required" })
    //.max(1000, { message: "Message is too long" }),
});

const MessageForm = ({ projectId }: Props) => {
  const [isFocused, setIsFocused] = useState(false);
 

  

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: usage } = useQuery(trpc.usage.status.queryOptions());

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createMessage = useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.invalidateQueries(
          trpc.messages.getMany.queryOptions({ projectId })
        );

        //Invalidate usage stats
        queryClient.invalidateQueries(trpc.usage.status.queryOptions());
      },
      onError: (error) => {
        //redirect to pricing page if specific error
        toast.error(error.message);
        if(error.data?.code === "TOO_MANY_REQUESTS"){
          router.push("/pricing");
        }
      },
    })
  );

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createMessage.mutateAsync({
      projectId,
      value: values.value,
    });
  };

  const isPending = createMessage.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;
  const showUsage = !!usage;

  return (
    <Form {...form}>
      {showUsage && <Usage points={usage.remainingPoints} msBeforeNext={usage.msBeforeNext} />}
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          isFocused && "shadow-xs",
          showUsage && "rounded-t-none"
        )}
      >
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <TextareaAutosize
              disabled={isPending}
              {...field}
              placeholder="What do you want to build?"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-none bg-transparent"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />
        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex  h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono">
              <span>&#8984; </span>
              Enter
            </kbd>
            &nbsp; to submit
          </div>
          <Button
            disabled={isButtonDisabled}
            className={cn(
              "size-8 rounded-full",
              isButtonDisabled && "bg-muted-foreground border"
            )}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MessageForm;
