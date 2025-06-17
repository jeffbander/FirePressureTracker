import { BPCategory } from '../types'

export const BP_CATEGORIES: Record<string, BPCategory> = {
  normal: {
    name: 'Normal',
    code: 'normal',
    color: '#10B981',
    priority: 1,
    isAbnormal: false,
  },
  elevated: {
    name: 'Elevated',
    code: 'elevated',
    color: '#F59E0B',
    priority: 2,
    isAbnormal: true,
  },
  stage1: {
    name: 'Stage 1 Hypertension',
    code: 'stage1',
    color: '#EF4444',
    priority: 3,
    isAbnormal: true,
  },
  stage2: {
    name: 'Stage 2 Hypertension',
    code: 'stage2',
    color: '#DC2626',
    priority: 4,
    isAbnormal: true,
  },
  crisis: {
    name: 'Hypertensive Crisis',
    code: 'crisis',
    color: '#7C2D12',
    priority: 5,
    isAbnormal: true,
  },
  low: {
    name: 'Low Blood Pressure',
    code: 'low',
    color: '#3B82F6',
    priority: 2,
    isAbnormal: true,
  },
}

export function categorizeBP(systolic: number, diastolic: number): BPCategory {
  if (systolic < 90 || diastolic < 60) {
    return BP_CATEGORIES.low
  }
  
  if (systolic >= 180 || diastolic >= 120) {
    return BP_CATEGORIES.crisis
  }
  
  if (systolic >= 140 || diastolic >= 90) {
    return BP_CATEGORIES.stage2
  }
  
  if (systolic >= 130 || diastolic >= 80) {
    return BP_CATEGORIES.stage1
  }
  
  if (systolic >= 120 && diastolic < 80) {
    return BP_CATEGORIES.elevated
  }
  
  return BP_CATEGORIES.normal
}

export function getBPDisplayText(category: BPCategory): string {
  return category.name
}

export function getBPColorClass(category: BPCategory): string {
  switch (category.code) {
    case 'normal':
      return 'bp-normal'
    case 'elevated':
      return 'bp-elevated'
    case 'stage1':
      return 'bp-stage1'
    case 'stage2':
      return 'bp-stage2'
    case 'crisis':
      return 'bp-crisis'
    case 'low':
      return 'bp-low'
    default:
      return 'bp-normal'
  }
}