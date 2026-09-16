// Exact decimal arithmetic for money calculations, avoiding the classic
// binary floating-point rounding errors that plain `Number` multiplication
// introduces (e.g. `1.005 * 100 === 100.49999999999999`, not `100.5`).

function parseDecimal(value) {
  const str = String(value);
  const negative = str.startsWith('-');
  const abs = negative ? str.slice(1) : str;
  const [wholeRaw, fracRaw = ''] = abs.split('.');
  const whole = wholeRaw === '' ? '0' : wholeRaw;

  return {
    sign: negative ? -1n : 1n,
    digits: BigInt(whole + fracRaw),
    scale: fracRaw.length,
  };
}

function roundBigIntDiv(numerator, denominator) {
  const quotient = numerator / denominator;
  const remainder = numerator % denominator;

  return remainder * 2n >= denominator ? quotient + 1n : quotient;
}

/**
 * Computes round(a * b * 10^resultScale) as an exact integer, using BigInt
 * digit arithmetic instead of floating-point multiplication. `a` and `b` may
 * be numbers or numeric strings with any number of decimal places.
 */
export function roundDecimalToScaledInt(a, b, resultScale) {
  const pa = parseDecimal(a);
  const pb = parseDecimal(b);
  const sign = pa.sign * pb.sign;
  const productDigits = pa.digits * pb.digits;
  const totalScale = pa.scale + pb.scale;

  const result =
    totalScale >= resultScale
      ? roundBigIntDiv(productDigits, 10n ** BigInt(totalScale - resultScale))
      : productDigits * 10n ** BigInt(resultScale - totalScale);

  return Number(sign * result);
}

/**
 * Computes an item's subtotal and tax-inclusive total, rounding to the
 * nearest cent at each step using exact decimal arithmetic.
 */
export function computeItemTotals(cost, qty, taxSlots) {
  const subtotalCents = roundDecimalToScaledInt(cost, qty, 2);
  const subtotal = subtotalCents / 100;

  const taxCents = taxSlots.reduce(
    // subtotal * rate is already numerically equal to the tax amount in
    // cents (rate is expressed "per hundred"), so rounding it to 0 decimal
    // places directly yields whole cents.
    (sum, slot) => sum + roundDecimalToScaledInt(subtotal, slot.rate, 0),
    0,
  );

  const total = (subtotalCents + taxCents) / 100;

  return { subtotal, total };
}
