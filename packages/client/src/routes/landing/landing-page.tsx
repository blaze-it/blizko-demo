import {
	ArrowRight,
	Calendar,
	Heart,
	MapPin,
	Sparkles,
	Users,
	Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'

const categories = [
	{
		emoji: '\u{1F3CB}',
		label: 'Cvičení',
		desc: 'Fitness na dvoře, běžecké skupiny',
		color: 'bg-orange-100 dark:bg-orange-950/40',
	},
	{
		emoji: '\u{1F3A8}',
		label: 'Workshop',
		desc: 'Tvoření, vaření, kutilské kurzy',
		color: 'bg-amber-100 dark:bg-amber-950/40',
	},
	{
		emoji: '\u{1F476}',
		label: 'Děti',
		desc: 'Dětské aktivity a herní skupiny',
		color: 'bg-rose-100 dark:bg-rose-950/40',
	},
	{
		emoji: '\u{1F91D}',
		label: 'Setkání',
		desc: 'Sousedská setkání a společenské akce',
		color: 'bg-sky-100 dark:bg-sky-950/40',
	},
	{
		emoji: '\u{1F393}',
		label: 'Přednáška',
		desc: 'Přednášky, diskuze, vzdělávání',
		color: 'bg-violet-100 dark:bg-violet-950/40',
	},
	{
		emoji: '\u{1F3AF}',
		label: 'Volný čas',
		desc: 'Hry, procházky, společné koníčky',
		color: 'bg-emerald-100 dark:bg-emerald-950/40',
	},
]

const features = [
	{
		icon: MapPin,
		title: 'Hyperlocal',
		desc: 'Události na dosah ruky. Váš dvůr, váš park, vaše ulice.',
	},
	{
		icon: Zap,
		title: 'Okamžité',
		desc: 'Vytvořte nebo se přidejte za minutu. Žádná byrokracie, žádné čekání.',
	},
	{
		icon: Users,
		title: 'Komunita',
		desc: 'Poznejte lidi, kteří bydlí kolem vás. Budujte skutečná spojení.',
	},
	{
		icon: Heart,
		title: 'Pro každého',
		desc: 'Zdarma nebo za poplatek. Fitness nebo tvoření. Děti nebo dospělí. Vy si vyberete.',
	},
]

export function LandingPage() {
	usePageTitle('Lokální události ve vašem okolí')

	return (
		<div className="min-h-screen bg-background text-foreground overflow-hidden">
			{/* Header */}
			<header className="container flex items-center justify-between py-5">
				<Link to="/" className="inline-flex items-center gap-1.5 group">
					<span className="font-display font-bold text-2xl tracking-tight">
						blizko
					</span>
					<span className="w-2 h-2 rounded-full bg-primary group-hover:scale-125 transition-transform" />
				</Link>
				<div className="flex items-center gap-2">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/login">Přihlásit se</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to="/register">Začít</Link>
					</Button>
				</div>
			</header>

			{/* Hero */}
			<section className="container relative pt-16 pb-24 md:pt-24 md:pb-32">
				{/* Decorative background blob */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] opacity-30 pointer-events-none">
					<div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-coral/10 to-transparent blur-3xl" />
				</div>

				<div className="relative max-w-3xl mx-auto text-center">
					<div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-8 animate-fade-in">
						<Sparkles className="h-3.5 w-3.5" />
						<span>Události probíhající právě teď ve vašem okolí</span>
					</div>

					<h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.08] tracking-tight mb-6 animate-fade-in-up">
						Vaše sousedství
						<br />
						<span className="text-gradient-terracotta">ožívá</span>
					</h1>

					<p
						className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in-up"
						style={{ animationDelay: '100ms', animationFillMode: 'both' }}
					>
						Mikro-události od vašich sousedů. Cvičení na dvoře, workshopy za
						rohem, herna přes ulici.
					</p>

					<div
						className="flex gap-3 justify-center flex-wrap animate-fade-in-up"
						style={{ animationDelay: '200ms', animationFillMode: 'both' }}
					>
						<Button size="lg" className="gap-2 text-base px-6" asChild>
							<Link to="/events">
								Procházet události
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="text-base px-6"
							asChild
						>
							<Link to="/events/new">Vytvořit událost</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="container pb-24">
				<div className="text-center mb-12">
					<h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
						Co se děje poblíž?
					</h2>
					<p className="text-muted-foreground">
						Každý den lidé kolem vás organizují něco, co stojí za to.
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
					{categories.map((cat, i) => (
						<div
							key={cat.label}
							className={`rounded-2xl ${cat.color} p-5 text-center hover:scale-[1.03] transition-all duration-300 cursor-default animate-fade-in-up`}
							style={{
								animationDelay: `${i * 60}ms`,
								animationFillMode: 'both',
							}}
						>
							<div className="text-4xl mb-2.5">{cat.emoji}</div>
							<h3 className="font-display font-semibold text-sm mb-0.5">
								{cat.label}
							</h3>
							<p className="text-xs text-muted-foreground leading-snug">
								{cat.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Features */}
			<section className="container pb-24">
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((f, i) => (
						<div
							key={f.title}
							className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-warm-lg transition-all duration-300 animate-fade-in-up"
							style={{
								animationDelay: `${i * 80}ms`,
								animationFillMode: 'both',
							}}
						>
							<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
								<f.icon className="h-5 w-5 text-primary" />
							</div>
							<h3 className="font-display font-bold text-lg mb-1.5">
								{f.title}
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{f.desc}
							</p>
						</div>
					))}
				</div>
			</section>

			{/* Two Columns */}
			<section className="container pb-24">
				<div className="grid md:grid-cols-2 gap-4">
					<div className="rounded-2xl border border-border bg-card p-8 md:p-10">
						<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
							<Calendar className="h-5 w-5 text-primary" />
						</div>
						<h3 className="font-display font-bold text-xl mb-4">
							Pro účastníky
						</h3>
						<ul className="space-y-3 text-muted-foreground text-sm">
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Najděte aktivity na dosah pěšky
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Poznejte své skutečné sousedy
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Smysluplné vyžití pro děti
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Rozbijte svou denní rutinu
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Přidejte se za minutu
							</li>
						</ul>
					</div>
					<div className="rounded-2xl border border-border bg-card p-8 md:p-10">
						<div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center mb-5">
							<Sparkles className="h-5 w-5 text-coral" />
						</div>
						<h3 className="font-display font-bold text-xl mb-4">
							Pro organizátory
						</h3>
						<ul className="space-y-3 text-muted-foreground text-sm">
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Vytvořte událost za pár minut
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Nastavte formát, cenu, čas a kapacitu
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Vybudujte si nový zdroj příjmů
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Platby řeší platforma
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Rozvíjejte svou lokální komunitu
							</li>
						</ul>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="container pb-24 text-center">
				<div className="relative rounded-3xl bg-gradient-to-br from-primary to-coral p-12 md:p-16 overflow-hidden">
					{/* Decorative circles */}
					<div className="absolute top-4 right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
					<div className="absolute bottom-4 left-12 w-24 h-24 rounded-full bg-white/5 blur-lg" />

					<div className="relative">
						<h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 tracking-tight">
							Připraveni prozkoumat své okolí?
						</h2>
						<p className="text-white/80 mb-8 max-w-md mx-auto">
							Připojit se k události poblíž je snadné jako poslat zprávu.
						</p>
						<Button
							size="lg"
							variant="secondary"
							className="bg-white text-foreground hover:bg-white/90 gap-2 text-base px-6"
							asChild
						>
							<Link to="/register">
								Začít zdarma
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="container pb-10 text-center">
				<div className="border-t border-border pt-8 flex flex-col items-center gap-2">
					<div className="inline-flex items-center gap-1.5">
						<span className="font-display font-bold text-lg tracking-tight text-muted-foreground">
							blizko
						</span>
						<span className="w-1.5 h-1.5 rounded-full bg-primary" />
					</div>
					<p className="text-sm text-muted-foreground">
						Lokální události, každý den.
					</p>
				</div>
			</footer>
		</div>
	)
}

export default LandingPage
