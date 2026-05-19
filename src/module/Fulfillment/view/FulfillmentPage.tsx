import BaseModulePage from '@/components/BaseModulePage';
import { routes } from '@/router/routes';
import FulfillmentLayout from './Layout';

function FulfillmentPage() {
    return (
        <FulfillmentLayout>
            <BaseModulePage
                title="Pemenuhan"
                description="Modul dasar Pemenuhan. Fitur detail menyusul tahap pengembangan berikutnya."
                routePath={routes.baseModules.fulfillment}
            />
        </FulfillmentLayout>
    );
}

export default FulfillmentPage;
