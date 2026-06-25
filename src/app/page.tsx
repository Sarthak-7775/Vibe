"use client";
// import prisma from "@/lib/db";
import { Button } from "@/components/ui/button"
import { useTRPC } from "@/trpc/client"
import { Mutation, useMutation } from "@tanstack/react-query";

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
  const trpc = useTRPC();
  const invoke = useMutation(trpc.invoke.mutationOptions({}));

  return (
    <div className="h-screen bg-black">
      <Button onClick={() => invoke.mutate({ text: "Sarthak" })}>
        Invoke Background Job
      </Button>
    </div>
  )
}

export default Page;