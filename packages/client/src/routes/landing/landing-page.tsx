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
		label: 'Workout',
		desc: 'Courtyard fitness, running groups',
		color: 'bg-orange-100 dark:bg-orange-950/40',
	},
	{
		emoji: '\u{1F3A8}',
		label: 'Workshop',
		desc: 'Crafts, cooking, DIY classes',
		color: 'bg-amber-100 dark:bg-amber-950/40',
	},
	{
		emoji: '\u{1F476}',
		label: 'Kids',
		desc: 'Children activities & playgroups',
		color: 'bg-rose-100 dark:bg-rose-950/40',
	},
	{
		emoji: '\u{1F91D}',
		label: 'Meetup',
		desc: 'Neighbor gatherings & socials',
		color: 'bg-sky-100 dark:bg-sky-950/40',
	},
	{
		emoji: '\u{1F393}',
		label: 'Lecture',
		desc: 'Talks, discussions, learning',
		color: 'bg-violet-100 dark:bg-violet-950/40',
	},
	{
		emoji: '\u{1F3AF}',
		label: 'Leisure',
		desc: 'Games, walks, shared hobbies',
		color: 'bg-emerald-100 dark:bg-emerald-950/40',
	},
]

const features = [
	{
		icon: MapPin,
		title: 'Hyperlocal',
		desc: 'Events within walking distance. Your courtyard, your park, your street.',
	},
	{
		icon: Zap,
		title: 'Instant',
		desc: 'Create or join in under a minute. No bureaucracy, no waiting.',
	},
	{
		icon: Users,
		title: 'Community',
		desc: 'Meet the people who live around you. Build real connections.',
	},
	{
		icon: Heart,
		title: 'For Everyone',
		desc: 'Free or paid. Fitness or crafts. Kids or adults. You choose.',
	},
]

export function LandingPage() {
	usePageTitle('Local Events Around You')

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
						<Link to="/login">Sign In</Link>
					</Button>
					<Button size="sm" asChild>
						<Link to="/register">Get Started</Link>
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
						<span>Events happening around you right now</span>
					</div>

					<h1
						className="font-display font-bold text-5xl md:text-7xl leading-[1.08] tracking-tight mb-6 animate-fade-in-up"
					>
						Your neighborhood
						<br />
						<span className="text-gradient-terracotta">comes alive</span>
					</h1>

					<p
						className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in-up"
						style={{ animationDelay: '100ms', animationFillMode: 'both' }}
					>
						Micro-events created by your neighbors. Workouts in the courtyard,
						workshops around the corner, playdates across the street.
					</p>

					<div
						className="flex gap-3 justify-center flex-wrap animate-fade-in-up"
						style={{ animationDelay: '200ms', animationFillMode: 'both' }}
					>
						<Button size="lg" className="gap-2 text-base px-6" asChild>
							<Link to="/events">
								Browse Events
								<ArrowRight className="h-4 w-4" />
							</Link>
						</Button>
						<Button
							size="lg"
							variant="outline"
							className="text-base px-6"
							asChild
						>
							<Link to="/events/new">Create Event</Link>
						</Button>
					</div>
				</div>
			</section>

			{/* Categories */}
			<section className="container pb-24">
				<div className="text-center mb-12">
					<h2 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-3">
						What's happening nearby?
					</h2>
					<p className="text-muted-foreground">
						Every day, people near you are organizing something worth joining.
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
							For Participants
						</h3>
						<ul className="space-y-3 text-muted-foreground text-sm">
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Find activities within walking distance
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Meet your actual neighbors
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Keep kids meaningfully engaged
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Break your daily routine
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
								Join in under a minute
							</li>
						</ul>
					</div>
					<div className="rounded-2xl border border-border bg-card p-8 md:p-10">
						<div className="w-10 h-10 rounded-xl bg-coral/10 flex items-center justify-center mb-5">
							<Sparkles className="h-5 w-5 text-coral" />
						</div>
						<h3 className="font-display font-bold text-xl mb-4">
							For Organizers
						</h3>
						<ul className="space-y-3 text-muted-foreground text-sm">
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Create events in minutes
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Set format, price, time & capacity
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Build a new income stream
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Platform handles payments
							</li>
							<li className="flex items-start gap-2">
								<span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
								Grow your local community
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
							Ready to explore your neighborhood?
						</h2>
						<p className="text-white/80 mb-8 max-w-md mx-auto">
							Joining a nearby event is as easy as sending a message.
						</p>
						<Button
							size="lg"
							variant="secondary"
							className="bg-white text-foreground hover:bg-white/90 gap-2 text-base px-6"
							asChild
						>
							<Link to="/register">
								Get Started Free
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
						Local events, everyday.
					</p>
				</div>
			</footer>
		</div>
	)
}

export default LandingPage
