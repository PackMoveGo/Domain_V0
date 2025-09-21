import { FormEvent } from 'react';
import { NavigateFunction } from 'react-router-dom';

export const onHandleSubmit = <T>(
  formData: T,
  navigate: NavigateFunction,
  redirectPath: string = '/booking'
) => (e: FormEvent) => {
  e.preventDefault();
  console.log('Form submitted:', formData);
  navigate(redirectPath);
};
