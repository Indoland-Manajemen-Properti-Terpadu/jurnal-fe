import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import BudgetPlanningLayout from './Layout';

function BudgetPlanningPage() {
    return (
        <BudgetPlanningLayout>
            <BaseModulePage
                title="Perencanaan Anggaran"
                description="Modul dasar Perencanaan Anggaran. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.budgetPlanning}
            />
        </BudgetPlanningLayout>
    );
}

export default BudgetPlanningPage;
