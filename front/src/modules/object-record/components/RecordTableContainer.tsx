import styled from '@emotion/styled';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTable } from '@/ui/object/record-table/components/RecordTable';
import { TableOptionsDropdownId } from '@/ui/object/record-table/constants/TableOptionsDropdownId';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { TableOptionsDropdown } from '@/ui/object/record-table/options/components/TableOptionsDropdown';
import { ViewBar } from '@/views/components/ViewBar';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';

import { useUpdateOneRecord } from '../hooks/useUpdateOneRecord';

import { RecordTableEffect } from './RecordTableEffect';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
`;

export const RecordTableContainer = ({
  objectNamePlural,
  createRecord,
}: {
  objectNamePlural: string;
  createRecord: () => void;
}) => {
  const { objectMetadataItem: foundObjectMetadataItem } = useObjectMetadataItem(
    {
      objectNamePlural,
    },
  );
  const { columnDefinitions } = useColumnDefinitionsFromFieldMetadata(
    foundObjectMetadataItem,
  );

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: foundObjectMetadataItem?.nameSingular,
  });

  const recordTableId = objectNamePlural ?? '';
  const viewBarId = objectNamePlural ?? '';

  const { setTableFilters, setTableSorts, setTableColumns } = useRecordTable({
    recordTableScopeId: recordTableId,
  });

  const updateEntity = ({
    variables,
  }: {
    variables: {
      where: { id: string };
      data: {
        [fieldName: string]: any;
      };
    };
  }) => {
    updateOneRecord?.({
      idToUpdate: variables.where.id,
      input: variables.data,
    });
  };

  return (
    <StyledContainer>
      <ViewBar
        viewBarId={viewBarId}
        optionsDropdownButton={
          <TableOptionsDropdown recordTableId={recordTableId} />
        }
        optionsDropdownScopeId={TableOptionsDropdownId}
        onViewFieldsChange={(viewFields) => {
          setTableColumns(
            mapViewFieldsToColumnDefinitions(viewFields, columnDefinitions),
          );
        }}
        onViewFiltersChange={(viewFilters) => {
          setTableFilters(mapViewFiltersToFilters(viewFilters));
        }}
        onViewSortsChange={(viewSorts) => {
          setTableSorts(mapViewSortsToSorts(viewSorts));
        }}
      />
      <RecordTableEffect recordTableId={recordTableId} viewBarId={viewBarId} />
      <RecordTable
        recordTableId={recordTableId}
        viewBarId={viewBarId}
        updateRecordMutation={updateEntity}
        createRecord={createRecord}
      />
    </StyledContainer>
  );
};
