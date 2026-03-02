import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
    <div>hello</div>
    <Button>clcick me</Button>
    <UserButton/>
    </div>
  );
}
