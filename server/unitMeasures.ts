export function unitMeasureKey(unit: { name: string; abbreviation?: string | null }) {
  return (unit.abbreviation || unit.name).trim();
}

export function canDeleteUnitMeasure(productCount: number) {
  return productCount === 0;
}
