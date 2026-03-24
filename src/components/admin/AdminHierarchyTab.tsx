import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building,
  Store,
  Users,
  CheckSquare,
  Activity,
  FileStack,
} from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { FranchisesTab } from './hierarchy/FranchisesTab'
import { MerchantsTab } from './hierarchy/MerchantsTab'
import { StaffTab } from './hierarchy/StaffTab'
import { PendingApprovalsTab } from './hierarchy/PendingApprovalsTab'
import { AuditLogsTab } from './hierarchy/AuditLogsTab'
import { PerformanceDashboardTab } from './hierarchy/PerformanceDashboardTab'

export function AdminHierarchyTab() {
  const { user, franchises, companies } = useCouponStore()
  const { t } = useLanguage()

  const isSuperAdmin = user?.role === 'super_admin'
  const myFranchiseId =
    user?.role === 'franchisee'
      ? franchises.find((f) => f.ownerId === user.id)?.id
      : undefined

  const pendingCount = companies.filter((c) => c.status === 'pending').length

  return (
    <Tabs
      defaultValue={isSuperAdmin ? 'performance' : 'merchants'}
      className="w-full animate-fade-in"
    >
      <TabsList className="mb-6 flex flex-wrap h-auto gap-2 justify-start p-1 bg-slate-100 rounded-lg">
        {isSuperAdmin && (
          <TabsTrigger value="performance" className="py-2">
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        )}
        {isSuperAdmin && (
          <TabsTrigger value="franchises" className="py-2">
            <Building className="h-4 w-4 mr-2" />
            Franchises
          </TabsTrigger>
        )}
        <TabsTrigger value="merchants" className="py-2">
          <Store className="h-4 w-4 mr-2" />
          Merchants
        </TabsTrigger>
        {isSuperAdmin && (
          <TabsTrigger value="approvals" className="py-2 relative">
            <CheckSquare className="h-4 w-4 mr-2" />
            Approvals
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full shadow-sm">
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
        )}
        <TabsTrigger value="staff" className="py-2">
          <Users className="h-4 w-4 mr-2" />
          Manage Team
        </TabsTrigger>
        {isSuperAdmin && (
          <TabsTrigger value="audit" className="py-2">
            <FileStack className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
        )}
      </TabsList>

      {isSuperAdmin && (
        <>
          <TabsContent value="performance">
            <PerformanceDashboardTab />
          </TabsContent>
          <TabsContent value="franchises">
            <FranchisesTab />
          </TabsContent>
          <TabsContent value="approvals">
            <PendingApprovalsTab />
          </TabsContent>
          <TabsContent value="audit">
            <AuditLogsTab />
          </TabsContent>
        </>
      )}

      <TabsContent value="merchants">
        <MerchantsTab franchiseId={!isSuperAdmin ? myFranchiseId : undefined} />
      </TabsContent>

      <TabsContent value="staff">
        <StaffTab
          parentType={isSuperAdmin ? 'global' : 'franchise'}
          parentId={myFranchiseId}
        />
      </TabsContent>
    </Tabs>
  )
}
