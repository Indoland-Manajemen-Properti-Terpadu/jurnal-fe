import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router';
import KontakLayout from './Layout';

function KontakPage() {
    return (
        <KontakLayout>
            <BaseModulePage
                title="Kontak"
                description="Modul dasar Kontak Master Data. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.contactsMaster}
            />
        </KontakLayout>
    );
}

export default KontakPage;
