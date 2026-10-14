import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import CompanySettingLayout from './Layout';

function CompanySettingPage() {
    return (
        <CompanySettingLayout>
            <BaseModulePage
                title="Pengaturan Perusahaan"
                description="Modul dasar Pengaturan Perusahaan. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.companySetting}
            />
        </CompanySettingLayout>
    );
}

export default CompanySettingPage;
