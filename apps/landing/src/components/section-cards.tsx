import { TrendingUp, Cpu, Wifi } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-none *:data-[slot=card]:rounded-md *:data-[slot=card]:gap-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Device</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            20
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-blue-50 rounded text-blue-500">
              <Cpu className="size-6" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline">
              <TrendingUp className="size-4" /> +12% from this month
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Online Device</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            18
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-blue-50 rounded text-blue-500">
              <Wifi className="size-6" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline">
              <TrendingUp className="size-4" /> +12% from this month
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            45,678
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-blue-50 rounded text-blue-500">
              <Wifi className="size-6" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline">
              <TrendingUp className="size-4" /> +12% from this month
            </Badge>
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Growth Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            4.5%
          </CardTitle>
          <CardAction>
            <div className="p-1.5 bg-blue-50 rounded text-blue-500">
              <Wifi className="size-6" />
            </div>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <Badge variant="outline">
              <TrendingUp className="size-4" /> +12% from this month
            </Badge>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
