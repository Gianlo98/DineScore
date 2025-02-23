"use client";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { useAuth } from "@/context/authContext";
import { useHistory } from "@/hooks/useHistory";

export default function Page() {
  const { user, loading } = useAuth();
  const { sessions, isLoading } = useHistory(user);

  console.log(sessions);
  return (
    <>
      <div className="w-full py-4">
        <Table isStriped aria-label="Example static collection table">
          <TableHeader>
            <TableColumn>Date</TableColumn>
            <TableColumn>Place</TableColumn>
            <TableColumn>Score</TableColumn>
          </TableHeader>
          <TableBody>
            <>
              <TableRow key="meal">
              <TableCell className="font-bold">VITO</TableCell>
                <TableCell className="font-bold">VITO</TableCell>
                <TableCell>18</TableCell>
              </TableRow>
            </>
          </TableBody>
        </Table>
      </div>
    </>
  );
}
