'use client'

import { useState, useEffect } from 'react'
import {
  X,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Edit,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Linkedin,
  Twitter,
  Facebook,
  FileText,
  Download,
  Send,
  Copy,
  BarChart3,
  Cpu,
  ShoppingCart,
  CreditCard,
  Shield,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Lead } from '@/types'

interface LeadDetailPanelProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (lead: Lead) => void
}

export function LeadDetailPanel({ lead, isOpen, onClose, onUpdate }: LeadDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'insights' | 'history'>('overview')
  const [notes, setNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!lead) return null

  const scoreColor = lead.score >= 80 
    ? 'text-success-600 bg-success-100' 
    : lead.score >= 60 
    ? 'text-warning-600 bg-warning-100'
    : 'text-gray-600 bg-gray-100'

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-2xl glass-surface z-50 transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/20">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-purple/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{lead.industry}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">{lead.location}</span>
                    <span className="text-gray-300">•</span>
                    <div className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', scoreColor)}>
                      Score: {lead.score}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 mt-4">
              <Button className="button-primary">
                <Phone className="w-4 h-4 mr-2" />
                Call
              </Button>
              <Button className="button-secondary">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button className="button-secondary">
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Note
              </Button>
              <Button variant="ghost" className="ml-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mt-4 -mb-6">
              {(['overview', 'contacts', 'insights', 'history'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors',
                    activeTab === tab
                      ? 'bg-white/10 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Key Information */}
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Company Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={Globe} label="Website" value={lead.website} isLink />
                    <InfoItem icon={Phone} label="Phone" value={lead.phone} />
                    <InfoItem icon={Mail} label="Email" value={lead.email} />
                    <InfoItem icon={MapPin} label="Address" value={lead.address || lead.location} />
                    <InfoItem icon={Users} label="Company Size" value={lead.size} />
                    <InfoItem icon={DollarSign} label="Revenue" value={lead.revenue || 'Not available'} />
                    <InfoItem icon={Calendar} label="Founded" value={lead.founded || 'Not available'} />
                    <InfoItem icon={TrendingUp} label="Growth Rate" value="15% YoY" />
                  </div>
                </GlassCard>

                {/* Signals */}
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Buying Signals</h3>
                  <div className="space-y-2">
                    {lead.signals.map((signal, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/50">
                        <CheckCircle className="w-5 h-5 text-success-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{signal}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Detected 2 days ago</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Technologies */}
                {lead.technologies && (
                  <GlassCard className="p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Technology Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {lead.technologies.map((tech, i) => (
                        <span key={i} className="badge-primary">
                          <Cpu className="w-3 h-3 mr-1" />
                          {tech}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Social Links */}
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Social Presence</h3>
                  <div className="flex gap-2">
                    {lead.socialLinks?.linkedin && (
                      <a href={lead.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {lead.socialLinks?.twitter && (
                      <a href={lead.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Twitter className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    {lead.socialLinks?.facebook && (
                      <a href={lead.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon">
                          <Facebook className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                  </div>
                </GlassCard>
              </>
            )}

            {activeTab === 'contacts' && (
              <div className="space-y-4">
                {lead.contacts?.map((contact, i) => (
                  <GlassCard key={i} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.title}</p>
                        <div className="flex gap-4 mt-2">
                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                              {contact.email}
                            </a>
                          )}
                          {contact.phone && (
                            <a href={`tel:${contact.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                              {contact.phone}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No contacts found yet</p>
                    <Button className="mt-3" variant="outline">
                      Add Contact
                    </Button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="space-y-4">
                {/* Opportunities */}
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Opportunities</h3>
                  <div className="space-y-3">
                    <OpportunityItem
                      icon={Zap}
                      title="Process Automation"
                      value="High potential for workflow automation"
                      confidence={85}
                    />
                    <OpportunityItem
                      icon={BarChart3}
                      title="Data Analytics"
                      value="Could benefit from predictive analytics"
                      confidence={72}
                    />
                    <OpportunityItem
                      icon={MessageSquare}
                      title="Customer Service AI"
                      value="No chatbot detected on website"
                      confidence={90}
                    />
                  </div>
                </GlassCard>

                {/* Market Position */}
                <GlassCard className="p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Position</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Industry Rank</span>
                      <span className="font-medium">#47 in {lead.industry}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growth Trajectory</span>
                      <span className="font-medium text-success-600">↑ Growing</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Digital Maturity</span>
                      <span className="font-medium">Medium</span>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-3">
                {lead.history?.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500">
                        {item.user} • {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No activity history yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200/20">
            <div className="flex gap-2">
              <Button className="flex-1 button-primary">
                <Send className="w-4 h-4 mr-2" />
                Send Proposal
              </Button>
              <Button className="flex-1" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="ghost">
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function InfoItem({ 
  icon: Icon, 
  label, 
  value, 
  isLink = false 
}: { 
  icon: any
  label: string
  value?: string
  isLink?: boolean 
}) {
  const content = (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={cn(
          "text-sm font-medium",
          isLink ? "text-primary-600 hover:text-primary-700" : "text-gray-900"
        )}>
          {value || 'Not available'}
        </p>
      </div>
    </div>
  )

  if (isLink && value) {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return content
}

function OpportunityItem({ 
  icon: Icon, 
  title, 
  value, 
  confidence 
}: { 
  icon: any
  title: string
  value: string
  confidence: number 
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-primary-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-primary rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{confidence}%</span>
        </div>
      </div>
    </div>
  )
}