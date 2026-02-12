"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { deletePriceTierAction } from "@/features/b2b/price-tiers/api/actions";
import type { PriceTierDetail } from "@/features/b2b/price-tiers/api/queries";
import type { AdminProductList } from "@/features/products/api/queries";
import { PriceTierForm } from "./_components/price-tier-form";
import { PricesTable } from "./_components/prices-table";

type Props = {
	tier: PriceTierDetail;
	products: AdminProductList;
};

export function PriceTierFormContainer({ tier, products }: Props) {
	const router = useRouter();

	const handleDelete = async () => {
		const result = await deletePriceTierAction({ id: tier.id });
		if (result.success) {
			toast.success("Cenová skupina bola vymazaná");
			router.push("/admin/b2b/price-tiers");
		} else {
			toast.error("Nepodarilo sa vymazať cenovú skupinu");
		}
	};

	return (
		<div className="space-y-8">
			<PriceTierForm tier={tier}>
				{({ isPending }) => (
					<div className="flex items-center justify-between gap-2">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button size="sm" type="button" variant="destructive">
									Vymazať
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Vymazať cenovú skupinu?</AlertDialogTitle>
									<AlertDialogDescription>
										Táto akcia je nevratná. Všetky ceny priradené k tejto
										skupine budú tiež vymazané.
									</AlertDialogDescription>
								</AlertDialogHeader>
								<AlertDialogFooter>
									<AlertDialogCancel>Zrušiť</AlertDialogCancel>
									<AlertDialogAction onClick={handleDelete}>
										Vymazať
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
						<Button disabled={isPending} size="sm" type="submit">
							Uložiť
							{isPending ? <Spinner /> : <Kbd>&#8984;S</Kbd>}
						</Button>
					</div>
				)}
			</PriceTierForm>

			<PricesTable products={products} tier={tier} />
		</div>
	);
}
