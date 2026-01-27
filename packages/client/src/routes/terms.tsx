import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'

export function TermsPage() {
	usePageTitle('Obchodní podmínky')

	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="container max-w-3xl py-12">
				<Link
					to="/"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
				>
					<ArrowLeft className="h-4 w-4" />
					Zpět na hlavní stránku
				</Link>

				<h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight mb-2">
					Obchodní podmínky
				</h1>
				<p className="text-sm text-muted-foreground mb-10">
					Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
				</p>

				<div className="prose prose-neutral max-w-none space-y-8 text-foreground/90">
					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							1. Úvodní ustanovení
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Tyto obchodní podmínky upravují práva a povinnosti
							uživatelů platformy Blizko (dále jen „platforma"),
							provozované společností Blaze (dále jen „provozovatel").
							Používáním platformy souhlasíte s těmito podmínkami.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							2. Popis služby
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Platforma Blizko umožňuje uživatelům vytvářet, objevovat
							a účastnit se lokálních mikro-událostí. Služba zahrnuje
							možnost registrace jako účastník nebo organizátor událostí
							v okolí.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							3. Registrace a uživatelský účet
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Pro využívání služeb platformy je nutná registrace.
							Uživatel je povinen uvést pravdivé a aktuální údaje.
							Uživatel je odpovědný za zabezpečení svého účtu
							a přístupových údajů. Provozovatel si vyhrazuje právo
							zrušit účet, který porušuje tyto podmínky.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							4. Práva a povinnosti organizátorů
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Organizátor je odpovědný za správnost informací o události,
							včetně popisu, místa, času a ceny. Organizátor se zavazuje
							zajistit průběh události v souladu s uvedenými informacemi.
							Provozovatel nenese odpovědnost za průběh ani kvalitu
							jednotlivých událostí.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							5. Práva a povinnosti účastníků
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Účastník bere na vědomí, že se událostí účastní
							na vlastní odpovědnost. Účastník se zavazuje dodržovat
							pravidla stanovená organizátorem. Zrušení účasti je možné
							v souladu s podmínkami konkrétní události.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							6. Platby
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Některé události mohou být zpoplatněny. Cena je vždy
							uvedena u konkrétní události. Platba probíhá
							prostřednictvím platební brány integrované v platformě.
							Podmínky vrácení platby se řídí podmínkami konkrétní
							události a platnými právními předpisy.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							7. Odpovědnost
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Provozovatel poskytuje platformu „jak je" a neručí
							za dostupnost služby ani za obsah vytvořený uživateli.
							Provozovatel neodpovídá za škody vzniklé v souvislosti
							s účastí na událostech zprostředkovaných platformou.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							8. Závěrečná ustanovení
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Provozovatel si vyhrazuje právo tyto podmínky kdykoliv
							změnit. O změnách bude uživatel informován
							prostřednictvím platformy. Tyto podmínky se řídí právním
							řádem České republiky. V případě sporů je příslušný soud
							v České republice.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							9. Kontakt
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							V případě dotazů nás kontaktujte prostřednictvím{' '}
							<a
								href="https://blaze.codes"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								blaze.codes
							</a>
							.
						</p>
					</section>
				</div>
			</div>
		</div>
	)
}

export default TermsPage
