import { createRide } from './actions'
import NewRideForm from './ui/NewRideForm'

export default function Page() {
    return <NewRideForm action={createRide} />
}
