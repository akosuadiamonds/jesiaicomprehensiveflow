// GES Curriculum strands and sub-strands by learning area
export interface StrandOption {
  strand: string;
  subStrands: string[];
}

export const curriculumStrands: Record<string, StrandOption[]> = {
  'English Language': [
    { strand: 'Oral Language', subStrands: ['Listening', 'Speaking', 'Listening Comprehension'] },
    { strand: 'Reading', subStrands: ['Word Families', 'Phonics', 'Fluency', 'Reading Comprehension', 'Vocabulary Development'] },
    { strand: 'Writing', subStrands: ['Handwriting', 'Spelling', 'Composition', 'Grammar'] },
    { strand: 'Grammar', subStrands: ['Parts of Speech', 'Sentence Structure', 'Punctuation'] },
  ],
  'Mathematics': [
    { strand: 'Number', subStrands: ['Counting', 'Number Operations', 'Fractions', 'Decimals', 'Percentages'] },
    { strand: 'Algebra', subStrands: ['Patterns', 'Equations', 'Expressions', 'Variables'] },
    { strand: 'Geometry', subStrands: ['Shapes', 'Symmetry', 'Angles', 'Measurement'] },
    { strand: 'Measurement', subStrands: ['Length', 'Mass', 'Capacity', 'Time', 'Money'] },
    { strand: 'Data Handling', subStrands: ['Data Collection', 'Graphs', 'Probability', 'Statistics'] },
  ],
  'Science': [
    { strand: 'Diversity of Matter', subStrands: ['Living Things', 'Non-Living Things', 'Materials'] },
    { strand: 'Cycles', subStrands: ['Life Cycles', 'Water Cycle', 'Rock Cycle'] },
    { strand: 'Systems', subStrands: ['Human Body', 'Ecosystems', 'Solar System'] },
    { strand: 'Forces and Energy', subStrands: ['Motion', 'Simple Machines', 'Heat', 'Light', 'Sound'] },
    { strand: 'Humans and the Environment', subStrands: ['Environmental Care', 'Pollution', 'Conservation'] },
  ],
  'Social Studies': [
    { strand: 'Environment', subStrands: ['Physical Environment', 'Climate', 'Natural Resources'] },
    { strand: 'Citizenship', subStrands: ['Rights and Responsibilities', 'Government', 'National Symbols'] },
    { strand: 'Our Nation Ghana', subStrands: ['History', 'Culture', 'Festivals', 'Traditional Rulers'] },
    { strand: 'Family Life', subStrands: ['Family Roles', 'Family Values', 'Socialization'] },
  ],
  'Creative Arts': [
    { strand: 'Visual Arts', subStrands: ['Drawing', 'Painting', 'Craft', 'Printmaking'] },
    { strand: 'Performing Arts', subStrands: ['Music', 'Dance', 'Drama'] },
    { strand: 'Literary Arts', subStrands: ['Poetry', 'Storytelling', 'Creative Writing'] },
  ],
  'Physical Education': [
    { strand: 'Movement Skills', subStrands: ['Locomotor', 'Non-Locomotor', 'Manipulative'] },
    { strand: 'Physical Fitness', subStrands: ['Strength', 'Flexibility', 'Endurance'] },
    { strand: 'Games and Sports', subStrands: ['Individual Sports', 'Team Sports', 'Traditional Games'] },
    { strand: 'Health and Safety', subStrands: ['Personal Hygiene', 'First Aid', 'Safety Rules'] },
  ],
  'ICT': [
    { strand: 'Introduction to Computing', subStrands: ['Computer Parts', 'Operating Systems', 'File Management'] },
    { strand: 'Word Processing', subStrands: ['Typing', 'Document Creation', 'Formatting'] },
    { strand: 'Internet and Safety', subStrands: ['Web Browsing', 'Online Safety', 'Email'] },
    { strand: 'Presentation', subStrands: ['Slides', 'Multimedia', 'Graphics'] },
  ],
  'French': [
    { strand: 'Oral Communication', subStrands: ['Listening', 'Speaking', 'Pronunciation'] },
    { strand: 'Reading', subStrands: ['Vocabulary', 'Comprehension', 'Phonics'] },
    { strand: 'Writing', subStrands: ['Handwriting', 'Spelling', 'Composition'] },
    { strand: 'Grammar', subStrands: ['Verb Conjugation', 'Sentence Structure', 'Articles'] },
  ],
  'Ghanaian Language': [
    { strand: 'Oral Language', subStrands: ['Listening', 'Speaking', 'Conversation'] },
    { strand: 'Reading', subStrands: ['Phonics', 'Comprehension', 'Vocabulary'] },
    { strand: 'Writing', subStrands: ['Handwriting', 'Spelling', 'Composition'] },
    { strand: 'Culture', subStrands: ['Proverbs', 'Folktales', 'Customs'] },
  ],
  'Religious & Moral Education': [
    { strand: 'God and His Creation', subStrands: ['Creation Stories', 'God\'s Attributes', 'Thanksgiving'] },
    { strand: 'Moral Life', subStrands: ['Honesty', 'Respect', 'Responsibility', 'Kindness'] },
    { strand: 'Religious Practices', subStrands: ['Prayer', 'Worship', 'Religious Festivals'] },
    { strand: 'Family and Community', subStrands: ['Family Values', 'Community Life', 'Service'] },
  ],
};

export const getStrandsForSubject = (subject: string): StrandOption[] => {
  return curriculumStrands[subject] || [];
};

export const getSubStrandsForStrand = (subject: string, strand: string): string[] => {
  const subjectStrands = curriculumStrands[subject] || [];
  const found = subjectStrands.find(s => s.strand === strand);
  return found?.subStrands || [];
};
