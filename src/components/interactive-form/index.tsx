import { PropsWithChildren } from 'react';
import { Button } from '../ui/button';

export interface FormProps {
  formTitle?: string;
  triggerText?: string;
  method: 'POST' | 'PUT';
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const InteractiveForm = ({
  formTitle,
  triggerText,
  method,
  children,
  onSubmit,
}: PropsWithChildren<FormProps>) => {
  return (
    <form
      className="flex flex-col gap-4 p-4 bg-white dark:bg-zinc-900 shadow-md rounded-lg"
      method={method}
      onSubmit={onSubmit}
    >
      <header>{formTitle && <h2 className="text-lg font-semibold">{formTitle}</h2>}</header>
      <div className="flex flex-col gap-2">{children}</div>
      <div>
        <Button type="submit">{triggerText}</Button>
      </div>
    </form>
  );
};
