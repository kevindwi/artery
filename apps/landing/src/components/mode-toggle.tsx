import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun 
        className={`h-[1.5rem] w-[1.5rem] transition-all ${resolvedTheme === "dark" 
          ? "scale-0 rotate-90" 
          : "scale-100 rotate-0"
          }`}
      />
      <Moon 
        className={`absolute h-[1.5rem] w-[1.5rem] transition-all ${resolvedTheme === "dark" 
          ? "scale-100 rotate-0" 
          : "scale-0 rotate-90"
          }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}



