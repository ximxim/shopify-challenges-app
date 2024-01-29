import type {
  RunInput,
  FunctionRunResult,
  FunctionResult,
  Target,
  ProductVariant,
  DeliverableCartLine,
} from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput): FunctionRunResult {
  const discounts: FunctionResult["discounts"] = [];
  const shoesDiscount = bulkDiscount(input, "shoes", 4, 5);
  const socksDiscount = bulkDiscount(input, "socks", 5, 5);
  const targets: Target[] = input.cart.lines
    .filter((line) => line.merchandise.__typename == "ProductVariant")
    .map((line) => {
      const variant = line.merchandise as ProductVariant;
      return { productVariant: { id: variant.id, quantity: line.quantity } };
    });

  if (shoesDiscount) {
    discounts.push(shoesDiscount);
  }

  if (socksDiscount) {
    discounts.push(socksDiscount);
  }

  if (discounts) {
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.All,
      discounts,
    };
  }

  return EMPTY_DISCOUNT;
}

function bulkDiscount(
  input: RunInput,
  productType: "shoes" | "socks",
  groupCount: number,
  discountAmountPerItem: number,
): FunctionResult["discounts"][0] | null {
  const items = input.cart.lines.filter(
    (line) =>
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.product.productType === productType,
  );
  const totalQuantity = items.reduce((acc, line) => acc + line.quantity, 0);

  if (totalQuantity >= groupCount) {
    let qualifyingQuantity =
      Math.floor(totalQuantity / groupCount) * groupCount;
    const targets: Target[] = items
      .sort((a, b) => b.quantity - a.quantity)
      .reduce((acc, line) => {
        const variant = line.merchandise as ProductVariant;

        if (qualifyingQuantity === 0) return acc;

        const quantity =
          qualifyingQuantity < line.quantity
            ? qualifyingQuantity
            : line.quantity;
        qualifyingQuantity -= line.quantity;

        if (quantity <= 0) return acc;

        return [
          ...acc,
          {
            productVariant: {
              id: variant.id,
              quantity,
            },
          },
        ];
      }, [] as Target[]);

    return {
      targets,
      value: {
        fixedAmount: {
          amount: discountAmountPerItem,
          appliesToEachItem: true,
        },
      },
    };
  }

  return null;
}
