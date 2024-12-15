export type ExamSection = 
  | 'cervix'
  | 'menopause'
  | 'pregnancy'
  | 'contraceptive'
  | 'hpv'
  | 'treatments';

export type ExamType = 'PAP' | 'COLPOSCOPIA' | 'BIOPSIA';

export interface ExamConfig {
  sections: ExamSection[];
  requiredFields: string[];
  sampleTypes?: {
    endocervical?: boolean;
    exocervical?: boolean;
    vaginal?: boolean;
  };
}

export const examConfigs: Record<ExamType, ExamConfig> = {
  PAP: {
    sections: ['cervix', 'menopause', 'pregnancy', 'contraceptive', 'hpv', 'treatments'],
    requiredFields: ['cervixAppearance', 'menopauseStatus'],
    sampleTypes: {
      endocervical: true,
      exocervical: true,
      vaginal: true
    }
  },
  COLPOSCOPIA: {
    sections: ['cervix', 'hpv', 'treatments'],
    requiredFields: ['cervixAppearance'],
    sampleTypes: {
      endocervical: false,
      exocervical: true,
      vaginal: false
    }
  },
  BIOPSIA: {
    sections: ['cervix', 'treatments'],
    requiredFields: ['cervixAppearance'],
    sampleTypes: {
      endocervical: true,
      exocervical: true,
      vaginal: false
    }
  }
};
