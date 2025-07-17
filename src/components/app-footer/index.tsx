import { getYear } from 'date-fns';
import { Heart } from 'lucide-react';

export default function AppFooter() {
  return (
    <>
      <div className="mt-10 flex w-full items-center justify-center">
        <div className="h-[1px] w-[95vw] rounded-full bg-neutral-950/10" />
      </div>

      <footer className="text-md my-5 flex flex-col items-center justify-between px-5 md:flex-row md:px-10 xl:px-20 2xl:px-28">
        <small className="text-center md:text-left">
          &copy;Copyright&nbsp;
          <span className="font-semibold">Open Sails</span>. &nbsp;
          {getYear(new Date())} All Rights Reserved.
        </small>

        <small className="text-md text-center md:text-right">
          Made with <Heart className="inline-block animate-pulse" /> by{' '}
          <a
            href="https://sanfordev.come"
            target="_blank"
            rel="noreferrer"
            className="transition-all duration-200 hover:text-blue-700"
          >
            sanfordev
          </a>
        </small>
      </footer>
    </>
  );
}
