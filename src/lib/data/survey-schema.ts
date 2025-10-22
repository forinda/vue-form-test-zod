import { z } from 'zod'

// Step schemas for validation
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Email must be valid'),
  age: z.number().min(18, 'Must be 18 or older').max(120, 'Invalid age'),
  gender: z.string().min(1, 'Please select your gender'),
  country: z.string().min(1, 'Please select your country'),
})

export const educationWorkSchema = z.object({
  education: z.string().min(1, 'Please select your education level'),
  jobTitle: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  experience: z.string().min(1, 'Please select your experience level'),
  industry: z.string().min(1, 'Please select your industry'),
  salary: z.number().min(0, 'Salary must be a positive number').nullable(),
})

export const skillsInterestsSchema = z.object({
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  programmingLanguages: z.array(z.string()).min(1, 'Select at least one programming language'),
  learningGoals: z.string().min(10, 'Please describe your learning goals (minimum 10 characters)'),
  hobbies: z.array(z.string()).min(1, 'Select at least one hobby'),
  favoriteTools: z.string().min(5, 'Please list your favorite tools'),
})

export const workLifeSchema = z.object({
  workSatisfaction: z.string().min(1, 'Please rate your work satisfaction'),
  workLifeBalance: z.string().min(1, 'Please rate your work-life balance'),
  remoteWorkFrequency: z.string().min(1, 'Please select your remote work frequency'),
  teamSize: z.number().min(1, 'Team size must be at least 1'),
  meetingFrequency: z.string().min(1, 'Please select meeting frequency'),
  overtimeFrequency: z.string().min(1, 'Please select overtime frequency'),
})

export const futureGoalsSchema = z.object({
  careerGoals: z.string().min(20, 'Please describe your career goals (minimum 20 characters)'),
  skillsToLearn: z.array(z.string()).min(1, 'Select at least one skill to learn'),
  dreamJob: z.string().min(10, 'Please describe your dream job'),
  fiveYearPlan: z.string().min(20, 'Please describe your 5-year plan'),
  mentorship: z.boolean(),
  openToOpportunities: z.boolean(),
  additionalComments: z.string().optional(),
})

// Complete survey schema
export const surveySchema = z.object({
  personalInfo: personalInfoSchema,
  educationWork: educationWorkSchema,
  skillsInterests: skillsInterestsSchema,
  workLife: workLifeSchema,
  futureGoals: futureGoalsSchema,
})

export type SurveyFormValues = z.infer<typeof surveySchema>

// Default values for the survey
export const defaultSurveyValues: SurveyFormValues = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    age: 25,
    gender: '',
    country: '',
  },
  educationWork: {
    education: '',
    jobTitle: '',
    company: '',
    experience: '',
    industry: '',
    salary: null,
  },
  skillsInterests: {
    skills: [],
    programmingLanguages: [],
    learningGoals: '',
    hobbies: [],
    favoriteTools: '',
  },
  workLife: {
    workSatisfaction: '',
    workLifeBalance: '',
    remoteWorkFrequency: '',
    teamSize: 5,
    meetingFrequency: '',
    overtimeFrequency: '',
  },
  futureGoals: {
    careerGoals: '',
    skillsToLearn: [],
    dreamJob: '',
    fiveYearPlan: '',
    mentorship: false,
    openToOpportunities: false,
    additionalComments: '',
  },
}