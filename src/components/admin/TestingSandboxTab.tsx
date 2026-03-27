import { useLocation } from 'react-router-dom'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Building, Store } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import { useCouponStore } from '@/stores/CouponContext'
import { cn } from '@/lib/utils'

export function TestingSandboxTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <div className="min-w-0">
        <h2 className="text-2xl font-bold truncate">
          {t('franchisee.sandbox.title', 'Sandbox de Testes')}
        </h2>
        <p className="text-muted-foreground truncate">
          {t(
            'franchisee.sandbox.desc',
            'Perfis de teste predefinidos para validação e lógica geográfica.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 min-w-0">
        {/* Individual Profile */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center gap-2 truncate">
              <User className="h-5 w-5 text-primary shrink-0" />
              <span className="truncate">
                {t('franchisee.sandbox.individual', 'Perfil Individual')}
              </span>
            </CardTitle>
            <CardDescription className="truncate">
              {t(
                'franchisee.sandbox.ind_desc',
                'Teste de cenário para usuário final',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm overflow-x-auto min-w-0">
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span className="font-medium text-right truncate">
                Carlos Silva
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.age', 'Idade')}
              </span>
              <span className="font-medium text-right truncate">
                {formatNumber(28)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.gender', 'Gênero')}
              </span>
              <span className="font-medium text-right truncate">Male</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />{' '}
                <span className="truncate">
                  {t('franchisee.sandbox.location', 'Localização')}
                </span>
              </span>
              <span
                className="font-medium text-right truncate"
                title="Brazil > São Paulo > São Paulo > CEP: 01001-000"
              >
                Brazil &gt; São Paulo &gt; São Paulo &gt; CEP: 01001-000
              </span>
            </div>
            <div className="pt-2 min-w-0">
              <span className="text-muted-foreground block mb-2 truncate">
                {t('franchisee.sandbox.interests', 'Interesses')}
              </span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="truncate max-w-full">
                  {t('category.food', 'Gastronomia')}
                </Badge>
                <Badge variant="secondary" className="truncate max-w-full">
                  {t('category.electronics', 'Tecnologia')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center gap-2 truncate">
              <Building className="h-5 w-5 text-blue-500 shrink-0" />
              <span className="truncate">
                {t('franchisee.sandbox.company', 'Perfil de Empresa')}
              </span>
            </CardTitle>
            <CardDescription className="truncate">
              {t(
                'franchisee.sandbox.comp_desc',
                'Teste de cenário para parceiro B2B',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm overflow-x-auto min-w-0">
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span className="font-medium text-right truncate">
                Global Travel Agency
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.category', 'Categoria')}
              </span>
              <span className="font-medium text-right truncate">
                {t('category.leisure', 'Turismo')}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />{' '}
                <span className="truncate">
                  {t('franchisee.sandbox.location', 'Localização')}
                </span>
              </span>
              <span
                className="font-medium text-right truncate"
                title="Portugal > Lisboa > Lisboa > ZIP: 1000-001"
              >
                Portugal &gt; Lisboa &gt; Lisboa &gt; ZIP: 1000-001
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.status', 'Status')}
              </span>
              <div className="text-right">
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Franchise Profile */}
        <Card className="min-w-0 overflow-hidden">
          <CardHeader className="min-w-0">
            <CardTitle className="flex items-center gap-2 truncate">
              <Store className="h-5 w-5 text-orange-500 shrink-0" />
              <span className="truncate">
                {t('franchisee.sandbox.franchise', 'Perfil de Franquia')}
              </span>
            </CardTitle>
            <CardDescription className="truncate">
              {t(
                'franchisee.sandbox.fran_desc',
                'Teste de cenário para multi-filiais',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm overflow-x-auto min-w-0">
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span
                className="font-medium text-right truncate"
                title="Burger Hub - Unidade Centro"
              >
                Burger Hub - Unidade Centro
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.parent_brand', 'Marca Principal')}
              </span>
              <span
                className="font-medium text-right truncate"
                title="Burger Hub Global"
              >
                Burger Hub Global
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2 min-w-0">
              <span className="text-muted-foreground truncate">
                {t('franchisee.sandbox.franchise_id', 'ID da Franquia')}
              </span>
              <span className="font-mono text-right truncate">FR-001</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 pt-2 min-w-0">
              <span className="text-muted-foreground flex items-center gap-1 truncate">
                <MapPin className="h-3 w-3 shrink-0" />{' '}
                <span className="truncate">
                  {t('franchisee.sandbox.location', 'Localização')}
                </span>
              </span>
              <span
                className="font-medium text-right truncate"
                title="Brazil > Rio de Janeiro > Rio de Janeiro > CEP: 20040-002"
              >
                Brazil &gt; Rio de Janeiro &gt; Rio de Janeiro &gt; CEP:
                20040-002
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
