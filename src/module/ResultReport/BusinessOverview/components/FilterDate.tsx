import React, { useState, useEffect } from "react";
import { Grid, Select } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { IconCalendar, IconChevronDown } from "@tabler/icons-react";
import { format, startOfMonth, startOfWeek, subDays } from "date-fns";

interface FilterDateProps {
    onFilterChange: (fromDate: string | undefined, toDate: string | undefined) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({ onFilterChange }) => {
    const initialFromDate = format(new Date("2024-01-01"), "yyyy-MM-dd");
    const initialToDate = format(new Date(), "yyyy-MM-dd");

    const [value, setValue] = useState<[string | null, string | null]>([initialFromDate, initialToDate]);
    const [selectedPeriod, setSelectedPeriod] = useState<string>("All Period");

    useEffect(() => {
        const [fromDate, toDate] = value;
        const formattedFromDate = fromDate ? format(new Date(fromDate), "yyyy-MM-dd") : undefined;
        const formattedToDate = toDate ? format(new Date(toDate), "yyyy-MM-dd") : undefined;
        onFilterChange(formattedFromDate, formattedToDate);
    }, [value, onFilterChange]);

    const handlePeriodChange = (value: string | null) => {
        if (!value) return; // Prevent setting null values

        setSelectedPeriod(value);

        let newFromDate: string | null = null;
        let newToDate: string | null = format(new Date(), "yyyy-MM-dd");

        switch (value) {
            case "Today":
                newFromDate = format(new Date(), "yyyy-MM-dd");
                newToDate = format(new Date(), "yyyy-MM-dd");
                break;
            case "Yesterday":
                newFromDate = format(subDays(new Date(), 1), "yyyy-MM-dd");
                newToDate = format(subDays(new Date(), 1), "yyyy-MM-dd");
                break;
            case "This Week":
                newFromDate = format(startOfWeek(new Date()), "yyyy-MM-dd");
                newToDate = format(new Date(), "yyyy-MM-dd");
                break;
            case "This Month":
                newFromDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
                newToDate = format(new Date(), "yyyy-MM-dd");
                break;
            case "This Year":
                newFromDate = format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd");
                newToDate = format(new Date(), "yyyy-MM-dd");
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
