import { useState } from 'react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Play } from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'

export function CrawlerSourcesTab() {
  const { t } = useLanguage()
  const { triggerScan } = useCouponStore()

  const [searchType, setSearchType] = useState('region')
  const [region, setRegion] = useState('')
  const [company, setCompany] = useState('')
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState(50)
  const [minDiscount, setMinDiscount] = useState(10)
  const [differentiated, setDifferentiated] = useState(false)
  const [holiday, setHoliday] = useState('none')

  const handleStartCrawler = () => {
    toast.success(
      t('franchisee.crawler.scan_started', 'Crawler iniciado com sucesso!'),
    )
    triggerScan('custom')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t('franchisee.crawler.config_title', 'Configuração de Busca')}
          </CardTitle>
          <CardDescription>
            {t(
              'franchisee.crawler.config_desc',
              'Defina os parâmetros para encontrar novas ofertas na web.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('franchisee.crawler.search_by', 'Buscar por')}</Label>
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="region">
                    {t('franchisee.crawler.by_region', 'Região / País')}
                  </SelectItem>
                  <SelectItem value="company">
                    {t('franchisee.crawler.by_company', 'Empresas Específicas')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchType === 'region' ? (
              <div className="space-y-2">
                <Label>{t('franchisee.crawler.region', 'Região / País')}</Label>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('common.select', 'Selecione...')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BR">Brasil</SelectItem>
                    <SelectItem value="US">Estados Unidos</SelectItem>
                    <SelectItem value="EU">Europa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>
                  {t('franchisee.crawler.company_names', 'Nomes das Empresas')}
                </Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Ex: Decolar, Booking..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>
                {t('franchisee.crawler.category', 'Categoria Específica')}
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.all', 'Todas')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t('common.all', 'Todas')}
                  </SelectItem>
                  <SelectItem value="hotel">
                    {t('franchisee.crawler.cat_hotel', 'Hotel')}
                  </SelectItem>
                  <SelectItem value="hostel">
                    {t('franchisee.crawler.cat_hostel', 'Hostel')}
                  </SelectItem>
                  <SelectItem value="car_rental">
                    {t('franchisee.crawler.cat_car_rental', 'Locação de carro')}
                  </SelectItem>
                  <SelectItem value="museums">
                    {t('franchisee.crawler.cat_museums', 'Museus')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t('franchisee.crawler.holiday', 'Campanhas de Feriado')}
              </Label>
              <Select value={holiday} onValueChange={setHoliday}>
                <SelectTrigger>
                  <SelectValue placeholder={t('common.none', 'Nenhum')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t('common.none', 'Nenhum')}
                  </SelectItem>
                  <SelectItem value="black_friday">Black Friday</SelectItem>
                  <SelectItem value="christmas">Natal (Christmas)</SelectItem>
                  <SelectItem value="local">Feriados Locais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {t('franchisee.crawler.limit', 'Limite de Promoções')}
              </Label>
              <Input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min={1}
                max={500}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {t('franchisee.crawler.min_discount', 'Desconto Mínimo (%) >')}
              </Label>
              <Input
                type="number"
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                min={1}
                max={100}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border md:col-span-2">
              <div className="space-y-0.5">
                <Label>
                  {t(
                    'franchisee.crawler.differentiated',
                    'Ofertas Diferenciadas',
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t(
                    'franchisee.crawler.differentiated_desc',
                    'Priorizar ofertas únicas ou de alto valor comercial.',
                  )}
                </p>
              </div>
              <Switch
                checked={differentiated}
                onCheckedChange={setDifferentiated}
              />
            </div>
          </div>

          <Button
            onClick={handleStartCrawler}
            className="w-full sm:w-auto mt-4"
          >
            <Play className="w-4 h-4 mr-2" />
            {t('franchisee.crawler.start', 'Iniciar Crawler')}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
