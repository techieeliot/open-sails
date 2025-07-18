export default function PageWrapper({ children }: { children: React.ReactNode }) {
	return (
		<div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]">
			<main className="row-start-2 flex min-h-screen flex-col items-center gap-8 sm:items-start">
				{children}
			</main>
		</div>
	)
}
