import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import CostLayout from './Layout';

function CostPage() {
    return (
        <CostLayout>
            <BaseModulePage
                title="Biaya"
                description="Modul dasar Biaya. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.cost}
            />
        </CostLayout>
    );
}

export default CostPage;
