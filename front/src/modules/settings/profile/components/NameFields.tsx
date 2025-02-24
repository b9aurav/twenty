import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { TextInput } from '@/ui/input/components/TextInput';
import { logError } from '~/utils/logError';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type NameFieldsProps = {
  autoSave?: boolean;
  onFirstNameUpdate?: (firstName: string) => void;
  onLastNameUpdate?: (lastName: string) => void;
};

export const NameFields = ({
  autoSave = true,
  onFirstNameUpdate,
  onLastNameUpdate,
}: NameFieldsProps) => {
  const currentUser = useRecoilValue(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [firstName, setFirstName] = useState(
    currentWorkspaceMember?.name?.firstName ?? '',
  );
  const [lastName, setLastName] = useState(
    currentWorkspaceMember?.name?.lastName ?? '',
  );

  const { updateOneRecord, objectMetadataItemNotFound } = useUpdateOneRecord({
    objectNameSingular: 'workspaceMember',
  });

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = debounce(async () => {
    if (onFirstNameUpdate) {
      onFirstNameUpdate(firstName);
    }
    if (onLastNameUpdate) {
      onLastNameUpdate(lastName);
    }
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      if (autoSave) {
        if (!updateOneRecord || objectMetadataItemNotFound) {
          throw new Error('Object not found in metadata');
        }
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          input: {
            name: {
              firstName: firstName,
              lastName: lastName,
            },
          },
        });

        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          name: {
            firstName,
            lastName,
          },
        });
      }
    } catch (error) {
      logError(error);
    }
  }, 500);

  useEffect(() => {
    if (!currentWorkspaceMember) {
      return;
    }

    if (
      currentWorkspaceMember.name?.firstName !== firstName ||
      currentWorkspaceMember.name?.lastName !== lastName
    ) {
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [
    firstName,
    lastName,
    currentUser,
    debouncedUpdate,
    autoSave,
    currentWorkspaceMember,
  ]);

  return (
    <StyledComboInputContainer>
      <TextInput
        label="First Name"
        value={firstName}
        onChange={setFirstName}
        placeholder="Tim"
        fullWidth
      />
      <TextInput
        label="Last Name"
        value={lastName}
        onChange={setLastName}
        placeholder="Cook"
        fullWidth
      />
    </StyledComboInputContainer>
  );
};
