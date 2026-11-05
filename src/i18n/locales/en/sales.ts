import { salesCommon } from './salesCommon';
import { salesForm } from './salesForm';
import { salesList } from './salesList';
import { salesPay } from './salesPay';
import { salesPublic } from './salesPublic';
import { salesView } from './salesView';

export const sales = {
  ...salesList,
  ...salesForm,
  ...salesPay,
  ...salesPublic,
  ...salesView,
  ...salesCommon,
};
