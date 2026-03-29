import { FranchiseeCurrentAccountTab } from '@/components/franchisee/FranchiseeCurrentAccountTab'

export function AdminCurrentAccountTab() {
  // Admin view - no franchiseId passed, means it views global financial statements
  return <FranchiseeCurrentAccountTab />
}
