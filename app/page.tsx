import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LibraryBig, MapPin, ScanBarcode } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-container justify-center items-center gap-5">
      <Badge className="bg-cred-yellow-100 border-cred-yellow-400 text-black">
        <MapPin />
        WS Hub 2 – North Lawndale
      </Badge>
      <h1 className="h1 text-center">
        Welcome to the <br />
        CRED Library.
      </h1>
      <h2 className="h2">What would you like to do today?</h2>

      <div className="flex gap-10">
        <Button
          asChild
          className="bg-cred-yellow-400 hover:bg-cred-yellow-500 text-black"
        >
          <Link href="/checkout">
            <ScanBarcode />
            Check out a book
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/return">
            <LibraryBig />
            Return a book
          </Link>
        </Button>
      </div>
    </div>
  );
}
