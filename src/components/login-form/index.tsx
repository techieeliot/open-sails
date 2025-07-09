import { Button } from '../ui/button';

export const LoginForm = () => {
  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-lg">Please log in to continue</p>
      <form className="flex flex-col items-center gap-4">
        <input type="email" placeholder="Email" className="p-2 border border-gray-300 rounded" />
        <Button type="submit" variant="outline">
          Log in
        </Button>
      </form>
    </section>
  );
};
