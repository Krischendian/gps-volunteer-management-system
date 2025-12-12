
export enum UserRole {
  VOLUNTEER = 'VOLUNTEER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'ADMIN' | 'VOLUNTEER';
  orientationSigned: boolean;
  orientationDate?: string;
  
  // Extended Profile Fields from Registration
  phone?: string;
  age?: string;
  gender?: string;
  statusInCanada?: string;
  address?: string;
  languages?: string;
  identity?: string;
  occupation?: string;
  schoolOrg?: string;
  referralSource?: string;
  skills?: string;
  medicalConditions?: string;
  experience?: string;
  availability?: string;
}

export interface WorkSession {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  description: string;
  eventName: string; // Used for Program Name
  supervisorName: string; // Added field
}

export interface Activity {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  image: string;
  capacity: number;
  registeredCount: number;
  isRegistered?: boolean; // Helper for UI
}

export interface Policy {
  id: string;
  title: string;
  content: string; // HTML-like string or plain text
  items?: string[]; // For bullet points
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const APP_POLICIES: Policy[] = [
  {
    id: 'media_consent',
    title: 'Photographic / Media Consent',
    content: 'I hereby grant Gifted People Services the following permissions:',
    items: [
      'Consent to the use of photographs or video footage for use on the Gifted People Services banners, website, in newsletters and publications as well as for distribution to members.',
      'Consent to the use of photographs or video footage being used to promote future events by the Gifted People Services Committee and other media.',
      'I understand that no personal information, such as names, will be used in any publications unless express consent is given.',
      'I further understand that this consent may be withdrawn by me at anytime, upon written notice.',
      'I give this consent voluntarily.'
    ]
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality Agreement',
    content: 'I agree to adhere to the policies and procedures of Gifted People Services, particularly the policy dealing with confidentiality:',
    items: [
      'All information acquired regarding clients in the course of work activities at Gifted People Services shall be treated as confidential. In the course of my duties as a board member/staff/contractor/volunteer/student, I will have access to confidential information regarding Gifted People Services’ clients and I will, under no circumstances, discuss a client, or any information about a client, outside Gifted Peoples Services. I can share appropriate information regarding a client’s plans with professionals, agencies or government resources with whom I work on client’s behalf only when written consent has been obtained from that client.',
      'Within Gifted People Services, I will exercise discretion and professional judgment when required to engage in peer consultation, case reviews or other professional discussions about a client with other Gifted Peoples Services staff members.',
      'I shall not, without the prior written authorization of the Company, disclose in any manner whatsoever any confidential information of the Company, other than to those external /internal bodies, in order to fulfill the responsibilities assigned to me. Such confidential information shall include but not be limited to information regarding participants or participants’ proprietary information, trade secrets, marketing strategy, intellectual property, competitor reports, sales numbers, fiscal budgets, customer list, wage or compensation information, and all company agreements and contracts.',
      'All records, reports, documents and the material related to my work at Gifted People Services and /or obtained or prepared by me in connection with the performance of the services provided to Gifted People Services will become the property of Gifted People Services and shall be destroyed or returned to the company at termination or expiration of my work relation with Gifted People Services.',
      'I understand that failure to maintain confidentiality is a serious breach of ethics and of my contact with Gifted People Services.'
    ]
  },
  {
    id: 'code_of_conduct',
    title: 'Volunteer Code of Conduct',
    content: 'As a volunteer, I agree to abide by the following Code of Conduct:',
    items: [
      'I will treat all individuals with respect, dignity, and fairness.',
      'I will act in a professional manner and represent Gifted People Services positively.',
      'I will follow the instructions of my supervisor and ask for clarification when needed.',
      'I will be punctual and reliable, and notify my supervisor if I am unable to attend a scheduled shift.',
      'I will avoid conflicts of interest and not accept gifts or favors from clients.',
      'I will maintain a safe and inclusive environment for everyone.',
      'I will report any incidents, accidents, or concerns immediately to my supervisor.'
    ]
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'According to the Confidentiality Agreement, when can you discuss a client with people outside Gifted People Services?',
    options: [
      'Anytime, as long as you don\'t use their real name.',
      'Only when written consent has been obtained from that client for professional purposes.',
      'Whenever you need advice from a friend.',
      'If the client is a minor.'
    ],
    correctAnswer: 1
  },
  {
    id: 'q2',
    question: 'What happens to records and materials you prepare during your work at GPS upon termination?',
    options: [
      'You can keep them as part of your portfolio.',
      'You must destroy them or return them to the company.',
      'You share them with other organizations.',
      'They become public property.'
    ],
    correctAnswer: 1
  },
  {
    id: 'q3',
    question: 'Regarding media consent, what rights do you grant to Gifted People Services?',
    options: [
      'None, photos are never allowed.',
      'To use photographs/video for newsletters, website, and promotion.',
      'Only for internal office use.',
      'To sell your photos to stock agencies.'
    ],
    correctAnswer: 1
  },
  {
      id: 'q4',
      question: 'Which of the following is NOT part of the Volunteer Code of Conduct?',
      options: [
          'Treating everyone with respect and dignity.',
          'Being punctual and reliable.',
          'Accepting gifts from clients as appreciation.',
          'Maintaining a safe environment.'
      ],
      correctAnswer: 2
  }
];
