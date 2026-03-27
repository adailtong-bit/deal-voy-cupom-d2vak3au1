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

export function TestingSandboxTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { franchises } = useCouponStore()
  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">
          {t('franchisee.sandbox.title', 'Sandbox de Testes')}
        </h2>
        <p className="text-muted-foreground">
          {t(
            'franchisee.sandbox.desc',
            'Perfis de teste predefinidos para validação e lógica geográfica.',
          )}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Individual Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {t('franchisee.sandbox.individual', 'Perfil Individual')}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.sandbox.ind_desc',
                'Teste de cenário para usuário final',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span className="font-medium text-right">Carlos Silva</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.age', 'Idade')}
              </span>
              <span className="font-medium text-right">{formatNumber(28)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.gender', 'Gênero')}
              </span>
              <span className="font-medium text-right">Male</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{' '}
                {t('franchisee.sandbox.location', 'Localização')}
              </span>
              <span className="font-medium text-right">
                Brazil &gt; São Paulo &gt; São Paulo &gt; CEP: 01001-000
              </span>
            </div>
            <div className="pt-2">
              <span className="text-muted-foreground block mb-2">
                {t('franchisee.sandbox.interests', 'Interesses')}
              </span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {t('category.food', 'Gastronomia')}
                </Badge>
                <Badge variant="secondary">
                  {t('category.electronics', 'Tecnologia')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              {t('franchisee.sandbox.company', 'Perfil de Empresa')}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.sandbox.comp_desc',
                'Teste de cenário para parceiro B2B',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span className="font-medium text-right">
                Global Travel Agency
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.category', 'Categoria')}
              </span>
              <span className="font-medium text-right">
                {t('category.leisure', 'Turismo')}
              </span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{' '}
                {t('franchisee.sandbox.location', 'Localização')}
              </span>
              <span className="font-medium text-right">
                Portugal &gt; Lisboa &gt; Lisboa &gt; ZIP: 1000-001
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.status', 'Status')}
              </span>
              <div className="text-right">
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Franchise Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-500" />
              {t('franchisee.sandbox.franchise', 'Perfil de Franquia')}
            </CardTitle>
            <CardDescription>
              {t(
                'franchisee.sandbox.fran_desc',
                'Teste de cenário para multi-filiais',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.name', 'Nome')}
              </span>
              <span className="font-medium text-right">
                Burger Hub - Unidade Centro
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.parent_brand', 'Marca Principal')}
              </span>
              <span className="font-medium text-right">Burger Hub Global</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">
                {t('franchisee.sandbox.franchise_id', 'ID da Franquia')}
              </span>
              <span className="font-mono text-right">FR-001</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 pt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />{' '}
                {t('franchisee.sandbox.location', 'Localização')}
              </span>
              <span className="font-medium text-right">
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
