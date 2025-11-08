"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PriceFormSchema } from "../schema";
import { AddPriceRuleDialog } from "./add-price-rule-dialog";

const CENTS_PER_EURO = 100;

type PricingTableProps = {
  prices: PriceFormSchema[];
  onAddPrice: (price: PriceFormSchema) => void;
  onEditPrice: (index: number, price: PriceFormSchema) => void;
  onDeletePrice: (index: number) => void;
};

export function PricingTable({
  prices,
  onAddPrice,
  onEditPrice,
  onDeletePrice,
}: PricingTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<PriceFormSchema | null>(
    null
  );

  const handleOpenAddDialog = () => {
    setEditingIndex(null);
    setEditingPrice(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (index: number, price: PriceFormSchema) => {
    setEditingIndex(index);
    setEditingPrice(price);
    setIsDialogOpen(true);
  };

  const handleSubmitPrice = (price: PriceFormSchema) => {
    if (editingIndex !== null) {
      onEditPrice(editingIndex, price);
    } else {
      onAddPrice(price);
    }
    setIsDialogOpen(false);
    setEditingIndex(null);
    setEditingPrice(null);
  };

  const handleDeletePrice = (index: number) => {
    if (window.confirm("Are you sure you want to delete this price rule?")) {
      onDeletePrice(index);
    }
  };

  return (
    <div className="space-y-4">
      {prices.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No prices configured. Add price rules to continue.
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead>For</TableHead>
                <TableHead>Price (€)</TableHead>
                <TableHead>Min Qty</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((price, index) => (
                <TableRow key={price.id ?? index}>
                  <TableCell>
                    <Badge variant="outline">{price.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    {price.orgId ? (
                      <span className="text-sm">Specific Org</span>
                    ) : (
                      <span className="text-sm">All Customers</span>
                    )}
                  </TableCell>
                  <TableCell>
                    €{(price.amountCents / CENTS_PER_EURO).toFixed(2)}
                  </TableCell>
                  <TableCell>{price.minQty}</TableCell>
                  <TableCell>{price.priority}</TableCell>
                  <TableCell>
                    {price.isActive ? (
                      <Badge size="xs" variant="default">
                        Active
                      </Badge>
                    ) : (
                      <Badge size="xs" variant="secondary">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleOpenEditDialog(index, price)}
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeletePrice(index)}
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <Button
        onClick={handleOpenAddDialog}
        size="sm"
        type="button"
        variant="outline"
      >
        + Add Price Rule
      </Button>

      <AddPriceRuleDialog
        editingPrice={editingPrice}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingIndex(null);
          setEditingPrice(null);
        }}
        onSubmit={handleSubmitPrice}
        open={isDialogOpen}
      />
    </div>
  );
}
