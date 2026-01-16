/**
 * Returns a string representing the number of items in a cart.
 * @param count - The number of items in the cart.
 * @returns A string representing the number of items in the cart.
 */
export const getItemCountString = (count: number): string =>
  count === 1
    ? `${count} položka`
    : // biome-ignore lint/style/noNestedTernary: simple case keep
      count < 5
      ? `${count} položky`
      : `${count} položiek`;
