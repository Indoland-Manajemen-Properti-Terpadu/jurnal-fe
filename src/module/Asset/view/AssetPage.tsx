import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router';
import AssetLayout from './Layout';

function AssetPage() {
    return (
        <AssetLayout>
            <BaseModulePage
                title="Asset"
                description="Modul dasar Asset Master Data. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.assetMaster}
            />
        </AssetLayout>
    );
}

export default AssetPage;
