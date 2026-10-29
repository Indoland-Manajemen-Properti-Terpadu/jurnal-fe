import { Input, Grid, Button, Flex } from '@mantine/core';
import { IconSearch, IconTrash, IconCalendar } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useFilterTransaction } from '@/module/journal-entries';

interface SearchActionsProps {
  onDelete: () => void;
  hasSelection: boolean;
}

const SearchActions: React.FC<SearchActionsProps> = ({ onDelete, hasSelection }) => {
  const { searchQuery, setSearchQuery, selectedDate, setSelectedDate } = useFilterTransaction();

  return (
    <Grid columns={24} gutter="sm" align="center" style={{ flex: 1 }}>
      <Grid.Col span={8}>
        <Input
          placeholder="Search by transaction number or name"
          size="xs"
          leftSection={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <DatePickerInput
          placeholder="Date"
          valueFormat="DD/MM/YYYY"
          highlightToday
          size="xs"
          value={selectedDate}
          onChange={setSelectedDate}
          clearable={!!selectedDate}
          rightSection={!selectedDate ? <IconCalendar size={16} /> : null}
        />
      </Grid.Col>
      <Grid.Col span={6}>
        <Button
          size="xs"
          color="red"
          leftSection={<IconTrash size={16} />}
          onClick={onDelete}
          style={{ visibility: hasSelection ? 'visible' : 'hidden' }}
        >
          Delete All
        </Button>
      </Grid.Col>
    </Grid>
  );
};

export default SearchActions;
