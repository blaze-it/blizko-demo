import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/use-page-title'

export function PrivacyPage() {
	usePageTitle('Ochrana soukromí')

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
					Zásady ochrany osobních údajů
				</h1>
				<p className="text-sm text-muted-foreground mb-10">
					Poslední aktualizace: {new Date().toLocaleDateString('cs-CZ')}
				</p>

				<div className="prose prose-neutral max-w-none space-y-8 text-foreground/90">
					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							1. Správce osobních údajů
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Správcem osobních údajů je společnost Blaze (dále jen
							„správce"), dostupná na{' '}
							<a
								href="https://blaze.codes"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								blaze.codes
							</a>
							. Správce zpracovává osobní údaje v souladu s Nařízením
							Evropského parlamentu a Rady (EU) 2016/679 (GDPR)
							a zákonem č. 110/2019 Sb., o zpracování osobních údajů.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							2. Jaké údaje shromažďujeme
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground mb-3">
							Při používání platformy Blizko zpracováváme následující
							osobní údaje:
						</p>
						<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
							<li>
								<strong>Registrační údaje:</strong> jméno, e-mailová
								adresa, uživatelské jméno
							</li>
							<li>
								<strong>Profilové údaje:</strong> bio, čtvrť/lokalita
							</li>
							<li>
								<strong>Údaje o událostech:</strong> vytvořené
								a navštívené události, lokace
							</li>
							<li>
								<strong>Technické údaje:</strong> IP adresa, typ
								prohlížeče, operační systém
							</li>
						</ul>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							3. Účel zpracování
						</h2>
						<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
							<li>
								Poskytování služeb platformy (vytváření a správa
								událostí)
							</li>
							<li>Správa uživatelského účtu a autentizace</li>
							<li>
								Zobrazení událostí v okolí na základě lokalizace
							</li>
							<li>Komunikace s uživateli ohledně služeb</li>
							<li>
								Plnění právních povinností a ochrana oprávněných
								zájmů správce
							</li>
						</ul>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							4. Právní základ zpracování
						</h2>
						<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
							<li>
								<strong>Plnění smlouvy</strong> (čl. 6 odst. 1 písm. b
								GDPR) — pro poskytování služeb platformy
							</li>
							<li>
								<strong>Oprávněný zájem</strong> (čl. 6 odst. 1 písm. f
								GDPR) — pro zajištění bezpečnosti a zlepšování služby
							</li>
							<li>
								<strong>Souhlas</strong> (čl. 6 odst. 1 písm. a GDPR)
								— pro marketingovou komunikaci (je-li udělen)
							</li>
							<li>
								<strong>Plnění právní povinnosti</strong> (čl. 6 odst. 1
								písm. c GDPR)
							</li>
						</ul>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							5. Doba uchování údajů
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Osobní údaje uchováváme po dobu trvání uživatelského
							účtu a dále po dobu nezbytnou pro splnění právních
							povinností (např. účetní a daňové povinnosti). Po zrušení
							účtu jsou údaje smazány do 30 dnů, pokud zákon nestanoví
							jinak.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							6. Sdílení údajů
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Vaše údaje nesdílíme s třetími stranami za účelem
							marketingu. Údaje mohou být sdíleny s poskytovateli
							služeb nezbytných pro provoz platformy (hosting, platební
							brány) a v případech vyžadovaných zákonem. Všichni
							zpracovatelé jsou vázáni odpovídajícími smlouvami
							o zpracování osobních údajů.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							7. Vaše práva
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground mb-3">
							V souladu s GDPR máte následující práva:
						</p>
						<ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
							<li>
								<strong>Právo na přístup</strong> — získat informace
								o zpracovávaných údajích
							</li>
							<li>
								<strong>Právo na opravu</strong> — požádat o opravu
								nepřesných údajů
							</li>
							<li>
								<strong>Právo na výmaz</strong> — požádat o smazání
								údajů („právo být zapomenut")
							</li>
							<li>
								<strong>Právo na omezení zpracování</strong> — omezit
								způsob zpracování údajů
							</li>
							<li>
								<strong>Právo na přenositelnost</strong> — získat údaje
								ve strojově čitelném formátu
							</li>
							<li>
								<strong>Právo vznést námitku</strong> — proti zpracování
								založenému na oprávněném zájmu
							</li>
							<li>
								<strong>Právo odvolat souhlas</strong> — kdykoliv,
								bez vlivu na zákonnost dřívějšího zpracování
							</li>
						</ul>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							8. Zabezpečení údajů
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Vaše údaje chráníme pomocí šifrování (HTTPS), hashování
							hesel a přístupu založeného na rolích. Pravidelně
							přezkoumáváme a aktualizujeme naše bezpečnostní opatření.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							9. Cookies
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Platforma používá nezbytné cookies pro zajištění funkčnosti
							(přihlášení, správa relace). Analytické cookies používáme
							pouze s vaším souhlasem.
						</p>
					</section>

					<section>
						<h2 className="font-display font-bold text-xl mb-3">
							10. Kontakt a stížnosti
						</h2>
						<p className="text-sm leading-relaxed text-muted-foreground">
							Pro uplatnění svých práv nebo dotazy ohledně zpracování
							osobních údajů nás kontaktujte prostřednictvím{' '}
							<a
								href="https://blaze.codes"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								blaze.codes
							</a>
							. Máte také právo podat stížnost u Úřadu pro ochranu
							osobních údajů (
							<a
								href="https://www.uoou.cz"
								target="_blank"
								rel="noopener noreferrer"
								className="text-primary hover:underline"
							>
								uoou.cz
							</a>
							).
						</p>
					</section>
				</div>
			</div>
		</div>
	)
}

export default PrivacyPage
