import React from 'react';

type FormEvent = React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>;

export const onHandleChange = <T extends Record<string, any>>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => (e: FormEvent) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value,
  }));
};
