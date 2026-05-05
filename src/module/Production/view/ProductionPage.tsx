import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router';
import ProductionLayout from './Layout';

function ProductionPage() {
    return (
        <ProductionLayout>
            <BaseModulePage
                title="Produksi"
                description="Modul dasar Produksi. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.production}
            />
        </ProductionLayout>
    );
}

export default ProductionPage;
