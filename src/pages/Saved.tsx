import { useCouponStore } from '@/stores/CouponContext'
import { CouponCard } from '@/components/CouponCard'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { HeartOff, Download, CheckCircle, QrCode } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function Saved() {
  const { coupons, savedIds, downloadOffline, downloadedIds } = useCouponStore()
  const navigate = useNavigate()
  const { t } = useLanguage()

  const savedCoupons = coupons.filter((c) => savedIds.includes(c.id))

  const allDownloaded =
    savedCoupons.length > 0 &&
    savedCoupons.every((c) => downloadedIds.includes(c.id))

  const handleDownloadAll = () => {
    downloadOffline(savedIds)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {t('saved.title')}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {savedCoupons.length}
          </span>
        </h1>
        {savedCoupons.length > 0 && (
          <Button
            variant={allDownloaded ? 'secondary' : 'outline'}
            onClick={handleDownloadAll}
            disabled={allDownloaded}
          >
            {allDownloaded ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" /> {t('common.success')}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" /> {t('common.save')} Offline
              </>
            )}
          </Button>
        )}
      </div>

      {savedCoupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedCoupons.map((coupon) => (
            <div key={coupon.id} className="relative group">
              <CouponCard coupon={coupon} />
              <div className="absolute top-2 left-2 z-20">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-white/90 text-black hover:bg-white"
                    >
                      <QrCode className="h-3 w-3" /> {t('saved.show_code')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        {coupon.storeName}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-6">
                      <div className="bg-white p-4 rounded-xl shadow-lg mb-4">
                        <QrCode className="h-48 w-48" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {t('coupon.code_dialog_desc')}
                      </p>
                      <code className="bg-muted px-4 py-2 rounded text-lg font-bold tracking-widest">
                        {coupon.code}
                      </code>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="bg-muted p-6 rounded-full mb-4">
            <HeartOff className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t('saved.empty')}</h2>
          <Button onClick={() => navigate('/explore')}>
            {t('nav.explore')}
          </Button>
        </div>
      )}
    </div>
  )
}
