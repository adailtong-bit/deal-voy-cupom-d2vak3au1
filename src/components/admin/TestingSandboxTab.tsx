import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, User, Building, Store } from 'lucide-react'
import { useLanguage } from '@/stores/LanguageContext'

export function TestingSandboxTab({ franchiseId }: { franchiseId?: string }) {
  const { t } = useLanguage()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold">
          {t('admin.sandbox', 'Testing Sandbox')}
        </h2>
        <p className="text-muted-foreground">
          Predefined test profiles for validation and geographic logic.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Individual Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Individual Profile
            </CardTitle>
            <CardDescription>End-user scenario testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-right">Carlos Silva</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Age</span>
              <span className="font-medium text-right">28</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Gender</span>
              <span className="font-medium text-right">Male</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </span>
              <span className="font-medium text-right">
                Brazil &gt; São Paulo &gt; São Paulo &gt; CEP: 01001-000
              </span>
            </div>
            <div className="pt-2">
              <span className="text-muted-foreground block mb-2">
                Interests
              </span>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">Gastronomia</Badge>
                <Badge variant="secondary">Tecnologia</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Company Profile
            </CardTitle>
            <CardDescription>B2B Partner scenario testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-right">
                Global Travel Agency
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <span className="font-medium text-right">Turismo</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </span>
              <span className="font-medium text-right">
                Portugal &gt; Lisboa &gt; Lisboa &gt; ZIP: 1000-001
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <span className="text-muted-foreground">Status</span>
              <div className="text-right">
                <Badge className="bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Franchise Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-orange-500" />
              Franchise Profile
            </CardTitle>
            <CardDescription>Multi-branch scenario testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium text-right">
                Burger Hub - Unidade Centro
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Parent Brand</span>
              <span className="font-medium text-right">Burger Hub Global</span>
            </div>
            <div className="grid grid-cols-2 gap-2 border-b pb-2">
              <span className="text-muted-foreground">Franchise ID</span>
              <span className="font-mono text-right">FR-001</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2 pt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </span>
              <span className="font-medium text-right">
                Brazil &gt; Rio de Janeiro &gt; Rio de Janeiro &gt; CEP:
                20040-002
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
