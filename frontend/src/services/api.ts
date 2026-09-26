import axios, { AxiosError } from 'axios'
import type {
  TripGenerateRequest,
  TripGenerateResponse,
  TripRefineRequest,
  TripData,
  ParseReelRequest,
  ParseReelResponse,
} from '../types/trip'
import { MOCK_TRIP } from './mockData'

// Set VITE_USE_MOCK=true in .env.local to skip backend calls during development
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120_000,
})

function mockDelay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function generateTrip(
  request: TripGenerateRequest,
): Promise<TripGenerateResponse> {
  if (USE_MOCK) {
    await mockDelay(5500) // simulate LLM latency
    return { success: true, trip: MOCK_TRIP, trip_id: 'mock-001' }
  }

  try {
    const { data } = await api.post<TripGenerateResponse>('/trips/generate', request)
    return data
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail?: string }>
    const detail = axiosErr.response?.data?.detail
    const status = axiosErr.response?.status
    if (status === 503) {
      return {
        success: false,
        error: detail ?? 'Backend not configured. Set VITE_USE_MOCK=true in frontend/.env.local to use demo mode.',
      }
    }
    if (status === 422) {
      return {
        success: false,
        error: detail ?? 'Atlas could not process this request. Please try a different input.',
      }
    }
    if (status === 500) {
      return {
        success: false,
        error: detail ?? "Atlas couldn't generate your trip right now. Please try again.",
      }
    }
    throw err
  }
}

export async function refineTrip(
  currentTrip: TripData,
  instruction: string,
  preferences?: TripGenerateRequest,
): Promise<TripGenerateResponse> {
  if (USE_MOCK) {
    await mockDelay(3500)
    return {
      success: true,
      trip: {
        ...currentTrip,
        summary: `${currentTrip.summary} (Updated: ${instruction})`,
        why_this_trip: `Refined based on: "${instruction}"`,
      },
    }
  }

  const payload: TripRefineRequest = {
    current_trip: currentTrip,
    instruction,
    ...(preferences && { preferences }),
  }
  const { data } = await api.post<TripGenerateResponse>('/trips/refine', payload)
  return data
}

export async function getTrip(tripId: string): Promise<TripGenerateResponse> {
  if (USE_MOCK) {
    return { success: true, trip: MOCK_TRIP, trip_id: tripId }
  }
  const { data } = await api.get<TripGenerateResponse>(`/trips/${tripId}`)
  return data
}

export async function parseInstagramReel(
  request: ParseReelRequest,
): Promise<ParseReelResponse> {
  if (USE_MOCK) {
    await mockDelay(1200)
    return {
      success: true,
      destination: 'Bali, Indonesia',
      suggested_duration: 5,
      must_visit_stops: ['Cretya Sunset Club', 'Tegalalang Rice Terraces', 'Uluwatu Cliff Temple'],
      suggested_styles: ['relaxed', 'culture'],
      trip_summary: '5-day scenic Bali journey featuring tropical rice terraces, cliffside ocean temples, and sunset beach vibes.',
      reel_url: request.url,
    }
  }

  try {
    const { data } = await api.post<ParseReelResponse>('/trips/parse-reel', request)
    return data
  } catch (err) {
    const axiosErr = err as AxiosError<{ detail?: string }>
    const detail = axiosErr.response?.data?.detail
    return {
      success: false,
      destination: 'Unknown',
      suggested_duration: 5,
      must_visit_stops: [],
      suggested_styles: ['relaxed', 'culture'],
      trip_summary: '',
      error: detail ?? 'Failed to analyze reel. Please enter your destination manually.',
    }
  }
}

export default api
