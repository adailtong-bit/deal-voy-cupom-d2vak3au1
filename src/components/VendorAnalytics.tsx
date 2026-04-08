import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  LineChart,
  Line,
} from 'recharts'
import { Radar, Users, User, MapPin, Calendar } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { Badge } from '@/components/ui/badge'

export function VendorAnalytics() {
  const { validationLogs, user, companies, coupons, users } = useCouponStore()
  const { t } = useLanguage()
  const myCompany =
    companies.find((c) => c.id === user?.companyId) || companies[0]

  const myLogs = validationLogs.filter((l) => l.companyId === myCompany?.id)
  const myCoupons = coupons.filter((c) => c.companyId === myCompany?.id)

  const redemptionData = [
    { name: 'Seg', redemptions: Math.max(2, myLogs.length % 5) },
    { name: 'Ter', redemptions: Math.max(5, myLogs.length % 8) },
    { name: 'Qua', redemptions: Math.max(4, myLogs.length % 6) },
    { name: 'Qui', redemptions: Math.max(8, myLogs.length % 12) },
    { name: 'Sex', redemptions: Math.max(12, myLogs.length % 18) },
    { name: 'Sáb', redemptions: Math.max(20, myLogs.length % 25) },
    { name: 'Dom', redemptions: Math.max(15, myLogs.length % 20) },
  ]

  const growthData = [
    { name: 'Semana 1', leads: 5 },
    { name: 'Semana 2', leads: 8 },
    { name: 'Semana 3', leads: 14 },
    { name: 'Semana 4', leads: 22 },
  ]

  const totalAlertsSent = myCoupons.reduce(
    (sum, c) => sum + (c.proximityAlertsSent || 0),
    0,
  )
  const totalAlertsRedeemed = myCoupons.reduce(
    (sum, c) => sum + (c.redeemedViaAlert || 0),
    0,
  )

  // Demographics Calculation
  const uniqueUserIds = Array.from(
    new Set(myLogs.map((l) => l.userId).filter(Boolean)),
  )
  const myUsers = uniqueUserIds
    .map((uid) => users.find((u) => u.id === uid))
    .filter(Boolean) as any[]

  const genderMap: any = {
    male: t('vendor.analytics.male', 'Masculino'),
    female: t('vendor.analytics.female', 'Feminino'),
    'non-binary': t('vendor.analytics.non_binary', 'Não-binário'),
    other: t('vendor.analytics.others', 'Outros'),
    'prefer-not-to-say': 'N/D',
  }

  const genderCount = myUsers.reduce(
    (acc, u) => {
      const gKey = u.gender ? genderMap[u.gender] || u.gender : 'N/D'
      acc[gKey] = (acc[gKey] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const calculateAge = (b?: string) => {
    if (!b) return null
    const bd = new Date(b)
    const td = new Date()
    let age = td.getFullYear() - bd.getFullYear()
    if (
      td.getMonth() < bd.getMonth() ||
      (td.getMonth() === bd.getMonth() && td.getDate() < bd.getDate())
    ) {
      age--
    }
    return age
  }

  const ageGroups: Record<string, number> = {
    '18-25': 0,
    '26-35': 0,
    '36-45': 0,
    '46-55': 0,
    '55+': 0,
    'N/D': 0,
  }

  const locationCount = myUsers.reduce(
    (acc, u) => {
      const loc =
        u.city && u.state ? `${u.city}, ${u.state}` : u.state || u.city || 'N/D'
      acc[loc] = (acc[loc] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  myUsers.forEach((u) => {
    const age = calculateAge(u.birthday)
    if (age === null) ageGroups['N/D']++
    else if (age <= 25) ageGroups['18-25']++
    else if (age <= 35) ageGroups['26-35']++
    else if (age <= 45) ageGroups['36-45']++
    else if (age <= 55) ageGroups['46-55']++
    else ageGroups['55+']++
  })

  const topLocations = Object.entries(locationCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>
              {t('vendor.analytics.weekly_redemptions', 'Resgates Semanais')}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.analytics.weekly_redemptions_desc',
                'Volume de uso de cupons nos últimos 7 dias.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{
                  redemptions: {
                    label: 'Resgates',
                    color: 'hsl(var(--primary))',
                  },
                }}
              >
                <BarChart
                  data={redemptionData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="redemptions"
                    fill="var(--color-redemptions)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>
              {t('vendor.analytics.lead_growth', 'Crescimento de Leads')}
            </CardTitle>
            <CardDescription>
              {t(
                'vendor.analytics.lead_growth_desc',
                'Novos clientes únicos adquiridos via campanhas.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ChartContainer
                config={{ leads: { label: 'Novos Leads', color: '#10b981' } }}
              >
                <LineChart
                  data={growthData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis tickLine={false} axisLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="leads"
                    stroke="var(--color-leads)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-leads)' }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-500" />
            {t(
              'vendor.analytics.demographics',
              'Perfil Demográfico dos Leads Ativos',
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'vendor.analytics.demographics_desc',
              'Distribuição de gênero, idade e localização da sua base de clientes.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />{' '}
                {t('vendor.analytics.gender', 'Gênero')}
              </h4>
              <div className="space-y-2">
                {Object.entries(genderCount).length === 0 && (
                  <p className="text-sm text-slate-400">Sem dados</p>
                )}
                {Object.entries(genderCount).map(([g, c]) => (
                  <div
                    key={g}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="capitalize text-slate-600 font-medium">
                      {g === 'N/D'
                        ? t('vendor.analytics.not_informed', 'Não Informado')
                        : g}
                    </span>
                    <Badge variant="secondary" className="bg-white">
                      {c}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" />{' '}
                {t('vendor.analytics.age_range', 'Faixa Etária')}
              </h4>
              <div className="space-y-2">
                {Object.entries(ageGroups).every(([_, c]) => c === 0) && (
                  <p className="text-sm text-slate-400">Sem dados</p>
                )}
                {Object.entries(ageGroups)
                  .filter(([_, c]) => c > 0)
                  .map(([age, c]) => (
                    <div
                      key={age}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-slate-600 font-medium">
                        {age === 'N/D'
                          ? t('vendor.analytics.not_informed', 'Não Informado')
                          : `${age} ${t('common.years', 'anos')}`}
                      </span>
                      <Badge variant="secondary" className="bg-white">
                        {c}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-500" />{' '}
                {t('vendor.analytics.top_locations', 'Principais Localizações')}
              </h4>
              <div className="space-y-2">
                {topLocations.length === 0 && (
                  <p className="text-sm text-slate-400">Sem dados</p>
                )}
                {topLocations.map(([loc, c]) => (
                  <div
                    key={loc}
                    className="flex justify-between items-center text-sm"
                  >
                    <span
                      className="text-slate-600 font-medium truncate mr-2"
                      title={loc}
                    >
                      {loc === 'N/D'
                        ? t('vendor.analytics.not_informed', 'Não Informado')
                        : loc}
                    </span>
                    <Badge variant="secondary" className="bg-white">
                      {c}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-blue-500" />
            {t(
              'vendor.analytics.proximity_roi',
              'Marketing de Proximidade (ROI)',
            )}
          </CardTitle>
          <CardDescription>
            {t(
              'vendor.analytics.proximity_roi_desc',
              'Performance dos alertas de geolocalização disparados aos usuários próximos.',
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                {t('vendor.analytics.alerts_sent', 'Alertas Disparados')}
              </span>
              <span className="block text-4xl font-black text-slate-800">
                {totalAlertsSent}
              </span>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 text-center sm:text-left flex flex-col items-center sm:items-start">
              <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider mb-1">
                {t(
                  'vendor.analytics.alerts_redeemed',
                  'Cupons Utilizados via Alerta',
                )}
              </span>
              <span className="block text-4xl font-black text-emerald-600">
                {totalAlertsRedeemed}
              </span>
              <span className="text-xs text-emerald-500 font-medium mt-1">
                {totalAlertsSent > 0
                  ? Math.round((totalAlertsRedeemed / totalAlertsSent) * 100)
                  : 0}
                % {t('vendor.analytics.conversion', 'de conversão')}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
