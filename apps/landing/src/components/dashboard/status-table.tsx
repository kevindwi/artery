import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Code } from "lucide-react";

interface StatusItem {
  name: string;
  status: string;
  color: string;
}

interface StatusTableProps {
  title: string;
  description: string;
  items: StatusItem[];
}

export function StatusTable({ title, description, items }: StatusTableProps) {
  return (
    <Card className="gap-0 pb-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b pb-4 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <Table>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="p-6">
                    <div className="flex gap-2 items-center">
                      <Code
                        strokeWidth={1.5}
                        className="size-4 text-muted-foreground"
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="p-6">
                    <div className="w-full flex items-center justify-end gap-4">
                      <span className="text-muted-foreground">
                        {item.status}
                      </span>
                      <span className={`size-2 rounded-full ${item.color}`} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
