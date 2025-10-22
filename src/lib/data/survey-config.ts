export const TOTAL_STEPS = 5

export const stepInfo = [
  { title: 'Personal Information', description: 'Tell us about yourself' },
  { title: 'Education & Work', description: 'Your professional background' },
  { title: 'Skills & Interests', description: 'What drives your passion' },
  { title: 'Work & Life Balance', description: 'Your current work experience' },
  { title: 'Future Goals', description: 'Where do you see yourself going' },
]

export const getFieldsForStep = (step: number): string[] => {
  switch (step) {
    case 1:
      return [
        'personalInfo.firstName',
        'personalInfo.lastName',
        'personalInfo.email',
        'personalInfo.age',
        'personalInfo.gender',
        'personalInfo.country',
      ]
    case 2:
      return [
        'educationWork.education',
        'educationWork.jobTitle',
        'educationWork.company',
        'educationWork.experience',
        'educationWork.industry',
        'educationWork.salary',
      ]
    case 3:
      return [
        'skillsInterests.skills',
        'skillsInterests.programmingLanguages',
        'skillsInterests.learningGoals',
        'skillsInterests.hobbies',
        'skillsInterests.favoriteTools',
      ]
    case 4:
      return [
        'workLife.workSatisfaction',
        'workLife.workLifeBalance',
        'workLife.remoteWorkFrequency',
        'workLife.teamSize',
        'workLife.meetingFrequency',
        'workLife.overtimeFrequency',
      ]
    case 5:
      return [
        'futureGoals.careerGoals',
        'futureGoals.skillsToLearn',
        'futureGoals.dreamJob',
        'futureGoals.fiveYearPlan',
      ]
    default:
      return []
  }
}