import type { RunInput, FunctionRunResult } from "../generated/api";
import { DiscountApplicationStrategy } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}",
  );

  if (input.cart.cost.subtotalAmount.amount >= 200) {
    return {
      discountApplicationStrategy: DiscountApplicationStrategy.First,
      discounts: [
        {
          value: {
            percentage: {
              value: "10",
            },
          },
          message: "10% off orders over $200",
          targets: [
            {
              orderSubtotal: {
                excludedVariantIds: [],
              },
            },
          ],
        },
      ],
    };
  }

  return EMPTY_DISCOUNT;
}
