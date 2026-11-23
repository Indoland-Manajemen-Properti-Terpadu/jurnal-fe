import { render, screen } from '@test-utils';
import {
  emptyRequestForm,
  validateRequestForm,
  type RequestFormValues,
} from '@/module/purchases/domain/requestForm';
import { RequestInfoSection } from './RequestInfoSection';

const renderSection = (values: RequestFormValues, showErrors = false) =>
  render(
    <RequestInfoSection
      values={values}
      errors={validateRequestForm(values)}
      showErrors={showErrors}
      departments={[{ id: 'd1', name: 'Engineering' }]}
      departmentsLoading={false}
      warehouses={[{ id: 'w1', name: 'Gudang lt 10' }]}
      warehousesLoading={false}
      onChange={vi.fn()}
    />
  );

describe('RequestInfoSection, delivery location', () => {
  it('asks where the goods go when a line is goods', () => {
    renderSection(emptyRequestForm('2026-11-23'));
    expect(screen.getByRole('textbox', { name: /Lokasi kirim/ })).toBeInTheDocument();
  });

  it('does not ask when every line is a service', () => {
    const values = emptyRequestForm('2026-11-23');
    values.items[0].kind = 'SERVICE';
    renderSection(values);
    expect(screen.queryByRole('textbox', { name: /Lokasi kirim/ })).not.toBeInTheDocument();
  });

  it('shows the warehouse that is chosen', () => {
    const values = emptyRequestForm('2026-11-23');
    values.deliveryWarehouseId = 'w1';
    renderSection(values);
    expect(screen.getByRole('textbox', { name: /Lokasi kirim/ })).toHaveValue('Gudang lt 10');
  });

  it('says a warehouse is needed once the form is checked', () => {
    renderSection(emptyRequestForm('2026-11-23'), true);
    expect(screen.getByText('Pilih gudang tujuan barang')).toBeInTheDocument();
  });
});
