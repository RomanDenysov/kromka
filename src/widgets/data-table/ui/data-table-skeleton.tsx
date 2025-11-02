/** biome-ignore-all lint/nursery/noShadow: biome-ignore lint/suspicious/noShadowRestrictedNames */
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DataTableSkeletonProps = {
  columnCount: number;
  rowCount: number;
};

export function DataTableSkeleton({
  columnCount,
  rowCount,
}: DataTableSkeletonProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columnCount }).map((_, index) => (
            <TableHead key={`column-${index.toString()}`}>
              <Skeleton className="h-4 w-full" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rowCount }).map((_, rowIndex) => (
          <TableRow key={`row-${rowIndex.toString()}`}>
            {Array.from({ length: columnCount }).map((_, index) => (
              <TableCell
                key={`cell-${rowIndex.toString()}-${index.toString()}-${index.toString()}`}
              >
                <Skeleton className="h-4 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
