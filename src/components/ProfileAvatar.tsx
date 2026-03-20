import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Upload, ShieldCheck, X, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { User } from '@/lib/types'
import { useLanguage } from '@/stores/LanguageContext'

interface ProfileAvatarProps {
  user: User
  onUpdate: (data: Partial<User>) => void
}

export function ProfileAvatar({ user, onUpdate }: ProfileAvatarProps) {
  const { t } = useLanguage()
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleSave = () => {
    if (previewImage) {
      onUpdate({ avatar: previewImage })
      setPreviewImage(null)
    }
  }

  return (
    <>
      <div className="relative mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative group rounded-full overflow-hidden transition-all focus:outline-none ring-4 ring-transparent focus:ring-primary/20 hover:ring-primary/10">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl group-hover:opacity-90 transition-opacity">
                <AvatarImage
                  src={
                    user.avatar ||
                    'https://img.usecurling.com/ppl/thumbnail?gender=male'
                  }
                  className="object-cover"
                />
                <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-8 w-8 text-white" />
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 p-2">
            <DropdownMenuItem
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer py-3 text-sm"
            >
              <Upload className="mr-3 h-4 w-4" />{' '}
              {t('profile.upload_photo') || 'Upload Photo'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => cameraInputRef.current?.click()}
              className="cursor-pointer py-3 text-sm"
            >
              <Camera className="mr-3 h-4 w-4" />{' '}
              {t('profile.take_photo') || 'Take Photo'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white shadow-sm pointer-events-none">
          <ShieldCheck className="w-4 h-4" />
        </div>

        <input
          type="file"
          accept="image/jpeg, image/png"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <input
          type="file"
          accept="image/jpeg, image/png"
          capture="user"
          className="hidden"
          ref={cameraInputRef}
          onChange={handleFileSelect}
        />
      </div>

      <Dialog
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {t('profile.preview_photo') || 'Preview Photo'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <Avatar className="h-40 w-40 border-4 border-muted shadow-lg mb-6">
              <AvatarImage src={previewImage || ''} className="object-cover" />
              <AvatarFallback>Preview</AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground text-center">
              {t('profile.confirm_photo') ||
                'Do you want to set this as your new profile picture?'}
            </p>
          </div>
          <DialogFooter className="flex sm:justify-between w-full gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setPreviewImage(null)}
              className="w-full sm:w-auto h-11"
            >
              <X className="mr-2 h-4 w-4" /> {t('common.cancel')}
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto h-11">
              <Check className="mr-2 h-4 w-4" /> {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
