import { useState } from 'react'
import { TravelDashboard } from '@/components/TravelDashboard'
import { TravelDetail } from '@/components/TravelDetail'

export default function TravelPlanner() {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  if (selectedTripId) {
    return (
      <TravelDetail
        tripId={selectedTripId}
        onBack={() => setSelectedTripId(null)}
      />
    )
  }

  return <TravelDashboard onSelectTrip={setSelectedTripId} />
}
