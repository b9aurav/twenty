import { useQuery } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useFindOneRecord = <
  ObjectType extends { id: string } & Record<string, any>,
>({
  objectNameSingular,
  objectRecordId,
  onCompleted,
  depth,
  skip,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'> & {
  objectRecordId: string | undefined;
  onCompleted?: (data: ObjectType) => void;
  skip?: boolean;
  depth?: number;
}) => {
  const { objectMetadataItem, objectMetadataItemNotFound, findOneRecordQuery } =
    useObjectMetadataItem(
      {
        objectNameSingular,
      },
      depth,
    );

  const { data, loading, error } = useQuery<
    { [nameSingular: string]: ObjectType },
    { objectRecordId: string }
  >(findOneRecordQuery, {
    skip: !objectMetadataItem || !objectRecordId || skip,
    variables: {
      objectRecordId: objectRecordId ?? '',
    },
    onCompleted: (data) => {
      if (onCompleted && objectNameSingular) {
        onCompleted(data[objectNameSingular]);
      }
    },
  });

  const record =
    objectNameSingular && data ? data[objectNameSingular] : undefined;

  return {
    record,
    loading,
    error,
    objectMetadataItemNotFound,
  };
};
