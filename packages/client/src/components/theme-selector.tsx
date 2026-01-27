import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/contexts/theme-context'

export function ThemeSelector() {
	const { theme, setTheme } = useTheme()

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="h-9 w-9">
					{theme === 'dark' ? (
						<Moon className="h-4 w-4" />
					) : (
						<Sun className="h-4 w-4" />
					)}
					<span className="sr-only">Přepnout motiv</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuItem onClick={() => setTheme('light')}>
					Světlý
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('dark')}>
					Tmavý
				</DropdownMenuItem>
				<DropdownMenuItem onClick={() => setTheme('system')}>
					Systémový
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
