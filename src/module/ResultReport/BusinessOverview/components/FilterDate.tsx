import React, { useState, useEffect } from "react";
import { Grid, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays } from "date-fns";

interface FilterDateProps {
    onFilterChange: (fromDate: string | undefined, toDate: string | undefined) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({ onFilterChange }) => {
    const initialFromDate = new Date("2024-01-01");
    const initialToDate = new Date();

    const [value, setValue] = useState<[Date | null, Date | null]>([initialFromDate, initialToDate]);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("All Period");

    useEffect(() => {
        const [fromDate, toDate] = value;
        const formattedFromDate = fromDate ? format(fromDate, "yyyy-MM-dd") : undefined;
        const formattedToDate = toDate ? format(toDate, "yyyy-MM-dd") : undefined;
        onFilterChange(formattedFromDate, formattedToDate);
    }, [value, onFilterChange]);

    const handlePeriodChange = (value: string | null) => {
        if (!value) return; // Prevent setting null values

        setSelectedPeriod(value);

        let newFromDate: Date | null = null;
        let newToDate: Date | null = new Date();

        switch (value) {
            case "Today":
                newFromDate = new Date();
                newToDate = new Date();
                break;
            case "Yesterday":
                newFromDate = subDays(new Date(), 1);
                newToDate = subDays(new Date(), 1);
                break;
            case "This Week":
                newFromDate = startOfWeek(new Date());
                newToDate = new Date();
                break;
            case "This Month":
                newFromDate = startOfMonth(new Date());
                newToDate = new Date();
                break;
            case "This Year":
                newFromDate = new Date(new Date().getFullYear(), 0, 1);
                newToDate = new Date();
                break;
            default:
                newFromDate = initialFromDate;
                newToDate = initialToDate;
        }

        setValue([newFromDate, newToDate]);
    };

    return (
        <Grid columns={24} gutter="sm" style={{ flexGrow: 1 }}>
            <Grid.Col span={8}>
                <DatePickerInput
                    type="range"
                    placeholder="Select start date and end date"
                    value={value}
                    valueFormat="DD/MM/YYYY"
                    onChange={setValue}
                    size="xs"
                    highlightToday
                    clearable
                    rightSection={!value ? <IconCalendar size={16} /> : null}
                    maxDate={new Date()}
                />
            </Grid.Col>

            <Grid.Col span={8}>
                <Select
                    value={selectedPeriod}
                    onChange={handlePeriodChange}
                    checkIconPosition="right"
                    rightSection={<IconChevronDown size={16} />}
                    data={['All Period', 'Today', 'Yesterday', 'This Week', 'This Month', 'This Year']}
                    placeholder="Select Period"
                    size="xs"
                />
            </Grid.Col>
        </Grid>
    );
};

export default FilterDate;
