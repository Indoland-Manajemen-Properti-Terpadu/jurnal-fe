import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import ProdukLayout from './Layout';

function ProdukPage() {
    return (
        <ProdukLayout>
            <BaseModulePage
                title="Produk"
                description="Modul dasar Produk. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.products}
            />
        </ProdukLayout>
    );
}

export default ProdukPage;
