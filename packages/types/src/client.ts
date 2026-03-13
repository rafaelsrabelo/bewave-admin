export type ClientStatus = 'lead' | 'active'

export type Client = {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  contractMonths: number
  paid: boolean
  status: ClientStatus
  createdAt: string
  updatedAt: string
}
