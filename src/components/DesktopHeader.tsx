import { Link, useLocation } from 'react-router-dom'
import { Search, MapPin, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function DesktopHeader() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 hidden md:block">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xl">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground">
              Cupom<span className="text-primary">Geo</span>
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-4 text-sm font-medium">
            <Link
              to="/"
              className={
                location.pathname === '/'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Início
            </Link>
            <Link
              to="/explore"
              className={
                location.pathname === '/explore'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Explorar Mapa
            </Link>
            <Link
              to="/saved"
              className={
                location.pathname === '/saved'
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }
            >
              Meus Cupons
            </Link>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar lojas, marcas ou produtos..."
              className="w-full bg-muted pl-9 md:w-[300px] lg:w-[400px] rounded-full focus-visible:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/upload">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              Subir Doc
            </Button>
          </Link>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
            <MapPin className="h-3 w-3" />
            <span>São Paulo, SP</span>
          </div>

          <Link to="/profile">
            <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all">
              <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=male" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Navegue pelo CupomGeo</SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6">
                <Link to="/" className="text-lg font-medium">
                  Início
                </Link>
                <Link to="/explore" className="text-lg font-medium">
                  Explorar
                </Link>
                <Link to="/saved" className="text-lg font-medium">
                  Salvos
                </Link>
                <Link to="/upload" className="text-lg font-medium">
                  Subir Doc
                </Link>
                <Link to="/profile" className="text-lg font-medium">
                  Perfil
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
