"use client";
// import prisma from "@/lib/db";
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { Mutation, useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// import { Suspense } from "react";
// import { dehydrate, HydrationBoundary, queryOptions } from "@tanstack/react-query";
// import { getQueryClient, trpc } from '../trpc/server';
// import Client from './client';

// const Page = async () => {
//   const queryClient = getQueryClient();
//   void queryClient.prefetchQuery(trpc.hello.queryOptions({ text: "Sarthak Prefetch" }));
//   // const posts = await prisma.post.findMany();
//   return (
//     <HydrationBoundary state={dehydrate(queryClient)}>
//       <Suspense fallback={<div>Loading...</div>}>
//         <Client />
//       </Suspense >
//     </HydrationBoundary >
//   );
// };

const Page = () => {
  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  return (
    <div className="h-screen bg-emerald-400 flex items-center justify-center">
      <Input value={value} onChange={(e) => setValue(e.target.value)} className="w-1/2" />
      <Button className="bg-brown text-black" onClick={() => invoke.mutate({ value: value })}>
        Invoke Background Job
      </Button>
    </div>
  )
}

export default Page;