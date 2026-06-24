// "use client";
// import prisma from "@/lib/db";
// import { Button } from "@/components/ui/button"


import { Suspense } from "react";
import { dehydrate, HydrationBoundary, queryOptions } from "@tanstack/react-query";
import { getQueryClient, trpc } from '../trpc/server';
import Client from './client';

const Page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.hello.queryOptions({ text: "Sarthak Prefetch" }));
  // const posts = await prisma.post.findMany();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client />
      </Suspense >
    </HydrationBoundary >
  );
};

export default Page;