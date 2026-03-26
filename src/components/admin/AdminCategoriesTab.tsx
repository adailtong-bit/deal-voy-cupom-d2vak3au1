import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { useRegionFormatting } from '@/hooks/useRegionFormatting'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { CATEGORIES } from '@/lib/data'
import { toast } from 'sonner'
import {
  LayoutGrid,
  Utensils,
  Shirt,
  Briefcase,
  Smartphone,
  Ticket,
  ShoppingCart,
  Sparkles,
  CircleEllipsis,
} from 'lucide-react'

export function AdminCategoriesTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { platformSettings, updatePlatformSettings, franchises } =
    useCouponStore()

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const mainCategories = platformSettings.mainCategories || []

  const handleToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      if (mainCategories.length >= 4) {
        toast.error(
          t(
            'admin.maxCategoriesReached',
            'Máximo de 4 categorias principais atingido.',
          ),
        )
        return
      }
      updatePlatformSettings({
        mainCategories: [...mainCategories, categoryId],
      })
    } else {
      updatePlatformSettings({
        mainCategories: mainCategories.filter((id) => id !== categoryId),
      })
    }
  }

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="w-4 h-4" />
      case 'Shirt':
        return <Shirt className="w-4 h-4" />
      case 'Briefcase':
        return <Briefcase className="w-4 h-4" />
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />
      case 'Ticket':
        return <Ticket className="w-4 h-4" />
      case 'ShoppingCart':
        return <ShoppingCart className="w-4 h-4" />
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />
      case 'CircleEllipsis':
        return <CircleEllipsis className="w-4 h-4" />
      default:
        return <LayoutGrid className="w-4 h-4" />
    }
  }

  const manageableCategories = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('admin.categoryManagement', 'Gerenciamento de Categorias')}
          </CardTitle>
          <CardDescription>
            {t(
              'admin.mainCategoriesDesc',
              'Selecione até 4 categorias principais para exibir em destaque na página inicial.',
            )}
            <br />
            <strong className="text-primary mt-1 inline-block">
              {t('admin.selected_count', '{count} selecionadas.').replace(
                '{count}',
                `${formatNumber(mainCategories.length)} / ${formatNumber(4)}`,
              )}
            </strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('nav.categories', 'Categorias')}</TableHead>
                <TableHead className="text-right">
                  {t('admin.mainCategory', 'Principal')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manageableCategories.map((cat) => {
                const isMain = mainCategories.includes(cat.id)
                return (
                  <TableRow key={cat.id}>
                    <TableCell className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-md text-slate-600">
                        {getIcon(cat.icon)}
                      </div>
                      <span className="font-medium">
                        {t(cat.translationKey, cat.label)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={isMain}
                        onCheckedChange={(checked) =>
                          handleToggle(cat.id, checked)
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
