import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router';
import CompanySettingLayout from './Layout';

function CompanySettingPage() {
    return (
        <CompanySettingLayout>
            <BaseModulePage
                title="Company Setting"
                description="Modul dasar Company Setting. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.companySetting}
            />
        </CompanySettingLayout>
    );
}

export default CompanySettingPage;
