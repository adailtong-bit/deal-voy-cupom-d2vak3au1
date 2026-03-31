import { useState, useEffect, useRef } from 'react'
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
import { Progress } from '@/components/ui/progress'
import { Play, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useCouponStore } from '@/stores/CouponContext'
import { CATEGORIES } from '@/lib/data'
import {
  fetchWebSearchPromotions,
  saveDiscoveredPromotion,
  saveCrawlerLog,
} from '@/lib/api'

export function CrawlerSourcesTab() {
  const { t } = useLanguage()
  const { seasonalEvents } = useCouponStore()

  // Load from session storage for persistence or fallback to defaults
  const [searchType, setSearchType] = useState(
    () => sessionStorage.getItem('crawler_src_searchType') || 'region',
  )
  const [region, setRegion] = useState(
    () => sessionStorage.getItem('crawler_src_region') || '',
  )
  const [company, setCompany] = useState(
    () => sessionStorage.getItem('crawler_src_company') || '',
  )
  const [category, setCategory] = useState(
    () => sessionStorage.getItem('crawler_src_category') || '',
  )
  const [limit, setLimit] = useState(
    () => Number(sessionStorage.getItem('crawler_src_limit')) || 50,
  )
  const [minDiscount, setMinDiscount] = useState(
    () => Number(sessionStorage.getItem('crawler_src_minDiscount')) || 10,
  )
  const [differentiated, setDifferentiated] = useState(
    () => sessionStorage.getItem('crawler_src_diff') === 'true',
  )
  const [holiday, setHoliday] = useState(
    () => sessionStorage.getItem('crawler_src_holiday') || 'none',
  )

  // Crawler State
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const stopRef = useRef(false)

  // Save to session storage whenever a field changes
  useEffect(() => {
    sessionStorage.setItem('crawler_src_searchType', searchType)
    sessionStorage.setItem('crawler_src_region', region)
    sessionStorage.setItem('crawler_src_company', company)
    sessionStorage.setItem('crawler_src_category', category)
    sessionStorage.setItem('crawler_src_limit', limit.toString())
    sessionStorage.setItem('crawler_src_minDiscount', minDiscount.toString())
    sessionStorage.setItem('crawler_src_diff', differentiated.toString())
    sessionStorage.setItem('crawler_src_holiday', holiday)
  }, [
    searchType,
    region,
    company,
    category,
    limit,
    minDiscount,
    differentiated,
    holiday,
  ])

  const handleStartCrawler = async () => {
    let queries =
      searchType === 'company'
        ? company
            .split(/[,;\n]+/)
            .map((c) => c.trim())
            .filter(Boolean)
        : [region]

    if (searchType === 'region' && category !== 'all') {
      queries = [`${region} ${category}`]
    }

    if (!queries.length || !queries[0]) {
      toast.error(
        t(
          'franchisee.crawler.empty_query',
          'Insira ao menos um termo de busca.',
        ),
      )
      return
    }

    setIsScanning(true)
    stopRef.current = false
    setScanProgress(0)
    setScanStatus(
      t('franchisee.crawler.starting', 'Iniciando lote de buscas...'),
    )

    let totalImported = 0
    let hasErrors = false

    for (let i = 0; i < queries.length; i++) {
      if (stopRef.current) {
        setScanStatus(
          t('franchisee.crawler.stopped', 'Busca interrompida pelo usuário.'),
        )
        break
      }

      const q = queries[i]
      setScanStatus(
        t(
          'franchisee.crawler.searching_for',
          `Processando (${i + 1}/${queries.length}): ${q}`,
        ),
      )

      try {
        const results = await fetchWebSearchPromotions(q, limit)

        const validResults = results.filter((r) => {
          if (!r.title || !r.description) return false
          const textToInspect =
            `${r.title} ${r.description} ${r.storeName || ''}`.toLowerCase()
          const trashKeywords = [
            'lorem ipsum',
            'test',
            'teste',
            'mock',
            'dummy',
          ]
          if (trashKeywords.some((kw) => textToInspect.includes(kw)))
            return false

          if (!r.discount) return true
          const discNum = parseInt(String(r.discount).replace(/\D/g, ''), 10)
          return isNaN(discNum) || discNum >= minDiscount
        })

        const toImport = validResults.slice(
          0,
          Math.max(0, limit - totalImported),
        )

        for (const item of toImport) {
          if (stopRef.current) break

          const expDate =
            item.expiryDate && !isNaN(Date.parse(item.expiryDate))
              ? new Date(item.expiryDate).toISOString()
              : undefined

          await saveDiscoveredPromotion({
            ...item,
            title: item.title?.trim(),
            description: item.description?.trim(),
            storeName: item.storeName?.trim() || q,
            discount: item.discount,
            originalPrice: item.originalPrice,
            currentPrice: item.currentPrice,
            expiryDate: expDate,
            state: item.state?.trim(),
            city: item.city?.trim(),
            latitude: item.latitude ? Number(item.latitude) : undefined,
            longitude: item.longitude ? Number(item.longitude) : undefined,
            category: category !== 'all' ? category : item.category || 'other',
            status: 'pending',
          })
          totalImported++
        }

        if (validResults.length === 0 && results.length > 0) {
          toast.warning(
            t(
              'franchisee.crawler.no_valid_data',
              `Nenhum dado real encontrado para: ${q}`,
            ),
          )
        }

        await saveCrawlerLog({
          storeName: q,
          status: toImport.length > 0 ? 'success' : 'warning',
          errorMessage:
            toImport.length === 0 ? 'No valid real data found' : undefined,
          itemsFound: validResults.length,
          itemsImported: toImport.length,
          date: new Date().toISOString(),
        })
      } catch (err: any) {
        hasErrors = true
        console.error(`Error searching for ${q}:`, err)
        await saveCrawlerLog({
          storeName: q,
          status: 'error',
          errorMessage: err.message || 'Erro de conexão',
          itemsFound: 0,
          itemsImported: 0,
          date: new Date().toISOString(),
        })
      }

      setScanProgress(Math.round(((i + 1) / queries.length) * 100))

      if (totalImported >= limit) {
        toast.info(
          t(
            'franchisee.crawler.limit_reached',
            'Limite total de promoções atingido.',
          ),
        )
        break
      }

      // Delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 800))
    }

    setIsScanning(false)

    if (hasErrors) {
      toast.warning(
        t(
          'franchisee.crawler.finished_with_errors',
          'Busca concluída, porém com alguns erros.',
        ),
      )
    } else if (!stopRef.current) {
      toast.success(
        t(
          'franchisee.crawler.done',
          'Processo de crawler finalizado com sucesso!',
        ),
      )
    }
  }

  const handleStopCrawler = () => {
    stopRef.current = true
    toast.info(t('franchisee.crawler.stopping', 'Parando o crawler...'))
  }

  const activeSeasonalEvents = seasonalEvents.filter(
    (e) => e.status === 'active',
  )
  const manageableCategories = CATEGORIES.filter((c) => c.id !== 'all')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>
              {t('franchisee.crawler.config_title', 'Configuração de Busca')}
            </span>
            <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-slate-100 rounded-md">
              {t('franchisee.crawler.last_search', 'Última Busca')}
            </span>
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
                  {manageableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {t(cat.translationKey, cat.label)}
                    </SelectItem>
                  ))}
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
                  {activeSeasonalEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                  {activeSeasonalEvents.length === 0 && (
                    <SelectItem value="no_campaigns" disabled>
                      {t(
                        'franchisee.crawler.no_campaigns',
                        'Nenhuma campanha ativa',
                      )}
                    </SelectItem>
                  )}
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
                max={1000}
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

          {isScanning && (
            <div className="space-y-2 mt-6 p-4 border rounded-md bg-slate-50">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">
                  {scanStatus}
                </span>
                <span className="text-sm font-bold text-primary">
                  {scanProgress}%
                </span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3 mt-6">
            {!isScanning ? (
              <Button onClick={handleStartCrawler} className="w-full sm:w-auto">
                <Play className="w-4 h-4 mr-2" />
                {t('franchisee.crawler.start', 'Iniciar Crawler')}
              </Button>
            ) : (
              <Button
                onClick={handleStopCrawler}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                <StopCircle className="w-4 h-4 mr-2" />
                {t('franchisee.crawler.stop', 'Parar Crawler')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
