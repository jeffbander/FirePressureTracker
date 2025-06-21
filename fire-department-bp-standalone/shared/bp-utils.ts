export interface BPCategory {
  name: string;
  code: string;
  color: string;
  priority: number;
  isAbnormal: boolean;
}

export const BP_CATEGORIES: Record<string, BPCategory> = {
  normal: {
    name: "Normal",
    code: "normal",
    color: "green",
    priority: 1,
    isAbnormal: false,
  },
  elevated: {
    name: "Elevated",
    code: "elevated", 
    color: "yellow",
    priority: 2,
    isAbnormal: true,
  },
  stage1: {
    name: "High Blood Pressure Stage 1",
    code: "stage1",
    color: "orange", 
    priority: 3,
    isAbnormal: true,
  },
  stage2: {
    name: "High Blood Pressure Stage 2",
    code: "stage2",
    color: "red",
    priority: 4,
    isAbnormal: true,
  },
  crisis: {
    name: "Hypertensive Crisis",
    code: "crisis",
    color: "purple",
    priority: 5,
    isAbnormal: true,
  },
  customAlert: {
    name: "Custom Alert Threshold",
    code: "customAlert",
    color: "blue",
    priority: 6,
    isAbnormal: true,
  },
};

export function categorizeBP(
  systolic: number, 
  diastolic: number, 
  customSystolicThreshold?: number, 
  customDiastolicThreshold?: number
): BPCategory {
  // Check custom threshold first if provided
  if (customSystolicThreshold && customDiastolicThreshold) {
    if (systolic >= customSystolicThreshold || diastolic >= customDiastolicThreshold) {
      return BP_CATEGORIES.customAlert;
    }
  }

  // AHA Guidelines categorization
  // HYPERTENSIVE CRISIS: > 180 systolic and/or > 120 diastolic
  if (systolic > 180 || diastolic > 120) {
    return BP_CATEGORIES.crisis;
  }

  // STAGE 2 HYPERTENSION: ≥ 140 systolic or ≥ 90 diastolic
  if (systolic >= 140 || diastolic >= 90) {
    return BP_CATEGORIES.stage2;
  }

  // STAGE 1 HYPERTENSION: 130-139 systolic or 80-89 diastolic
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return BP_CATEGORIES.stage1;
  }

  // ELEVATED: 120-129 systolic and < 80 diastolic
  if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return BP_CATEGORIES.elevated;
  }

  // NORMAL: < 120 systolic and < 80 diastolic
  return BP_CATEGORIES.normal;
}

export function getBPDisplayText(category: BPCategory): string {
  switch (category.code) {
    case 'normal':
      return 'Normal';
    case 'elevated':
      return 'Elevated';
    case 'stage1':
      return 'Stage 1 Hypertension';
    case 'stage2':
      return 'Stage 2 Hypertension';
    case 'crisis':
      return 'Hypertensive Crisis';
    case 'customAlert':
      return 'Custom Alert';
    default:
      return 'Unknown';
  }
}

export function getBPColorClass(category: BPCategory): string {
  switch (category.color) {
    case 'green':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'yellow':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'orange':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'red':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'purple':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'blue':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}