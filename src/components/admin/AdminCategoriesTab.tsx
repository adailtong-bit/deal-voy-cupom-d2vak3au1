import { useState, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Plane,
  Building,
  Car,
  Coffee,
  Bed,
  Search,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminCategoriesTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()
  const { platformSettings, updatePlatformSettings, franchises } =
    useCouponStore()
  const location = useLocation()
  const isFranchisee = location.pathname.includes('/franchisee')

  const franchise = franchises.find((f) => f.id === franchiseId)
  const { formatNumber } = useRegionFormatting(franchise?.region)

  const mainCategories = platformSettings.mainCategories || []

  const categoriesList =
    platformSettings.categories ||
    CATEGORIES.filter((c) => c.id !== 'all').map((c) => ({
      ...c,
      description: `Ofertas e promoções de ${c.label.toLowerCase()}`,
      status: 'active' as const,
      createdAt: '2024-01-01',
    }))

  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    description: '',
    icon: 'LayoutGrid',
    status: 'active',
  })

  const filteredCategories = useMemo(() => {
    return categoriesList.filter(
      (c) =>
        c.label.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()),
    )
  }, [categoriesList, search])

  const handleToggleMain = (categoryId: string, checked: boolean) => {
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

  const handleSave = () => {
    if (!formData.label) {
      toast.error('Nome da categoria é obrigatório')
      return
    }
    if (editingCategory) {
      updatePlatformSettings({
        categories: categoriesList.map((c) =>
          c.id === editingCategory.id ? { ...c, ...formData } : c,
        ),
      })
      toast.success('Categoria atualizada com sucesso!')
    } else {
      const newCategory = {
        id: `cat-${Date.now()}`,
        translationKey: `category.${formData.label.toLowerCase()}`,
        createdAt: new Date().toISOString().split('T')[0],
        ...formData,
      }
      updatePlatformSettings({
        categories: [...categoriesList, newCategory as any],
      })
      toast.success('Categoria criada com sucesso!')
    }
    setIsDialogOpen(false)
  }

  const handleEdit = (cat: any) => {
    setEditingCategory(cat)
    setFormData({
      label: cat.label,
      description: cat.description || '',
      icon: cat.icon,
      status: cat.status || 'active',
    })
    setIsDialogOpen(true)
  }

  const getIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' }
    switch (iconName) {
      case 'Utensils':
        return <Utensils {...props} />
      case 'Shirt':
        return <Shirt {...props} />
      case 'Briefcase':
        return <Briefcase {...props} />
      case 'Smartphone':
        return <Smartphone {...props} />
      case 'Ticket':
        return <Ticket {...props} />
      case 'ShoppingCart':
        return <ShoppingCart {...props} />
      case 'Sparkles':
        return <Sparkles {...props} />
      case 'Plane':
        return <Plane {...props} />
      case 'Building':
        return <Building {...props} />
      case 'Car':
        return <Car {...props} />
      case 'Coffee':
        return <Coffee {...props} />
      case 'Bed':
        return <Bed {...props} />
      case 'CircleEllipsis':
        return <CircleEllipsis {...props} />
      default:
        return <LayoutGrid {...props} />
    }
  }

  return (
    <div
      className={cn(
        'space-y-6 animate-fade-in-up w-full',
        !isFranchisee && 'min-w-0 max-w-full',
      )}
    >
      <Card
        className={cn('w-full', !isFranchisee && 'min-w-0 overflow-hidden')}
      >
        <CardHeader className="min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="truncate">
                {t('admin.categoryManagement', 'Gerenciamento de Categorias')}
              </CardTitle>
              <CardDescription className="line-clamp-2 mt-1">
                {t(
                  'admin.mainCategoriesDesc',
                  'Gerencie as categorias de ofertas e selecione até 4 em destaque.',
                )}
                <br />
                <strong className="text-primary mt-1 inline-block">
                  {formatNumber(mainCategories.length)} / {formatNumber(4)}{' '}
                  destaques selecionados
                </strong>
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar categoria..."
                  className="pl-8 w-full sm:w-[200px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                className="w-full sm:w-auto"
                onClick={() => {
                  setEditingCategory(null)
                  setFormData({
                    label: '',
                    description: '',
                    icon: 'LayoutGrid',
                    status: 'active',
                  })
                  setIsDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent
          className={cn(
            'p-0 sm:p-6 sm:pt-0',
            !isFranchisee && 'overflow-x-auto min-w-0',
          )}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">Categoria</TableHead>
                <TableHead className="whitespace-nowrap hidden md:table-cell">
                  Descrição
                </TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap hidden lg:table-cell">
                  Criado em
                </TableHead>
                <TableHead className="text-center whitespace-nowrap">
                  Destaque
                </TableHead>
                <TableHead className="text-right whitespace-nowrap">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => {
                const isMain = mainCategories.includes(cat.id)
                return (
                  <TableRow key={cat.id}>
                    <TableCell className="flex items-center gap-3 whitespace-nowrap">
                      <div className="p-2 bg-slate-100 rounded-md text-slate-600 shrink-0">
                        {getIcon(cat.icon)}
                      </div>
                      <span className="font-medium truncate">
                        {t(cat.translationKey, cat.label)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate hidden md:table-cell">
                      {cat.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs rounded-full font-medium',
                          cat.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700',
                        )}
                      >
                        {cat.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap hidden lg:table-cell text-muted-foreground">
                      {cat.createdAt}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      <Switch
                        checked={isMain}
                        onCheckedChange={(checked) =>
                          handleToggleMain(cat.id, checked)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-4 h-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCategoryToDelete(cat.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
          {filteredCategories.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma categoria encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="Ex: Viagens"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Breve descrição da categoria"
                className="resize-none h-20"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ícone</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(val) =>
                    setFormData({ ...formData, icon: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      'LayoutGrid',
                      'Utensils',
                      'Shirt',
                      'Briefcase',
                      'Smartphone',
                      'Ticket',
                      'ShoppingCart',
                      'Sparkles',
                      'Plane',
                      'Building',
                      'Car',
                      'Coffee',
                      'Bed',
                      'CircleEllipsis',
                    ].map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          {getIcon(icon)}
                          <span className="truncate">{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData({ ...formData, status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não
              poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                if (categoryToDelete) {
                  updatePlatformSettings({
                    categories: categoriesList.filter(
                      (c) => c.id !== categoryToDelete,
                    ),
                  })
                  setCategoryToDelete(null)
                  toast.success('Categoria removida com sucesso!')
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
