import { ProfileAvatar } from '@/components/ProfileAvatar'
import { ProfileEditForm } from '@/components/ProfileEditForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useLanguage } from '@/stores/LanguageContext'

export default function Profile() {
  const { t } = useLanguage()

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-fade-in-up mb-16 md:mb-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('profile.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('profile.subtitle')}</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr] items-start">
        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardContent className="pt-6 flex flex-col items-center">
            <ProfileAvatar />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.personalInfo')}</CardTitle>
            <CardDescription>{t('profile.desc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
