import { DaySchedule } from '../types';

export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const WEEKDAY_NAMES_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export function parseDateFromId(id: string) {
  const parts = id.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10); // 1-12
    const day = parseInt(parts[2], 10); // 1-31
    return { year, month, day };
  }
  return { year: 2026, month: 7, day: 1 };
}

export function formatMonthYearLabel(year: number, month: number): string {
  const monthName = MONTH_NAMES_PT[month - 1] || 'Mês';
  return `${monthName} de ${year}`;
}

/**
 * Generates realistic schedule days for multiple months starting from July 2026
 */
export function generateInitialScheduleDays(): DaySchedule[] {
  const result: DaySchedule[] = [];
  // July (6 = July in 0-index), August, September, October 2026
  const startYear = 2026;
  const startMonthIndex = 6; // July
  const numberOfMonths = 4;

  for (let m = 0; m < numberOfMonths; m++) {
    const year = startYear;
    const monthIndex = startMonthIndex + m;
    const dateObjHelper = new Date(year, monthIndex, 1);
    const actualYear = dateObjHelper.getFullYear();
    const actualMonthIndex = dateObjHelper.getMonth(); // 0-indexed
    const monthNumber = actualMonthIndex + 1; // 1-indexed

    const daysInMonth = new Date(actualYear, actualMonthIndex + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dObj = new Date(actualYear, actualMonthIndex, day);
      const dayOfWeekIndex = dObj.getDay();
      const dayOfWeekStr = WEEKDAY_NAMES_PT[dayOfWeekIndex];

      const yyyy = actualYear.toString();
      const mm = monthNumber.toString().padStart(2, '0');
      const dd = day.toString().padStart(2, '0');

      const id = `${yyyy}-${mm}-${dd}`;
      const dateFormatted = `${dd}/${mm}/${yyyy}`;
      const dayNumber = `Dia ${dd}`;

      // Sundays (0) and Mondays (1) closed by default
      const isClosedDay = dayOfWeekIndex === 0 || dayOfWeekIndex === 1;

      let periods = { manha: true, tarde: true, noite: true };
      let status: 'verde' | 'amarelo' | 'vermelho' = 'verde';
      let statusLabel = 'DISPONÍVEL: Manhã, Tarde e Noite';
      let isBlocked = false;

      if (isClosedDay) {
        periods = { manha: false, tarde: false, noite: false };
        status = 'vermelho';
        statusLabel = 'FECHADO (FOLGA DA EQUIPE)';
        isBlocked = true;
      } else {
        // Sample availability algorithm
        const seed = (day * 3 + monthNumber * 7) % 8;
        if (seed === 1 || seed === 4) {
          periods = { manha: false, tarde: true, noite: true };
          status = 'amarelo';
          statusLabel = 'DISPONÍVEL APENAS: Tarde e Noite';
        } else if (seed === 2) {
          periods = { manha: true, tarde: true, noite: false };
          status = 'amarelo';
          statusLabel = 'DISPONÍVEL APENAS: Manhã e Tarde';
        } else if (seed === 5) {
          periods = { manha: false, tarde: true, noite: false };
          status = 'amarelo';
          statusLabel = 'DISPONÍVEL APENAS: Tarde';
        } else if (seed === 7) {
          periods = { manha: false, tarde: false, noite: false };
          status = 'vermelho';
          statusLabel = 'NÃO HÁ HORÁRIOS DISPONÍVEIS HOJE';
          isBlocked = true;
        }
      }

      result.push({
        id,
        dayOfWeek: dayOfWeekStr,
        dayNumber,
        dateFormatted,
        periods,
        status,
        statusLabel,
        isBlocked,
      });
    }
  }

  return result;
}
