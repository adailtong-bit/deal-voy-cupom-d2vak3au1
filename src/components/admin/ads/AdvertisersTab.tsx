import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { useForm } from 'react-hook-form'
import { useLanguage } from '@/stores/LanguageContext'
import { toast } from 'sonner'
import {
  fetchAdvertisers,
  createAdvertiser,
  Advertiser,
} from '@/services/ad_advertisers'

export function AdvertisersTab() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register, handleSubmit, reset } = useForm()
  const { t } = useLanguage()

  const loadAdvertisers = async () => {
    try {
      const data = await fetchAdvertisers()
      setAdvertisers(data || [])
    } catch (err) {
      console.error(err)
      toast.error(t('common.error', 'Erro ao carregar anunciantes'))
    }
  }

  useEffect(() => {
    loadAdvertisers()
  }, [])

  const onSubmit = async (data: any) => {
    setIsLoading(true)
    try {
      await createAdvertiser({
        company_name: data.companyName,
        tax_id: data.taxId,
        email: data.email,
        phone: data.phone,
        street: data.street,
        address_number: data.number,
        city: data.city,
        state: data.state,
        zip: data.zip,
      })
      toast.success(t('common.success', 'Salvo com sucesso!'))
      setIsOpen(false)
      reset()
      await loadAdvertisers()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Erro ao salvar anunciante')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('ads.advertisers_companies')}</CardTitle>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>{t('ads.new_advertiser')}</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('ads.register_advertiser')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{t('ads.company_name')}</Label>
                <Input {...register('companyName')} required />
              </div>
              <div className="space-y-2">
                <Label>{t('ads.tax_id')}</Label>
                <Input {...register('taxId')} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('auth.email')}</Label>
                  <Input type="email" {...register('email')} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone.label')}</Label>
                  <Input {...register('phone')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('address.street')}</Label>
                <Input {...register('street')} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input {...register('number')} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('address.city')}</Label>
                  <Input {...register('city')} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('address.state')}</Label>
                  <Input {...register('state')} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('address.zip')}</Label>
                <Input {...register('zip')} required />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? t('common.loading', 'Salvando...')
                    : t('common.save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('ads.company')}</TableHead>
              <TableHead>{t('ads.tax_id')}</TableHead>
              <TableHead>{t('ads.contact')}</TableHead>
              <TableHead>{t('ads.locality')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {advertisers.map((a) => (
              <TableRow key={a.id || Math.random().toString()}>
                <TableCell className="font-bold">{a.company_name}</TableCell>
                <TableCell>{a.tax_id}</TableCell>
                <TableCell>
                  {a.email}
                  <br />
                  <span className="text-xs text-muted-foreground">
                    {a.phone}
                  </span>
                </TableCell>
                <TableCell>
                  {a.city}, {a.state}
                </TableCell>
              </TableRow>
            ))}
            {advertisers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground"
                >
                  {t('ads.no_advertisers')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
