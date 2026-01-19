import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  trend: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, trend, icon: Icon }: StatCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-2xl">
          {value}
        </CardTitle>
        <CardAction className="my-auto">
          <div className="bg-secondary text-primary flex aspect-square size-10 items-center justify-center border rounded-lg">
            <Icon strokeWidth={1.5} />
          </div>
        </CardAction>
      </CardHeader>
      <CardFooter className="flex-col items-start text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Compared to last week
          <Badge variant="outline">{trend}</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
