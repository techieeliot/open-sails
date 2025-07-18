import { getYear } from 'date-fns';

export default function AppFooter() {
  return (
    <>
      <div className="mt-10 flex w-full items-center justify-center relative bottom">
        <div className="h-[1px] w-[95vw] rounded-full bg-neutral-950/10" />
      </div>

      <footer className="my-5 flex flex-col items-center justify-between px-5 text-md md:flex-row md:px-10 xl:px-20 2xl:px-28">
        <small className="text-center md:text-left">
          &copy;Copyright&nbsp;
          <span className="font-semibold">Open Sails</span>. &nbsp;
          {getYear(new Date())} All Rights Reserved.
        </small>

        <small className="text-center text-md md:text-right">
          Designed by{' '}
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
