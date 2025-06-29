
export function calculateDueDate(quarter: string, year: number): string {
  const month = quarter === 'Q1' ? 3 : quarter === 'Q2' ? 6 : quarter === 'Q3' ? 9 : 0;
  const dueYear = quarter === 'Q4' ? year + 1 : year;
  return new Date(dueYear, month, 30).toISOString().split('T')[0];
}
