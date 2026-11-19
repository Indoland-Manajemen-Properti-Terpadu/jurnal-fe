import type { CreateSaleItemForm, DiscountType } from './sale';
import { dueDateFromTerm, emptyLine, type StepErrors } from './saleForm';
import type { SaleOrder } from './saleOrder';

export type OrderStepId = 'general' | 'lines' | 'extras';
export const ORDER_STEPS: OrderStepId[] = ['general', 'lines', 'extras'];

export interface OrderFormValues {
  customer: string;
  transactionNumber: string;
  transactionDate: string;
  targetDate: string;
  deliveryAddress: string;
  paymentTerm: string;
  unitTower: string;
  customerRefNumber: string;
  isPriceIncludeTax: boolean;
  items: CreateSaleItemForm[];
  discountType: DiscountType;
  discountValue: number;
  terms: string;
  message: string;
  memo: string;
}

/** The work is due a month after the order unless the user picks another day. */
export const DEFAULT_ORDER_DAYS = 30;

export const emptyOrderForm = (today: string): OrderFormValues => ({
  customer: '',
  transactionNumber: '',
  transactionDate: today,
  targetDate: dueDateFromTerm(today, DEFAULT_ORDER_DAYS),
  deliveryAddress: '',
  paymentTerm: '',
  unitTower: '',
  customerRefNumber: '',
  isPriceIncludeTax: false,
  items: [emptyLine()],
  discountType: 'percentage',
  discountValue: 0,
  terms: '',
  message: '',
  memo: '',
});

const validateGeneral = (values: OrderFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (!values.customer) errors.customer = 'validation.customerRequired';
  if (!values.transactionDate) errors.transactionDate = 'validation.transactionDateRequired';
  if (!values.targetDate) errors.targetDate = 'validation.targetDateRequired';
  else if (values.transactionDate && values.targetDate < values.transactionDate) {
    errors.targetDate = 'validation.targetBeforeDate';
  }
  return errors;
};

const validateLines = (values: OrderFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.items.length === 0) errors.lines = 'validation.linesRequired';
  values.items.forEach((item, index) => {
    if (!item.productId) errors[`items.${index}.productId`] = 'validation.productRequired';
    if (!(item.quantity > 0)) errors[`items.${index}.quantity`] = 'validation.quantityMin';
    if (item.unitPrice < 0) errors[`items.${index}.unitPrice`] = 'validation.priceNegative';
  });
  return errors;
};

const validateExtras = (values: OrderFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.discountValue < 0) errors.discountValue = 'validation.discountNegative';
  if (values.discountType === 'percentage' && values.discountValue > 100) {
    errors.discountValue = 'validation.discountPercent';
  }
  return errors;
};

export const validateOrderStep = (step: OrderStepId, values: OrderFormValues): StepErrors => {
  if (step === 'general') return validateGeneral(values);
  if (step === 'lines') return validateLines(values);
  return validateExtras(values);
};

/** An order has no journal, so saving needs only what the API requires. */
export const canSaveOrder = (values: OrderFormValues): boolean =>
  ORDER_STEPS.every((step) => Object.keys(validateOrderStep(step, values)).length === 0);

const day = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : '');

/** Form values of a stored order, for editing it. */
export const orderToFormValues = (order: SaleOrder): OrderFormValues => ({
  customer: order.customer?.id ?? '',
  transactionNumber: order.transactionNumber,
  transactionDate: day(order.transactionDate),
  targetDate: day(order.targetDate),
  deliveryAddress: order.deliveryAddress,
  paymentTerm: order.paymentTerm?.id ?? '',
  unitTower: order.unitTower,
  customerRefNumber: order.customerRefNumber,
  isPriceIncludeTax: order.isPriceIncludeTax,
  items: order.items.map((item) => ({
    productId: item.product?.id ?? '',
    description: item.description,
    unit: '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxId: item.tax?.id ?? '',
  })),
  discountType: order.discountType ?? 'percentage',
  discountValue: order.discountValue,
  terms: order.terms,
  message: order.message,
  memo: order.memo,
});
