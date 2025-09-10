'use client'

import { useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  MapPin,
  Building2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface AnalyticsData {
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  averageScore: number
  searchesConducted: number
  timeframe: string
  trends: {
    leads: number
    conversion: number
    score: number
    searches: number
  }
  industryBreakdown: Array<{
    industry: string
    count: number
    percentage: number
    growth: number
  }>
  locationBreakdown: Array<{
    location: string
    count: number
    percentage: number
  }>
  scoreDistribution: Array<{
    range: string
    count: number
    percentage: number
  }>
  timeSeriesData: Array<{
    date: string
    leads: number
    qualified: number
    searches: number
  }>
}

const mockData: AnalyticsData = {
  totalLeads: 1247,
  qualifiedLeads: 342,
  conversionRate: 27.4,
  averageScore: 73,
  searchesConducted: 89,
  timeframe: 'Last 30 days',
  trends: {
    leads: 12.3,
    conversion: -2.1,
    score: 5.7,
    searches: 23.8
  },
  industryBreakdown: [
    { industry: 'SaaS & Software', count: 423, percentage: 33.9, growth: 15.2 },
    { industry: 'E-commerce', count: 287, percentage: 23.0, growth: 8.7 },
    { industry: 'Healthcare', count: 198, percentage: 15.9, growth: -3.1 },
    { industry: 'Financial Services', count: 156, percentage: 12.5, growth: 22.4 },
    { industry: 'Manufacturing', count: 183, percentage: 14.7, growth: 6.8 }
  ],
  locationBreakdown: [
    { location: 'San Francisco Bay Area', count: 312, percentage: 25.0 },
    { location: 'New York Metro', count: 234, percentage: 18.8 },
    { location: 'Los Angeles', count: 189, percentage: 15.2 },
    { location: 'Chicago', count: 145, percentage: 11.6 },
    { location: 'Austin', count: 123, percentage: 9.9 }
  ],
  scoreDistribution: [
    { range: '90-100', count: 156, percentage: 12.5 },
    { range: '80-89', count: 287, percentage: 23.0 },
    { range: '70-79', count: 398, percentage: 31.9 },
    { range: '60-69', count: 289, percentage: 23.2 },
    { range: '50-59', count: 117, percentage: 9.4 }
  ],
  timeSeriesData: [
    { date: '2024-01-01', leads: 42, qualified: 12, searches: 8 },
    { date: '2024-01-02', leads: 38, qualified: 15, searches: 6 },
    { date: '2024-01-03', leads: 51, qualified: 18, searches: 9 },
    // ... more data points
  ]
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d')
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1500)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track your lead generation performance and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-glass text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', refreshing && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Leads"
          value={mockData.totalLeads.toLocaleString()}
          change={mockData.trends.leads}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <MetricCard
          title="Qualified Leads"
          value={mockData.qualifiedLeads.toLocaleString()}
          change={mockData.trends.conversion}
          icon={Target}
          color="text-success-600"
          bgColor="bg-success-100"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${mockData.conversionRate}%`}
          change={mockData.trends.conversion}
          icon={TrendingUp}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <MetricCard
          title="Avg. Score"
          value={mockData.averageScore.toString()}
          change={mockData.trends.score}
          icon={BarChart3}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Score Distribution */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Lead Score Distribution</h3>
            <Button variant="ghost" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <div className="space-y-3">
            {mockData.scoreDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-16 text-sm text-gray-600">{item.range}</div>
                <div className="flex-1 relative">
                  <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-accent-purple rounded-full transition-all duration-1000"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {item.count}
                </div>
                <div className="w-12 text-sm text-gray-500 text-right">
                  {item.percentage}%
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Industry Breakdown */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Industries</h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {mockData.industryBreakdown.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500" />
                  <span className="text-sm text-gray-900">{item.industry}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                  <div className={cn(
                    'flex items-center gap-1 text-xs px-2 py-0.5 rounded-full',
                    item.growth >= 0 
                      ? 'text-success-700 bg-success-100'
                      : 'text-error-700 bg-error-100'
                  )}>
                    {item.growth >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(item.growth)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Time Series Chart */}
        <GlassCard className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lead Generation Over Time</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary-500" />
                <span className="text-gray-600">Total Leads</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-success-500" />
                <span className="text-gray-600">Qualified</span>
              </div>
            </div>
          </div>
          <div className="h-64 bg-gradient-to-t from-gray-50 to-transparent rounded-lg flex items-end justify-between px-4 pb-4">
            {/* Simplified chart representation */}
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-4 bg-primary-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                     style={{ height: `${Math.random() * 150 + 30}px` }} />
                <div className="w-4 bg-success-500 rounded-t"
                     style={{ height: `${Math.random() * 80 + 15}px` }} />
                <span className="text-xs text-gray-400">{i + 1}</span>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Geographic Distribution */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Locations</h3>
          <div className="space-y-3">
            {mockData.locationBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{item.location}</span>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {item.count} ({item.percentage}%)
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-sm">
            View All Locations
          </Button>
        </GlassCard>
      </div>

      {/* Insights & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <div className="space-y-4">
            <InsightCard
              title="Peak Performance Times"
              insight="Your searches perform 23% better on Tuesday-Thursday between 10 AM - 2 PM EST"
              type="timing"
            />
            <InsightCard
              title="Untapped Opportunity"
              insight="Healthcare leads have 15% higher conversion but represent only 12% of searches"
              type="opportunity"
            />
            <InsightCard
              title="Quality Improvement"
              insight="Adding 'funding status' filter increases lead score by avg. 8 points"
              type="optimization"
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-success-600" />
            <h3 className="text-lg font-semibold text-gray-900">Recommended Actions</h3>
          </div>
          <div className="space-y-3">
            <ActionCard
              title="Focus on SaaS Leads"
              description="SaaS leads have 31% higher conversion rates"
              action="Adjust search criteria"
              priority="high"
            />
            <ActionCard
              title="Expand to Austin Market"
              description="Austin shows strong growth potential with high-quality leads"
              action="Create targeted search"
              priority="medium"
            />
            <ActionCard
              title="Optimize Low-Score Segments"
              description="29% of leads score below 60 - review qualification criteria"
              action="Update scoring model"
              priority="low"
            />
          </div>
        </GlassCard>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  bgColor
}: {
  title: string
  value: string
  change: number
  icon: any
  color: string
  bgColor: string
}) {
  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', bgColor)}>
          <Icon className={cn('w-6 h-6', color)} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        {change >= 0 ? (
          <ArrowUpRight className="w-4 h-4 text-success-600" />
        ) : (
          <ArrowDownRight className="w-4 h-4 text-error-600" />
        )}
        <span className={cn(
          'text-sm font-medium',
          change >= 0 ? 'text-success-600' : 'text-error-600'
        )}>
          {Math.abs(change)}%
        </span>
        <span className="text-sm text-gray-500">vs last period</span>
      </div>
    </GlassCard>
  )
}

function InsightCard({
  title,
  insight,
  type
}: {
  title: string
  insight: string
  type: 'timing' | 'opportunity' | 'optimization'
}) {
  const icons = {
    timing: Clock,
    opportunity: TrendingUp,
    optimization: Zap
  }
  
  const colors = {
    timing: 'text-blue-600 bg-blue-100',
    opportunity: 'text-success-600 bg-success-100',
    optimization: 'text-purple-600 bg-purple-100'
  }

  const Icon = icons[type]

  return (
    <div className="flex gap-3">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colors[type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-0.5">{insight}</p>
      </div>
    </div>
  )
}

function ActionCard({
  title,
  description,
  action,
  priority
}: {
  title: string
  description: string
  action: string
  priority: 'high' | 'medium' | 'low'
}) {
  const priorityColors = {
    high: 'border-error-200 bg-error-50',
    medium: 'border-warning-200 bg-warning-50',
    low: 'border-gray-200 bg-gray-50'
  }

  return (
    <div className={cn('p-3 rounded-lg border', priorityColors[priority])}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full',
          priority === 'high' ? 'badge-error' : priority === 'medium' ? 'badge-warning' : 'badge-gray'
        )}>
          {priority}
        </span>
      </div>
      <p className="text-xs text-gray-600 mb-2">{description}</p>
      <Button size="sm" variant="ghost" className="text-xs h-6">
        {action}
      </Button>
    </div>
  )
}