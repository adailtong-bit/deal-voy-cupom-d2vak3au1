import { useRef } from 'react'
import { Camera, Upload, User as UserIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'

export function ProfileAvatar() {
  const { user, updateUserProfile } = useCouponStore()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateUserProfile({ avatar: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  if (!user) return null

  return (
    <div className="flex flex-col items-center gap-6">
      <Avatar className="h-32 w-32 border-4 border-background shadow-xl transition-all hover:scale-105">
        <AvatarImage
          src={user.avatar || undefined}
          alt={user.name}
          className="object-cover"
        />
        <AvatarFallback className="text-4xl bg-muted">
          <UserIcon className="h-12 w-12 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-3 w-full justify-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={cameraInputRef}
          onChange={handleFileChange}
        />

        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 max-w-[140px]"
        >
          <Upload className="mr-2 h-4 w-4" />
          {t('profile.upload')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 max-w-[140px]"
        >
          <Camera className="mr-2 h-4 w-4" />
          {t('profile.takePhoto')}
        </Button>
      </div>
    </div>
  )
}
