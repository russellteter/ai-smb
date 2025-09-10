'use client'

import { useState } from 'react'
import {
  X,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Copy,
  CheckCircle,
  Sparkles,
  User,
  Building2,
  Calendar,
  FileText,
  Zap,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { Lead } from '@/types'

interface ContactModalProps {
  leads: Lead[]
  isOpen: boolean
  onClose: () => void
  onSend?: (method: string, message: string, leads: Lead[]) => void
}

const emailTemplates = [
  {
    id: 'intro',
    name: 'Introduction',
    subject: 'AI Solutions for {{companyName}}',
    content: `Hi {{contactName}},

I noticed that {{companyName}} is doing great work in the {{industry}} space. I thought you might be interested in how AI automation could help streamline your operations and boost efficiency.

We've helped similar companies in your industry:
• Reduce manual tasks by 60%
• Improve customer response times by 3x
• Scale operations without adding headcount

Would you be open to a brief 15-minute conversation to explore how this could apply to {{companyName}}?

Best regards,
[Your name]`,
  },
  {
    id: 'value-prop',
    name: 'Value Proposition',
    subject: 'Quick question about {{companyName}}\'s growth plans',
    content: `Hi {{contactName}},

Congrats on {{companyName}}'s growth! I was researching companies in {{industry}} and was impressed by your trajectory.

Quick question: As you scale, are operational bottlenecks starting to slow you down?

We specialize in helping {{industry}} companies automate their most time-consuming processes. Our clients typically see:
• 40-70% reduction in manual work
• Faster decision-making with AI insights
• More time to focus on strategic growth

Worth a quick chat to see if this resonates?

Best,
[Your name]`,
  },
  {
    id: 'problem-solution',
    name: 'Problem + Solution',
    subject: 'Solving the {{industry}} efficiency challenge',
    content: `Hi {{contactName}},

Most {{industry}} companies we talk to face the same challenge: great growth, but operations that can't keep up.

Sound familiar?

We've developed AI solutions specifically for this challenge. Here's what we typically help with:

1. Automating repetitive tasks that eat up your team's time
2. Creating intelligent workflows that scale with your growth
3. Providing AI insights for faster, better decision-making

Companies like yours usually see ROI within 2-3 months.

Interested in learning more? I can share some relevant case studies.

Best regards,
[Your name]`,
  },
]

export function ContactModal({ leads, isOpen, onClose, onSend }: ContactModalProps) {
  const [method, setMethod] = useState<'email' | 'phone' | 'linkedin'>('email')
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0])
  const [customMessage, setCustomMessage] = useState(selectedTemplate.content)
  const [subject, setSubject] = useState(selectedTemplate.subject)
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleTemplateSelect = (template: typeof emailTemplates[0]) => {
    setSelectedTemplate(template)
    setCustomMessage(template.content)
    setSubject(template.subject)
  }

  const handleSend = async () => {
    setIsSending(true)
    await onSend?.(method, customMessage, leads)
    setIsSending(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const personalizeMessage = (message: string, lead: Lead) => {
    return message
      .replace(/{{companyName}}/g, lead.name)
      .replace(/{{contactName}}/g, lead.contacts?.[0]?.name || 'there')
      .replace(/{{industry}}/g, lead.industry)
  }

  const personalizeSubject = (subject: string, lead: Lead) => {
    return subject
      .replace(/{{companyName}}/g, lead.name)
      .replace(/{{industry}}/g, lead.industry)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] glass-surface rounded-2xl animate-scale-in overflow-hidden">
        <div className="flex h-full max-h-[90vh]">
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200/20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Contact Leads</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Reaching out to {leads.length} selected lead{leads.length > 1 ? 's' : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Method Selection */}
              <div className="flex gap-2 mt-4">
                {[
                  { method: 'email' as const, icon: Mail, label: 'Email' },
                  { method: 'phone' as const, icon: Phone, label: 'Phone' },
                  { method: 'linkedin' as const, icon: MessageSquare, label: 'LinkedIn' },
                ].map(({ method: m, icon: Icon, label }) => (
                  <Button
                    key={m}
                    variant={method === m ? 'default' : 'outline'}
                    onClick={() => setMethod(m)}
                    className={method === m ? 'button-primary' : ''}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Templates & Message */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                {method === 'email' && (
                  <>
                    {/* Templates */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Email Templates</h3>
                      <div className="flex gap-2">
                        {emailTemplates.map((template) => (
                          <Button
                            key={template.id}
                            variant={selectedTemplate.id === template.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleTemplateSelect(template)}
                            className={selectedTemplate.id === template.id ? 'button-primary' : ''}
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {template.name}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Subject Line */}
                    <div className="mb-4">
                      <label className="label-base">Subject Line</label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-glass w-full"
                        placeholder="Email subject..."
                      />
                    </div>
                  </>
                )}

                {/* Message */}
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <label className="label-base">Message</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="text-xs"
                    >
                      {copied ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Copy className="w-3 h-3 mr-1" />
                      )}
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="input-glass flex-1 min-h-64 resize-none"
                    placeholder="Your message..."
                  />
                </div>

                {/* AI Enhancement */}
                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-primary-50 to-accent-purple/5 border border-primary-200/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-primary-600" />
                    <span className="text-sm font-semibold text-primary-900">AI Enhancement</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="text-xs">
                      Make it more personal
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Improve tone
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs">
                      Add urgency
                    </Button>
                  </div>
                </div>
              </div>

              {/* Preview & Leads */}
              <div className="w-80 border-l border-gray-200/20 p-6 overflow-y-auto">
                {/* Preview */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                  <GlassCard className="p-4 text-sm">
                    {method === 'email' && (
                      <>
                        <div className="mb-2">
                          <strong>Subject:</strong> {personalizeSubject(subject, leads[0])}
                        </div>
                        <div className="border-t border-gray-200/20 pt-2 mt-2">
                          <div className="whitespace-pre-wrap">
                            {personalizeMessage(customMessage, leads[0]).substring(0, 200)}
                            {personalizeMessage(customMessage, leads[0]).length > 200 && '...'}
                          </div>
                        </div>
                      </>
                    )}
                    {method === 'phone' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary-600" />
                          <span className="font-medium">Phone Script</span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Use this as a conversation starter when calling leads.
                        </p>
                      </div>
                    )}
                  </GlassCard>
                </div>

                {/* Selected Leads */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Selected Leads ({leads.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {leads.map((lead) => (
                      <div key={lead.id} className="glass rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{lead.name}</span>
                        </div>
                        {lead.contacts?.[0] && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <User className="w-3 h-3" />
                            <span>{lead.contacts[0].name} - {lead.contacts[0].title}</span>
                          </div>
                        )}
                        {method === 'email' && lead.email && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Mail className="w-3 h-3" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                        {method === 'phone' && lead.phone && (
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Messages will be sent individually with 2-second delays</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isSending || !customMessage.trim()}
                    className="button-primary"
                  >
                    {isSending ? (
                      <>
                        <div className="loading-spinner mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {leads.length} Lead{leads.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}