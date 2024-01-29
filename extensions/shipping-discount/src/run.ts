import type { RunInput, FunctionRunResult, Target } from "../generated/api";

const EMPTY_DISCOUNT: FunctionRunResult = {
  discounts: [],
};

type Configuration = {};

export function run(input: RunInput): FunctionRunResult {
  const configuration: Configuration = JSON.parse(
    input?.discountNode?.metafield?.value ?? "{}",
  );
  const targets: Target[] = input.cart.deliveryGroups.reduce((acc, group) => {
    const optionTargets: Target[] = group.deliveryOptions.map((option) => {
      return { deliveryOption: { handle: option.handle } };
    });
    return [...acc, ...optionTargets];
  }, [] as Target[]);

  if (input.cart.cost.subtotalAmount.amount >= 90) {
    return {
      discounts: [
        {
          targets,
          value: {
            percentage: {
              value: "100",
            },
          },
          message: "Shipping is on us. Enjoy!",
        },
      ],
    };
  }

  return EMPTY_DISCOUNT;
}
