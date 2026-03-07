import React, { useEffect, useState } from 'react'
import { apiGet } from '@/interceptor/interceptor'
import { Loader2, Phone, Mail, Video, MessageSquare, User, Calendar, Clock } from 'lucide-react'
import { format } from 'date-fns'
import EmptyState from '@/components/EmptyState'

function ChatDialog({ clientId }) {
  const [communications, setCommunications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (clientId) {
      fetchCommunicationHistory()
    }
  }, [clientId])

  const fetchCommunicationHistory = async () => {
    try {
      setLoading(true)
      const data = await apiGet(`client/communication-history/${clientId}`)
      if (data?.isSuccess) {
        setCommunications(data.communications || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'phone-call': return <Phone size={16} />
      case 'email': return <Mail size={16} />
      case 'video-meeting': return <Video size={16} />
      case 'whatsapp': return <MessageSquare size={16} />
      case 'in-person': return <User size={16} />
      default: return <MessageSquare size={16} />
    }
  }

  const getOutcomeColor = (outcome) => {
    switch (outcome) {
      case 'positive': return 'text-green-500 bg-green-500/20'
      case 'negative': return 'text-red-500 bg-red-500/20'
      case 'neutral': return 'text-gray-500 bg-gray-500/20'
      case 'followup-required': return 'text-orange-500 bg-orange-500/20'
      default: return 'text-gray-500 bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin" size={32} />
      </div>
    )
  }

  if (communications.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        {/* <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
        <p>No communication history found</p> */}
        <EmptyState icon={MessageSquare} title="No communication history found" subtitle="This client has no communication history yet"></EmptyState>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto">
      {communications.map((comm) => (
        <div
          key={comm._id}
          className="border border-[var(--border)] rounded-lg p-4 hover:bg-[var(--border)]/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-[var(--border)]">
                {getIcon(comm.communicationType)}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{comm.topic || 'No Topic'}</h3>
                <p className="text-xs text-[var(--muted-foreground)] capitalize">
                  {comm.communicationType?.replace('-', ' ')}
                </p>
              </div>
            </div>
            <span className={`text-xs px-2 py-1 capitalize rounded-full ${getOutcomeColor(comm.outcome)}`}>
              {comm.outcome?.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--muted-foreground)] mb-3">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {format(new Date(comm.date), 'MMM dd, yyyy')}
            </span>
            {comm.time && (
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {comm.time}
              </span>
            )}
            {comm.assignTo && (
              <span className="flex items-center gap-1">
                <User size={14} />
                {comm.assignTo.firstName} {comm.assignTo.lastName}
              </span>
            )}
          </div>

          {comm.notes && (
            <p className="text-sm text-[var(--muted-foreground)] bg-[var(--border)]/30 p-3 rounded">
              {comm.notes}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default ChatDialog
