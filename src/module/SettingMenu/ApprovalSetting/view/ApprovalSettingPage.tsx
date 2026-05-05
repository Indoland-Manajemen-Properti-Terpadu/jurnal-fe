import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router';
import ApprovalSettingLayout from './Layout';

function ApprovalSettingPage() {
    return (
        <ApprovalSettingLayout>
            <BaseModulePage
                title="Approval Setting"
                description="Modul dasar Approval Setting. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.approvalSetting}
            />
        </ApprovalSettingLayout>
    );
}

export default ApprovalSettingPage;
