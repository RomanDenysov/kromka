"use client";

import { ShoppingCartIcon } from "lucide-react";
import { useTransition } from "react";
import { addToB2bCart, addToCart } from "@/features/cart/api/actions";
import { analytics } from "@/lib/analytics";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

type ProductInfo = {
	name: string;
	price: number;
};

type Props = {
	id: string;
	disabled?: boolean;
	product?: ProductInfo;
};

function useAddToCart(
	id: string,
	product: ProductInfo | undefined,
	action: (id: string, qty: number) => Promise<void>,
	cartType: "b2c" | "b2b",
) {
	const [isPending, startTransition] = useTransition();

	const handleClick = () => {
		startTransition(async () => {
			await action(id, 1);
			if (product) {
				analytics.productAdded({
					product_id: id,
					product_name: product.name,
					price: product.price,
					quantity: 1,
					cart_type: cartType,
				});
			}
		});
	};

	return { isPending, handleClick };
}

export function AddToCartButton({ id, disabled = false, product }: Props) {
	const { isPending, handleClick } = useAddToCart(id, product, addToCart, "b2c");

	return (
		<Button
			className="z-10 w-full md:w-auto"
			disabled={isPending || disabled}
			onClick={handleClick}
			size="sm"
		>
			{isPending ? <Spinner /> : <ShoppingCartIcon />}
			<span>Do košíka</span>
		</Button>
	);
}

export function AddToCartButtonIcon({ id, disabled = false, product }: Props) {
	const { isPending, handleClick } = useAddToCart(id, product, addToCart, "b2c");

	return (
		<Button
			className="h-10 w-10 shrink-0 rounded-full bg-white text-black shadow-md transition-all hover:scale-105 hover:bg-white/90"
			disabled={isPending || disabled}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleClick();
			}}
			size="icon"
		>
			{isPending ? (
				<Spinner className="size-5" />
			) : (
				<ShoppingCartIcon className="size-5" />
			)}
			<span className="sr-only">Do košíka</span>
		</Button>
	);
}

export function AddToB2bCartButton({ id, disabled = false, product }: Props) {
	const { isPending, handleClick } = useAddToCart(
		id,
		product,
		addToB2bCart,
		"b2b",
	);

	return (
		<Button
			className="z-10 w-full md:w-auto"
			disabled={isPending || disabled}
			onClick={handleClick}
			size="sm"
		>
			{isPending ? <Spinner /> : <ShoppingCartIcon />}
			<span>Do košíka</span>
		</Button>
	);
}

export function AddToB2bCartButtonIcon({
	id,
	disabled = false,
	product,
}: Props) {
	const { isPending, handleClick } = useAddToCart(
		id,
		product,
		addToB2bCart,
		"b2b",
	);

	return (
		<Button
			className="h-10 w-10 shrink-0 rounded-full bg-white text-black shadow-md transition-all hover:scale-105 hover:bg-white/90"
			disabled={isPending || disabled}
			onClick={(e) => {
				e.preventDefault();
				e.stopPropagation();
				handleClick();
			}}
			size="icon"
		>
			{isPending ? (
				<Spinner className="size-5" />
			) : (
				<ShoppingCartIcon className="size-5" />
			)}
			<span className="sr-only">Do košíka</span>
		</Button>
	);
}
