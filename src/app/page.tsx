"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useInfiniteQuery } from "@tanstack/react-query"
import { CheckIcon, SortAscIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandInput, CommandItem } from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { MenuList } from "@/components/menu-list"

const FormSchema = z.object({
  row: z.string({
    required_error: "Please select a language.",
  }),
})

async function fetchServerPage(
  limit: number,
  offset: number = 0
): Promise<{ rows: string[]; nextOffset: number }> {
  const rows = new Array(limit)
    .fill(0)
    .map((e, i) => `Async loaded row #${i + offset * limit}`)

  await new Promise((r) => setTimeout(r, 500))

  return { rows, nextOffset: offset + 1 }
}

export default function Home() {
  const [open, setOpen] = useState(false)

  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useInfiniteQuery(
      ["projects"],
      (ctx) => fetchServerPage(10, ctx.pageParam),
      {
        getNextPageParam: (_lastGroup, groups) => groups.length,
      }
    )

  const allRows = data ? data.pages.flatMap((d) => d.rows) : []

  const loadMoreOptions = () => {
    if (isFetchingNextPage || !hasNextPage) return
    fetchNextPage()
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="row"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Language</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "mt-2 w-[200px] h-[50px] justify-between ",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? allRows.find(
                                (language) => language === field.value
                              )
                            : "Select language"}
                          <SortAscIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search row..."
                          className="h-9"
                        />
                        <MenuList loadMoreOptions={loadMoreOptions}>
                          {allRows.map((row) => (
                            <CommandItem
                              value={row}
                              key={row}
                              onSelect={() => {
                                form.setValue("row", row)
                                setOpen(false)
                              }}
                            >
                              {row}
                              <CheckIcon
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  row === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </MenuList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    This is the language that will be used in the dashboard.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </main>
  )
}
