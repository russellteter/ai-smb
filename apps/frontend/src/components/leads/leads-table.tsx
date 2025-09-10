import { ExternalLink, Phone, Globe, Star, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { formatPhoneNumber, truncateUrl, formatScore } from '../../lib/utils'

interface Lead {
  rank: number
  score: number
  name: string
  city: string
  state: string
  website: string | null
  phone: string
  signals: Record<string, boolean>
  owner: string
  review_count: number
}

interface LeadsTableProps {
  leads: Lead[]
  onSelectLead?: (lead: Lead) => void
}

export function LeadsTable({ leads, onSelectLead }: LeadsTableProps) {
  if (leads.length === 0) {
    return null
  }

  const getScoreVariant = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'secondary'
  }

  const getSignalBadges = (signals: Record<string, boolean>) => {
    const activeSignals = Object.entries(signals)
      .filter(([_, value]) => value)
      .map(([key]) => key)

    const signalLabels: Record<string, string> = {
      no_website: 'No Website',
      has_chatbot: 'Has Chatbot',
      has_online_booking: 'Online Booking',
      owner_identified: 'Owner Known'
    }

    return activeSignals.map(signal => (
      <Badge key={signal} variant="outline" className="text-xs">
        {signalLabels[signal] || signal}
      </Badge>
    ))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leads Found ({leads.length})</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead className="w-20">Score</TableHead>
                <TableHead className="min-w-[200px]">Business</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Signals</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onSelectLead?.(lead)}
                >
                  <TableCell className="font-mono text-sm text-gray-500">
                    #{lead.rank}
                  </TableCell>
                  
                  <TableCell>
                    <Badge variant={getScoreVariant(lead.score)} className="font-mono">
                      {formatScore(lead.score)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium text-gray-900">{lead.name}</div>
                      {lead.review_count > 0 && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {lead.review_count} reviews
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {lead.city}, {lead.state}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-2">
                      {lead.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-2 text-gray-400" />
                          <span className="font-mono text-xs">
                            {formatPhoneNumber(lead.phone)}
                          </span>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center text-sm">
                          <Globe className="h-3 w-3 mr-2 text-gray-400" />
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-xs hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {truncateUrl(lead.website)}
                          </a>
                        </div>
                      )}
                      {!lead.website && (
                        <div className="flex items-center text-sm text-gray-400">
                          <Globe className="h-3 w-3 mr-2" />
                          <span className="text-xs">No website</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getSignalBadges(lead.signals)}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}