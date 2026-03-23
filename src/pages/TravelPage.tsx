import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { TravelDashboard } from '@/components/TravelDashboard'
import { TravelDetail } from '@/components/TravelDetail'
import { CreateTripWizard } from '@/components/CreateTripWizard'

export default function TravelPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isNew = location.pathname === '/travel/new'

  if (id && id !== 'new') {
    return <TravelDetail tripId={id} onBack={() => navigate('/travel')} />
  }

  return (
    <>
      <TravelDashboard
        onSelectTrip={(tripId) => navigate(`/travel/${tripId}`)}
        onCreateNew={() => navigate('/travel/new')}
      />
      {isNew && (
        <CreateTripWizard
          isOpen={true}
          onClose={() => navigate('/travel')}
          onCreated={(trip) => navigate(`/travel/${trip.id}`)}
        />
      )}
    </>
  )
}
