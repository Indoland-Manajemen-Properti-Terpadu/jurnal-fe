import dayjs from 'dayjs';

export const getDateRange = (period: string): { startDate: string; endDate: string } => {
  const today = dayjs();
  let startDate = today;
  let endDate = today;

  switch (period) {
    case 'Today':
      startDate = today;
      endDate = today;
      break;
    case 'Yesterday':
      startDate = today.subtract(1, 'day');
      endDate = startDate;
      break;
    case 'This Week':
      startDate = today.startOf('week');
      endDate = today.endOf('week');
      break;
    case 'This Month':
      startDate = today.startOf('month');
      endDate = today.endOf('month');
      break;
    case 'This Year':
      startDate = today.startOf('year');
      endDate = today.endOf('year');
      break;
    case 'All Period':
      startDate = dayjs('1970-01-01');
      endDate = today;
      break;
    default:
      startDate = dayjs('1970-01-01');
      endDate = today;
      break;
  }

  return {
    startDate: startDate.format('MMM DD, YYYY'),
    endDate: endDate.format('MMM DD, YYYY'),
  };
};
