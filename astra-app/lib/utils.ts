import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert FLOW amount to wei (18 decimals)
export function flowToWei(flowAmount: number): bigint {
  return BigInt(Math.floor(flowAmount * 10 ** 18))
}

// Convert wei to FLOW
export function weiToFlow(weiAmount: bigint): number {
  return Number(weiAmount) / 10 ** 18
}
