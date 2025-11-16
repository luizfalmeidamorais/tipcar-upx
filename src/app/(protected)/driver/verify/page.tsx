import VerifyClient from './ui/VerifyClient'
import { requestDriverVerification, approveMe } from './actions'

export default function Page() {
    return <VerifyClient action={requestDriverVerification} demoApprove={approveMe} />
}