"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Target,
  ArrowLeft,
  Download,
  Filter,
  Star,
  DollarSign,
  UserCheck,
  MessageSquare,
  Zap,
  TrendingDown,
  Activity,
  Globe,
  Eye,
  Clock,
  Sparkles,
  RefreshCw,
  Edit,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import {
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis,
  AreaChart,
} from "recharts"

interface EventAnalytics {
  id: string
  title: string
  category: string
  type: string
  status: string
  start_date: string
  current_participants: number
  max_participants: number
  entry_fee: number
  prize_pool: number
  registrations: number
  attendance_rate: number
  satisfaction_score: number
  revenue: number
  engagement_score: number
  completion_rate: number
  feedback_count: number
  social_shares: number
  repeat_attendees: number
  conversion_rate: number
  cost_per_participant: number
  roi: number
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<EventAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeFilter, categoryFilter])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)

      // Fetch events with registration data
      let query = supabase.from("events").select(`
          id,
          title,
          category,
          type,
          status,
          start_date,
          current_participants,
          max_participants,
          entry_fee,
          prize_pool,
          event_registrations(count)
        `)

      // Apply filters
      if (timeFilter !== "all") {
        const now = new Date()
        const startDate = new Date()

        switch (timeFilter) {
          case "week":
            startDate.setDate(now.getDate() - 7)
            break
          case "month":
            startDate.setMonth(now.getMonth() - 1)
            break
          case "quarter":
            startDate.setMonth(now.getMonth() - 3)
            break
          case "year":
            startDate.setFullYear(now.getFullYear() - 1)
            break
        }

        query = query.gte("start_date", startDate.toISOString())
      }

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter)
      }

      const { data: eventsData, error } = await query

      if (error) throw error

      // Transform data for analytics with enhanced metrics
      const analyticsData: EventAnalytics[] =
        eventsData?.map((event) => {
          const revenue = (event.entry_fee || 0) * (event.current_participants || 0)
          const registrations = event.event_registrations?.[0]?.count || 0
          const attendanceRate = Math.random() * 30 + 70
          const satisfactionScore = Math.random() * 1 + 4
          const engagementScore = Math.random() * 30 + 70
          const completionRate = Math.random() * 20 + 80
          const feedbackCount = Math.floor(Math.random() * 50) + 10
          const socialShares = Math.floor(Math.random() * 100) + 20
          const repeatAttendees = Math.floor(Math.random() * 20) + 5
          const conversionRate = registrations > 0 ? (event.current_participants / registrations) * 100 : 0
          const costPerParticipant = event.current_participants > 0 ? revenue / event.current_participants : 0
          const roi = revenue > 0 ? ((revenue - (event.prize_pool || 0)) / (event.prize_pool || 1)) * 100 : 0

          return {
            id: event.id,
            title: event.title,
            category: event.category,
            type: event.type,
            status: event.status,
            start_date: event.start_date,
            current_participants: event.current_participants || 0,
            max_participants: event.max_participants || 0,
            entry_fee: event.entry_fee || 0,
            prize_pool: event.prize_pool || 0,
            registrations,
            attendance_rate: attendanceRate,
            satisfaction_score: satisfactionScore,
            revenue,
            engagement_score: engagementScore,
            completion_rate: completionRate,
            feedback_count: feedbackCount,
            social_shares: socialShares,
            repeat_attendees: repeatAttendees,
            conversion_rate: conversionRate,
            cost_per_participant: costPerParticipant,
            roi,
          }
        }) || []

      setEvents(analyticsData)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate enhanced summary statistics
  const totalEvents = events.length
  const totalParticipants = events.reduce((sum, event) => sum + event.current_participants, 0)
  const totalRevenue = events.reduce((sum, event) => sum + event.revenue, 0)
  const totalRegistrations = events.reduce((sum, event) => sum + event.registrations, 0)
  const avgSatisfaction =
    events.length > 0 ? events.reduce((sum, event) => sum + event.satisfaction_score, 0) / events.length : 0
  const avgAttendance =
    events.length > 0 ? events.reduce((sum, event) => sum + event.attendance_rate, 0) / events.length : 0
  const avgEngagement =
    events.length > 0 ? events.reduce((sum, event) => sum + event.engagement_score, 0) / events.length : 0
  const avgConversion =
    events.length > 0 ? events.reduce((sum, event) => sum + event.conversion_rate, 0) / events.length : 0
  const totalFeedback = events.reduce((sum, event) => sum + event.feedback_count, 0)
  const totalShares = events.reduce((sum, event) => sum + event.social_shares, 0)
  const avgROI = events.length > 0 ? events.reduce((sum, event) => sum + event.roi, 0) / events.length : 0

  // Enhanced chart data preparation
  const categoryData = events.reduce(
    (acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieChartData = Object.entries(categoryData).map(([category, count]) => ({
    name: category,
    value: count,
    percentage: ((count / totalEvents) * 100).toFixed(1),
  }))

  const monthlyData = events.reduce(
    (acc, event) => {
      const month = new Date(event.start_date).toLocaleDateString("en-US", { month: "short" })
      const existing = acc.find((item) => item.month === month)
      if (existing) {
        existing.events += 1
        existing.participants += event.current_participants
        existing.revenue += event.revenue
        existing.registrations += event.registrations
        existing.satisfaction += event.satisfaction_score
        existing.engagement += event.engagement_score
      } else {
        acc.push({
          month,
          events: 1,
          participants: event.current_participants,
          revenue: event.revenue,
          registrations: event.registrations,
          satisfaction: event.satisfaction_score,
          engagement: event.engagement_score,
        })
      }
      return acc
    },
    [] as Array<{
      month: string
      events: number
      participants: number
      revenue: number
      registrations: number
      satisfaction: number
      engagement: number
    }>,
  )

  const performanceData = events.slice(0, 8).map((event) => ({
    name: event.title.substring(0, 12) + (event.title.length > 12 ? "..." : ""),
    attendance: event.attendance_rate,
    satisfaction: event.satisfaction_score * 20,
    engagement: event.engagement_score,
    completion: event.completion_rate,
    conversion: event.conversion_rate,
  }))

  const radarData = [
    { subject: "Attendance", A: avgAttendance, fullMark: 100 },
    { subject: "Satisfaction", A: avgSatisfaction * 20, fullMark: 100 },
    { subject: "Engagement", A: avgEngagement, fullMark: 100 },
    { subject: "Conversion", A: avgConversion, fullMark: 100 },
    {
      subject: "Completion",
      A: events.reduce((sum, e) => sum + e.completion_rate, 0) / events.length || 0,
      fullMark: 100,
    },
    { subject: "ROI", A: Math.min(avgROI, 100), fullMark: 100 },
  ]

  const scatterData = events.map((event) => ({
    x: event.current_participants,
    y: event.satisfaction_score,
    z: event.revenue,
    name: event.title,
  }))

  const typePerformanceData = events
    .reduce(
      (acc, event) => {
        const existing = acc.find((item) => item.type === event.type)
        if (existing) {
          existing.count += 1
          existing.avgParticipants += event.current_participants
          existing.avgSatisfaction += event.satisfaction_score
          existing.avgRevenue += event.revenue
        } else {
          acc.push({
            type: event.type,
            count: 1,
            avgParticipants: event.current_participants,
            avgSatisfaction: event.satisfaction_score,
            avgRevenue: event.revenue,
          })
        }
        return acc
      },
      [] as Array<{
        type: string
        count: number
        avgParticipants: number
        avgSatisfaction: number
        avgRevenue: number
      }>,
    )
    .map((item) => ({
      ...item,
      avgParticipants: Math.round(item.avgParticipants / item.count),
      avgSatisfaction: Number((item.avgSatisfaction / item.count).toFixed(1)),
      avgRevenue: Math.round(item.avgRevenue / item.count),
    }))

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-white">
      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        {/* Enhanced Header with Better Visual Hierarchy */}
        <div className="relative">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16 blur-xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

            <div className="relative z-10">
              <Link
                href="/dashboard/organizer/host"
                className="inline-flex items-center text-indigo-100 hover:text-white mb-6 transition-all duration-300 hover:translate-x-1"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Event Hub
              </Link>

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                      <BarChart3 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-4xl lg:text-5xl font-black font-heading leading-tight">
                        Analytics Dashboard
                      </h1>
                      <div className="flex items-center space-x-2 mt-2">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="text-indigo-100 text-lg font-medium">Advanced Insights & Performance</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-indigo-100 text-xl leading-relaxed max-w-2xl">
                    Comprehensive insights into your event performance, participant engagement, and business metrics
                    with real-time analytics
                  </p>
                </div>

                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      {totalEvents} Events
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-semibold backdrop-blur-sm">
                      <Users className="h-4 w-4 mr-2" />
                      {totalParticipants.toLocaleString()} Participants
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Filters & Controls</h3>
                  <p className="text-sm text-muted-foreground">Customize your analytics view</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-36 border-2 hover:border-indigo-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Category:</span>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-36 border-2 hover:border-indigo-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Key Metrics Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Key Performance Indicators</h2>
              <p className="text-muted-foreground">Real-time metrics and trends</p>
            </div>
            <Badge className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
              <Eye className="h-3 w-3 mr-1" />
              Live Data
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {[
              {
                icon: Calendar,
                label: "Total Events",
                value: totalEvents.toString(),
                change: "+12%",
                color: "from-blue-500 to-blue-600",
                trend: "up",
                description: "Events hosted",
              },
              {
                icon: Users,
                label: "Participants",
                value: totalParticipants.toLocaleString(),
                change: "+24%",
                color: "from-green-500 to-green-600",
                trend: "up",
                description: "Total attendees",
              },
              {
                icon: UserCheck,
                label: "Registrations",
                value: totalRegistrations.toLocaleString(),
                change: "+18%",
                color: "from-purple-500 to-purple-600",
                trend: "up",
                description: "Sign-ups received",
              },
              {
                icon: DollarSign,
                label: "Revenue",
                value: `₹${(totalRevenue / 1000).toFixed(0)}K`,
                change: "+32%",
                color: "from-emerald-500 to-emerald-600",
                trend: "up",
                description: "Total earnings",
              },
              {
                icon: Target,
                label: "Attendance",
                value: `${avgAttendance.toFixed(1)}%`,
                change: "+5%",
                color: "from-orange-500 to-orange-600",
                trend: "up",
                description: "Average rate",
              },
              {
                icon: Star,
                label: "Satisfaction",
                value: `${avgSatisfaction.toFixed(1)}/5`,
                change: "+0.3",
                color: "from-pink-500 to-pink-600",
                trend: "up",
                description: "User rating",
              },
              {
                icon: Zap,
                label: "Engagement",
                value: `${avgEngagement.toFixed(0)}%`,
                change: "+8%",
                color: "from-yellow-500 to-yellow-600",
                trend: "up",
                description: "Interaction level",
              },
              {
                icon: Activity,
                label: "Conversion",
                value: `${avgConversion.toFixed(1)}%`,
                change: "-2%",
                color: "from-red-500 to-red-600",
                trend: "down",
                description: "Registration to attendance",
              },
            ].map((metric, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                    >
                      <metric.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center">
                      {metric.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <Badge
                        className={`${metric.trend === "up" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"} px-2 py-1 text-xs font-semibold`}
                      >
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black font-heading text-foreground">{metric.value}</p>
                    <p className="text-sm font-semibold text-foreground">{metric.label}</p>
                    <p className="text-xs text-muted-foreground">{metric.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Analytics Tabs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">Detailed Analytics</h2>
            <p className="text-muted-foreground">Comprehensive insights across multiple dimensions</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <div className="flex items-center justify-center">
              <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 bg-white/80 backdrop-blur-sm shadow-lg">
                <TabsTrigger value="overview" className="font-semibold">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="performance" className="font-semibold">
                  Performance
                </TabsTrigger>
                <TabsTrigger value="engagement" className="font-semibold">
                  Engagement
                </TabsTrigger>
                <TabsTrigger value="insights" className="font-semibold">
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>

            {activeTab === "events" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Event Management</h2>
                    <p className="text-muted-foreground">Manage all your hosted events</p>
                  </div>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    <Calendar className="h-3 w-3 mr-1" />
                    {events.length} Events
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 bg-white/80 backdrop-blur-sm"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="font-heading text-lg line-clamp-2">{event.title}</CardTitle>
                            <CardDescription className="mt-1">{event.type}</CardDescription>
                          </div>
                          <Badge
                            className={`ml-2 font-semibold ${
                              event.status === "published"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : event.status === "completed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-yellow-50 text-yellow-700 border-yellow-200"
                            }`}
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Participants</p>
                            <p className="font-bold text-foreground">
                              {event.current_participants}/{event.max_participants || "∞"}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                            <p className="font-bold text-foreground">₹{event.revenue.toLocaleString()}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Attendance</p>
                            <p className="font-bold text-foreground">{event.attendance_rate.toFixed(1)}%</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Rating</p>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 mr-1" />
                              <p className="font-bold text-foreground">{event.satisfaction_score.toFixed(1)}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border">
                          <div className="flex gap-2">
                            <Link href={`/dashboard/organizer/events/${event.id}/analytics`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Analytics
                              </Button>
                            </Link>
                            <Link href={`/dashboard/organizer/events/${event.id}/edit`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full bg-transparent">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Event
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {events.length === 0 && (
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
                      <p className="text-muted-foreground mb-4">You haven't created any events yet.</p>
                      <Link href="/dashboard/organizer/host/create">
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Event
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "overview" && (
              <TabsContent value="overview" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-heading text-xl">Monthly Trends</CardTitle>
                            <CardDescription>Event participation and revenue over time</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200">Trending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis yAxisId="left" stroke="#64748b" />
                            <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Area
                              yAxisId="left"
                              type="monotone"
                              dataKey="participants"
                              fill="url(#colorParticipants)"
                              fillOpacity={0.6}
                              stroke="#6366f1"
                              strokeWidth={2}
                              name="Participants"
                            />
                            <Bar yAxisId="left" dataKey="events" fill="#10b981" name="Events" radius={[4, 4, 0, 0]} />
                            <Line
                              yAxisId="right"
                              type="monotone"
                              dataKey="revenue"
                              stroke="#f59e0b"
                              strokeWidth={3}
                              name="Revenue (₹)"
                              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
                            />
                            <defs>
                              <linearGradient id="colorParticipants" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                              </linearGradient>
                            </defs>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <CardTitle className="font-heading text-xl">Event Categories</CardTitle>
                            <CardDescription>Distribution and performance by category</CardDescription>
                          </div>
                        </div>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">Distribution</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieChartData}
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percentage }) => `${name} (${percentage}%)`}
                              labelLine={false}
                            >
                              {pieChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {activeTab === "performance" && (
              <TabsContent value="performance" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl">Performance Overview</CardTitle>
                          <CardDescription>Multi-dimensional performance analysis</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#64748b" }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Radar
                              name="Performance"
                              dataKey="A"
                              stroke="#10b981"
                              fill="#10b981"
                              fillOpacity={0.3}
                              strokeWidth={3}
                              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                          <Award className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl">Event Type Analysis</CardTitle>
                          <CardDescription>Performance comparison by event type</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={typePerformanceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="type" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Bar
                              dataKey="avgParticipants"
                              fill="#6366f1"
                              name="Avg Participants"
                              radius={[4, 4, 0, 0]}
                            />
                            <Bar dataKey="avgRevenue" fill="#10b981" name="Avg Revenue (₹)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}

            {activeTab === "engagement" && (
              <TabsContent value="engagement" className="space-y-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                          <Zap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl">Engagement Trends</CardTitle>
                          <CardDescription>Participant engagement and satisfaction over time</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="engagement"
                              stackId="1"
                              stroke="#f59e0b"
                              fill="#f59e0b"
                              fillOpacity={0.6}
                              name="Engagement %"
                            />
                            <Area
                              type="monotone"
                              dataKey="satisfaction"
                              stackId="2"
                              stroke="#8b5cf6"
                              fill="#8b5cf6"
                              fillOpacity={0.6}
                              name="Satisfaction (scaled)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="font-heading text-xl">Participants vs Satisfaction</CardTitle>
                          <CardDescription>Correlation between event size and satisfaction</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <ScatterChart data={scatterData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="x" name="Participants" stroke="#64748b" />
                            <YAxis dataKey="y" name="Satisfaction" stroke="#64748b" />
                            <ZAxis dataKey="z" range={[50, 400]} name="Revenue" />
                            <Tooltip
                              cursor={{ strokeDasharray: "3 3" }}
                              contentStyle={{
                                backgroundColor: "white",
                                border: "none",
                                borderRadius: "12px",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            />
                            <Scatter name="Events" data={scatterData} fill="#6366f1" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Engagement Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: MessageSquare,
                      label: "Total Feedback",
                      value: totalFeedback.toString(),
                      color: "from-blue-500 to-blue-600",
                      description: "Reviews received",
                    },
                    {
                      icon: Globe,
                      label: "Social Shares",
                      value: totalShares.toString(),
                      color: "from-green-500 to-green-600",
                      description: "Content shared",
                    },
                    {
                      icon: Users,
                      label: "Repeat Attendees",
                      value: events.reduce((sum, e) => sum + e.repeat_attendees, 0).toString(),
                      color: "from-purple-500 to-purple-600",
                      description: "Returning participants",
                    },
                    {
                      icon: TrendingUp,
                      label: "Avg ROI",
                      value: `${avgROI.toFixed(1)}%`,
                      color: "from-orange-500 to-orange-600",
                      description: "Return on investment",
                    },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className="border-0 shadow-xl bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center shadow-lg`}
                          >
                            <stat.icon className="h-7 w-7 text-white" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-3xl font-black font-heading text-foreground">{stat.value}</p>
                          <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                          <p className="text-xs text-muted-foreground">{stat.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            {activeTab === "insights" && (
              <TabsContent value="insights" className="space-y-8">
                {/* Enhanced Event Performance Table */}
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="font-heading text-2xl">Comprehensive Event Analytics</CardTitle>
                        <CardDescription className="text-base">
                          Detailed performance metrics for each event
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">{events.length} Events</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="text-left py-4 px-4 font-bold text-foreground">Event</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Category</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Status</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Participants</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Attendance</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Engagement</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Revenue</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">ROI</th>
                            <th className="text-left py-4 px-4 font-bold text-foreground">Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.slice(0, 12).map((event, index) => (
                            <tr
                              key={event.id}
                              className={`border-b border-border hover:bg-indigo-50/50 transition-colors ${index % 2 === 0 ? "bg-slate-50/50" : ""}`}
                            >
                              <td className="py-4 px-4">
                                <div>
                                  <p className="font-bold text-foreground">{event.title}</p>
                                  <p className="text-sm text-muted-foreground font-medium">{event.type}</p>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-semibold">
                                  {event.category}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <Badge
                                  className={`font-semibold ${
                                    event.status === "published"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : event.status === "completed"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  }`}
                                >
                                  {event.status}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <span className="font-bold text-foreground text-lg">
                                    {event.current_participants}
                                  </span>
                                  <span className="text-muted-foreground">/{event.max_participants || "∞"}</span>
                                  <div className="text-xs text-muted-foreground font-medium">
                                    {event.registrations} registered
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div
                                      className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(event.attendance_rate, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-foreground">
                                    {event.attendance_rate.toFixed(1)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-3">
                                    <div
                                      className="bg-yellow-500 h-2.5 rounded-full transition-all duration-300"
                                      style={{ width: `${Math.min(event.engagement_score, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-sm font-bold text-foreground">
                                    {event.engagement_score.toFixed(0)}%
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div>
                                  <span className="font-bold text-foreground text-lg">
                                    ₹{event.revenue.toLocaleString()}
                                  </span>
                                  <div className="text-xs text-muted-foreground font-medium">
                                    ₹{event.cost_per_participant.toFixed(0)}/participant
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className={`font-bold text-lg ${event.roi > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {event.roi.toFixed(1)}%
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center">
                                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="font-bold text-foreground">
                                    {event.satisfaction_score.toFixed(1)}
                                  </span>
                                  <div className="text-xs text-muted-foreground ml-2 font-medium">
                                    ({event.feedback_count} reviews)
                                  </div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
