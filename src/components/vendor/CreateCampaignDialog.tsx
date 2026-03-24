import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CampaignFormDialog } from '@/components/merchant/CampaignFormDialog'

export function CreateCampaignDialog({ company }: any) {
  const [isOpen, setIsOpen] = useState(false)

  if (!company) return null

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto font-bold shadow-md hover:-translate-y-0.5 transition-transform bg-primary hover:bg-primary/90 text-white"
      >
        <Plus className="w-4 h-4 mr-2" /> New Campaign
      </Button>
      <CampaignFormDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        companyId={company.id}
      />
    </>
  )
}
