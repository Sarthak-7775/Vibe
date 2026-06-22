// import prisma from "@/lib/db";
import { Button } from "@/components/ui/button"

const Page = () => {
  // const posts = await prisma.post.findMany();
  return (
    <div>
      {
        <Button variant="secondary" className="font-black text-5xl border-black">
          Hello
        </Button>
      }

      {/* {JSON.stringify(posts, null, 2)} */}
    </div>
  );
};

export default Page;