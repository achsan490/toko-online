import { Product, TierPrice, OrderItem } from "@/types";

/**
 * Calculates the appropriate unit price based on the selected quantity and product tier pricing
 */
export function getProductUnitPrice(product: Product, quantity: number): {
  unitPrice: number;
  appliedTier: TierPrice | null;
  isWholesale: boolean;
  savingsPerUnit: number;
} {
  if (!product.tierPrices || product.tierPrices.length === 0) {
    return {
      unitPrice: product.regularPrice,
      appliedTier: null,
      isWholesale: false,
      savingsPerUnit: 0,
    };
  }

  // Sort tiers by minQty ascending
  const sortedTiers = [...product.tierPrices].sort((a, b) => a.minQty - b.minQty);

  // Find matching tier
  // If quantity fits within minQty and maxQty (or maxQty is null/infinity)
  let matchedTier: TierPrice | null = null;

  for (const tier of sortedTiers) {
    const min = tier.minQty;
    const max = tier.maxQty !== null && tier.maxQty !== undefined ? tier.maxQty : Infinity;
    if (quantity >= min && quantity <= max) {
      matchedTier = tier;
    }
  }

  if (matchedTier) {
    const savingsPerUnit = Math.max(0, product.regularPrice - matchedTier.price);
    return {
      unitPrice: matchedTier.price,
      appliedTier: matchedTier,
      isWholesale: true,
      savingsPerUnit,
    };
  }

  return {
    unitPrice: product.regularPrice,
    appliedTier: null,
    isWholesale: false,
    savingsPerUnit: 0,
  };
}

/**
 * Find the next tier to encourage user to buy more ("Beli X lagi dapat harga Rp Y!")
 */
export function getNextWholesaleTier(product: Product, currentQty: number): {
  nextTier: TierPrice | null;
  itemsNeeded: number;
  potentialPrice: number;
} | null {
  if (!product.tierPrices || product.tierPrices.length === 0) return null;

  const sortedTiers = [...product.tierPrices].sort((a, b) => a.minQty - b.minQty);
  for (const tier of sortedTiers) {
    if (tier.minQty > currentQty) {
      return {
        nextTier: tier,
        itemsNeeded: tier.minQty - currentQty,
        potentialPrice: tier.price,
      };
    }
  }

  return null;
}

/**
 * Converts a product and quantity into a calculated OrderItem
 */
export function calculateOrderItem(product: Product, quantity: number): OrderItem {
  const { unitPrice, appliedTier, savingsPerUnit } = getProductUnitPrice(product, quantity);
  const subtotal = unitPrice * quantity;
  const savings = savingsPerUnit * quantity;

  return {
    productId: product.id,
    productName: product.name,
    unit: product.unit,
    quantity,
    regularPrice: product.regularPrice,
    priceApplied: unitPrice,
    tierLabel: appliedTier?.label || (appliedTier ? `Grosir (Min ${appliedTier.minQty} ${product.unit})` : undefined),
    subtotal,
    savings,
    imageUrl: product.imageUrl,
  };
}

/**
 * Format number to Indonesian Rupiah (Rp XX.XXX)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
