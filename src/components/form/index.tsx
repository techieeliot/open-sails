import { Button } from '../ui/button';

export const Form = ({
  formTitle,
  triggerText,
  method,
  children,
  onSubmit,
}: {
  formTitle?: string;
  triggerText?: string;
  method: 'POST' | 'PUT';
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) => {
  return (
    <form className="flex flex-col gap-4 p-4 bg-white dark:bg" method={method} onSubmit={onSubmit}>
      <header>{formTitle && <h2 className="text-lg font-semibold">{formTitle}</h2>}</header>
      <div className="flex flex-col gap-2">{children}</div>
      <div>
        <Button type="submit">{triggerText}</Button>
      </div>
    </form>
  );
};
