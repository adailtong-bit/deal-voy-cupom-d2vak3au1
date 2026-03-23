import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, Store, Users } from 'lucide-react'
import { useCouponStore } from '@/stores/CouponContext'
import { useLanguage } from '@/stores/LanguageContext'
import { FranchisesTab } from './hierarchy/FranchisesTab'
import { MerchantsTab } from './hierarchy/MerchantsTab'
import { StaffTab } from './hierarchy/StaffTab'

export function AdminHierarchyTab() {
  const { user, franchises } = useCouponStore()
  const { t } = useLanguage()

  const isSuperAdmin = user?.role === 'super_admin'
  const myFranchiseId =
    user?.role === 'franchisee'
      ? franchises.find((f) => f.ownerId === user.id)?.id
      : undefined

  return (
    <Tabs
      defaultValue={isSuperAdmin ? 'franchises' : 'merchants'}
      className="w-full animate-fade-in"
    >
      <TabsList className="mb-4">
        {isSuperAdmin && (
          <TabsTrigger value="franchises">
            <Building className="h-4 w-4 mr-2" />
            Franchises
          </TabsTrigger>
        )}
        <TabsTrigger value="merchants">
          <Store className="h-4 w-4 mr-2" />
          Merchants
        </TabsTrigger>
        <TabsTrigger value="staff">
          <Users className="h-4 w-4 mr-2" />
          Manage Team
        </TabsTrigger>
      </TabsList>

      {isSuperAdmin && (
        <TabsContent value="franchises">
          <FranchisesTab />
        </TabsContent>
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
