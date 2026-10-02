import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'

export function useReportSummary(params = {}) {
  return useQuery({
    queryKey: ['reports-summary', params],
    queryFn: () => reportService.getSummary(params),
  })
}

export function useCategoriesReport(params = {}) {
  return useQuery({
    queryKey: ['reports-categories', params],
    queryFn: () => reportService.getCategoriesReport(params),
  })
}

export function useMonthlyTrend(months = 6) {
  return useQuery({
    queryKey: ['reports-monthly-trend', months],
    queryFn: () => reportService.getMonthlyTrend(months),
  })
}
