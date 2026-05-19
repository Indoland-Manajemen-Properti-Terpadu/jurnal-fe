import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import PembelianLayout from './Layout';

function PembelianPage() {
  return (
    <PembelianLayout>
      <BaseModulePage
        title="Pembelian"
        description="Modul dasar Pembelian. Fitur detail menyusul tahap pengembangan berikutnya."
        routePath={routes.baseModules.pembelian}
      />
    </PembelianLayout>
  );
}

export default PembelianPage;
