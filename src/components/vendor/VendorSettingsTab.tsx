import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Store, Save } from 'lucide-react'

export function VendorSettingsTab({ company }: any) {
  return (
    <Card className="max-w-2xl border-slate-200 shadow-sm animate-fade-in-up">
      <CardHeader className="border-b bg-slate-50/50 pb-5">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Store Settings</CardTitle>
            <CardDescription>
              Manage your business profile and administrative preferences.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="space-y-2">
          <Label className="text-slate-700">Store Name</Label>
          <Input defaultValue={company?.name} className="bg-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700">Contact Email</Label>
            <Input
              type="email"
              defaultValue={company?.email}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-700">Business Phone</Label>
            <Input
              defaultValue={company?.businessPhone || ''}
              placeholder="+1 555-0000"
              className="bg-white"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">Assigned Region</Label>
          <Input
            defaultValue={company?.region || 'Global'}
            disabled
            className="bg-slate-50 text-slate-500 font-medium"
          />
          <p className="text-xs text-slate-400 mt-1">
            Regions are managed centrally by the Master Franchisee.
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button className="font-bold shadow-sm">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
