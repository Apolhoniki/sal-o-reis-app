export function formatBRLCurrency(input: string): string {
  // Extract digits only
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) {
    return 'R$ 0,00';
  }
  const numericValue = parseInt(digitsOnly, 10) / 100;
  return numericValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
