import { useEffect } from 'react';
import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { IconForbid } from '@/ui/display/icon';
import { useRelationPicker } from '@/ui/input/components/internal/relation-picker/hooks/useRelationPicker';
import { SingleEntitySelect } from '@/ui/input/relation-picker/components/SingleEntitySelect';
import { relationPickerSearchFilterScopedState } from '@/ui/input/relation-picker/states/relationPickerSearchFilterScopedState';
import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';
import { FieldDefinition } from '@/ui/object/field/types/FieldDefinition';
import { FieldRelationMetadata } from '@/ui/object/field/types/FieldMetadata';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';

export type RelationPickerProps = {
  recordId?: string;
  onSubmit: (newUser: EntityForSelect | null) => void;
  onCancel?: () => void;
  width?: number;
  excludeRecordIds?: string[];
  initialSearchFilter?: string | null;
  fieldDefinition: FieldDefinition<FieldRelationMetadata>;
};

export const RelationPicker = ({
  recordId,
  onSubmit,
  onCancel,
  excludeRecordIds,
  width,
  initialSearchFilter,
  fieldDefinition,
}: RelationPickerProps) => {
  const [relationPickerSearchFilter, setRelationPickerSearchFilter] =
    useRecoilScopedState(relationPickerSearchFilterScopedState);

  useEffect(() => {
    setRelationPickerSearchFilter(initialSearchFilter ?? '');
  }, [initialSearchFilter, setRelationPickerSearchFilter]);

  // TODO: refactor useFilteredSearchEntityQuery
  const { findManyRecordsQuery } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const useFindManyQuery = (options: any) =>
    useQuery(findManyRecordsQuery, options);

  const { identifiersMapper, searchQuery } = useRelationPicker();

  const records = useFilteredSearchEntityQuery({
    queryHook: useFindManyQuery,
    filters: [
      {
        fieldNames:
          searchQuery?.computeFilterFields?.(
            fieldDefinition.metadata.relationObjectMetadataNameSingular,
          ) ?? [],
        filter: relationPickerSearchFilter,
      },
    ],
    orderByField: 'createdAt',
    mappingFunction: (record: any) =>
      identifiersMapper?.(
        record,
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      ),
    selectedIds: recordId ? [recordId] : [],
    excludeEntityIds: excludeRecordIds,
    objectNamePlural: fieldDefinition.metadata.relationObjectMetadataNamePlural,
  });

  const handleEntitySelected = async (selectedUser: any | null | undefined) => {
    onSubmit(selectedUser ?? null);
  };

  return (
    <SingleEntitySelect
      EmptyIcon={IconForbid}
      emptyLabel={'No ' + fieldDefinition.label}
      entitiesToSelect={records.entitiesToSelect}
      loading={records.loading}
      onCancel={onCancel}
      onEntitySelected={handleEntitySelected}
      selectedEntity={records.selectedEntities[0]}
      width={width}
    />
  );
};
