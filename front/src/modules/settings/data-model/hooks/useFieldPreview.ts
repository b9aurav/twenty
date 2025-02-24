import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { useLazyLoadIcon } from '@/ui/input/hooks/useLazyLoadIcon';
import { Field, FieldMetadataType } from '~/generated-metadata/graphql';

import { settingsFieldMetadataTypes } from '../constants/settingsFieldMetadataTypes';
import { SettingsObjectFieldSelectFormOption } from '../types/SettingsObjectFieldSelectFormOption';

import { useFieldPreviewValue } from './useFieldPreviewValue';
import { useRelationFieldPreviewValue } from './useRelationFieldPreviewValue';

export const useFieldPreview = ({
  fieldMetadata,
  objectMetadataId,
  relationObjectMetadataId,
  selectOptions,
}: {
  fieldMetadata: Pick<Field, 'icon' | 'label' | 'type'> & { id?: string };
  objectMetadataId: string;
  relationObjectMetadataId?: string;
  selectOptions?: SettingsObjectFieldSelectFormOption[];
}) => {
  const { findObjectMetadataItemById } = useObjectMetadataItemForSettings();
  const objectMetadataItem = findObjectMetadataItemById(objectMetadataId);

  const { Icon: ObjectIcon } = useLazyLoadIcon(objectMetadataItem?.icon ?? '');
  const { Icon: FieldIcon } = useLazyLoadIcon(fieldMetadata.icon ?? '');

  const fieldName = fieldMetadata.id
    ? objectMetadataItem?.fields.find(({ id }) => id === fieldMetadata.id)?.name
    : undefined;

  const { value: firstRecordFieldValue } = useFieldPreviewValue({
    fieldName: fieldName || '',
    objectNamePlural: objectMetadataItem?.namePlural || '',
    skip:
      !fieldName ||
      !objectMetadataItem ||
      fieldMetadata.type === FieldMetadataType.Relation,
  });

  const { relationObjectMetadataItem, value: relationValue } =
    useRelationFieldPreviewValue({
      relationObjectMetadataId,
      skip: fieldMetadata.type !== FieldMetadataType.Relation,
    });

  const { defaultValue } = settingsFieldMetadataTypes[fieldMetadata.type];

  const defaultSelectValue = selectOptions?.[0];
  const selectValue =
    fieldMetadata.type === FieldMetadataType.Enum &&
    typeof firstRecordFieldValue === 'string'
      ? selectOptions?.find(
          (selectOption) => selectOption.value === firstRecordFieldValue,
        )
      : undefined;

  return {
    entityId: `${objectMetadataId}-field-form`,
    FieldIcon,
    fieldName: fieldName || `${fieldMetadata.type}-new-field`,
    ObjectIcon,
    objectMetadataItem,
    relationObjectMetadataItem,
    value:
      fieldMetadata.type === FieldMetadataType.Relation
        ? relationValue
        : fieldMetadata.type === FieldMetadataType.Enum
        ? selectValue || defaultSelectValue
        : firstRecordFieldValue || defaultValue,
  };
};
