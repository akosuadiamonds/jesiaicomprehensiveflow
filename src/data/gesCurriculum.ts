// GES Curriculum Data with strands, sub-strands, YouTube videos, and external links

export interface SubStrandData {
  name: string;
  videos: { title: string; url: string }[];
  externalLinks: { title: string; url: string }[];
}

export interface StrandData {
  name: string;
  subStrands: SubStrandData[];
}

export interface SubjectData {
  name: string;
  emoji: string;
  color: string;
  strands: StrandData[];
}

// Term detection based on Ghana school calendar
export const getCurrentTerm = (): { term: number; label: string } => {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 9 && month <= 12) return { term: 1, label: 'First Term' };
  if (month >= 1 && month <= 3) return { term: 2, label: 'Second Term' };
  return { term: 3, label: 'Third Term' };
};

// JHS Subjects with full GES curriculum strands
export const jhsSubjects: SubjectData[] = [
  {
    name: 'Mathematics',
    emoji: '🔢',
    color: 'from-blue-500 to-indigo-600',
    strands: [
      {
        name: 'Number',
        subStrands: [
          { name: 'Counting and Numeration', videos: [{ title: 'Counting & Place Value', url: 'https://www.youtube.com/watch?v=GvhGxNoz8gA' }, { title: 'Number Systems', url: 'https://www.youtube.com/watch?v=cZH0YnFpjwU' }], externalLinks: [{ title: 'Khan Academy - Numbers', url: 'https://www.khanacademy.org/math/arithmetic' }] },
          { name: 'Number Operations', videos: [{ title: 'Basic Operations', url: 'https://www.youtube.com/watch?v=AuX7nPBqDts' }], externalLinks: [{ title: 'Math is Fun - Operations', url: 'https://www.mathsisfun.com/operation-order-pemdas.html' }] },
          { name: 'Fractions, Decimals & Percentages', videos: [{ title: 'Understanding Fractions', url: 'https://www.youtube.com/watch?v=n0FZhQ_GkKw' }, { title: 'Decimals Explained', url: 'https://www.youtube.com/watch?v=do_IbHId2Os' }], externalLinks: [{ title: 'Khan Academy - Fractions', url: 'https://www.khanacademy.org/math/arithmetic/fraction-arithmetic' }] },
          { name: 'Ratio and Proportion', videos: [{ title: 'Ratios for Beginners', url: 'https://www.youtube.com/watch?v=bh7QEbJlBT0' }], externalLinks: [{ title: 'Math Planet - Ratio', url: 'https://www.mathplanet.com/education/pre-algebra/ratios-and-percent/ratios-and-proportions' }] },
        ],
      },
      {
        name: 'Algebra',
        subStrands: [
          { name: 'Patterns and Relations', videos: [{ title: 'Number Patterns', url: 'https://www.youtube.com/watch?v=lD8Dbyxqvtk' }], externalLinks: [{ title: 'Math is Fun - Patterns', url: 'https://www.mathsisfun.com/algebra/sequences-finding-rule.html' }] },
          { name: 'Algebraic Expressions', videos: [{ title: 'Intro to Algebra', url: 'https://www.youtube.com/watch?v=NybHckSEQBI' }], externalLinks: [{ title: 'Khan Academy - Algebra', url: 'https://www.khanacademy.org/math/algebra-basics' }] },
          { name: 'Equations and Inequalities', videos: [{ title: 'Solving Equations', url: 'https://www.youtube.com/watch?v=l3XzepN03KQ' }], externalLinks: [{ title: 'Math is Fun - Equations', url: 'https://www.mathsisfun.com/algebra/equations-solving.html' }] },
        ],
      },
      {
        name: 'Geometry and Measurement',
        subStrands: [
          { name: 'Shapes and Space', videos: [{ title: 'Types of Shapes', url: 'https://www.youtube.com/watch?v=WlGdp3yMYOo' }], externalLinks: [{ title: 'Math is Fun - Geometry', url: 'https://www.mathsisfun.com/geometry/' }] },
          { name: 'Measurement', videos: [{ title: 'Measuring Length, Area, Volume', url: 'https://www.youtube.com/watch?v=I76l8cMOGeg' }], externalLinks: [{ title: 'Khan Academy - Measurement', url: 'https://www.khanacademy.org/math/basic-geo' }] },
          { name: 'Position and Transformation', videos: [{ title: 'Transformations', url: 'https://www.youtube.com/watch?v=XiAoUDfrar0' }], externalLinks: [{ title: 'Math is Fun - Transformations', url: 'https://www.mathsisfun.com/geometry/transformations.html' }] },
        ],
      },
      {
        name: 'Data Handling',
        subStrands: [
          { name: 'Data Collection and Organisation', videos: [{ title: 'Collecting Data', url: 'https://www.youtube.com/watch?v=VHhFR7aIWAk' }], externalLinks: [{ title: 'Khan Academy - Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' }] },
          { name: 'Probability', videos: [{ title: 'Intro to Probability', url: 'https://www.youtube.com/watch?v=KzfWUEJjG18' }], externalLinks: [{ title: 'Math is Fun - Probability', url: 'https://www.mathsisfun.com/data/probability.html' }] },
        ],
      },
    ],
  },
  {
    name: 'English Language',
    emoji: '📖',
    color: 'from-green-500 to-emerald-600',
    strands: [
      {
        name: 'Oral Language',
        subStrands: [
          { name: 'Listening Comprehension', videos: [{ title: 'Listening Skills', url: 'https://www.youtube.com/watch?v=rzsVh8YwZEQ' }], externalLinks: [{ title: 'British Council - Listening', url: 'https://learnenglish.britishcouncil.org/skills/listening' }] },
          { name: 'Speaking and Presentation', videos: [{ title: 'Public Speaking Tips', url: 'https://www.youtube.com/watch?v=i5mYphU1ZPE' }], externalLinks: [{ title: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish' }] },
        ],
      },
      {
        name: 'Reading',
        subStrands: [
          { name: 'Phonics and Word Recognition', videos: [{ title: 'Phonics Basics', url: 'https://www.youtube.com/watch?v=hq3yfQnllfQ' }], externalLinks: [{ title: 'Starfall - Reading', url: 'https://www.starfall.com/h/ltr-classic/' }] },
          { name: 'Reading Comprehension', videos: [{ title: 'Reading Comprehension Strategies', url: 'https://www.youtube.com/watch?v=WOV1T0FuWMg' }], externalLinks: [{ title: 'ReadTheory', url: 'https://readtheory.org' }] },
          { name: 'Vocabulary Development', videos: [{ title: 'Building Vocabulary', url: 'https://www.youtube.com/watch?v=k-DK1ISJyJ0' }], externalLinks: [{ title: 'Vocabulary.com', url: 'https://www.vocabulary.com' }] },
        ],
      },
      {
        name: 'Writing',
        subStrands: [
          { name: 'Composition and Essay Writing', videos: [{ title: 'Essay Writing Tips', url: 'https://www.youtube.com/watch?v=dBBYdq7ViNw' }], externalLinks: [{ title: 'Grammarly Blog', url: 'https://www.grammarly.com/blog/essay-writing/' }] },
          { name: 'Creative Writing', videos: [{ title: 'Creative Writing for Kids', url: 'https://www.youtube.com/watch?v=wRFNjdBzKaU' }], externalLinks: [{ title: 'Storybird', url: 'https://storybird.com' }] },
        ],
      },
      {
        name: 'Grammar',
        subStrands: [
          { name: 'Parts of Speech', videos: [{ title: 'Parts of Speech', url: 'https://www.youtube.com/watch?v=SceDmiBEDGE' }], externalLinks: [{ title: 'Grammar Monster', url: 'https://www.grammar-monster.com' }] },
          { name: 'Sentence Structure', videos: [{ title: 'Sentence Types', url: 'https://www.youtube.com/watch?v=mEztbjN6MlU' }], externalLinks: [{ title: 'English Grammar 101', url: 'https://www.englishgrammar101.com' }] },
          { name: 'Punctuation', videos: [{ title: 'Punctuation Rules', url: 'https://www.youtube.com/watch?v=JVDJuDvPhpA' }], externalLinks: [{ title: 'Purdue OWL', url: 'https://owl.purdue.edu/owl/general_writing/punctuation/index.html' }] },
        ],
      },
    ],
  },
  {
    name: 'Science',
    emoji: '🔬',
    color: 'from-purple-500 to-violet-600',
    strands: [
      {
        name: 'Diversity of Matter',
        subStrands: [
          { name: 'Living Things', videos: [{ title: 'Classification of Living Things', url: 'https://www.youtube.com/watch?v=dQCsA2cCdvA' }], externalLinks: [{ title: 'BBC Bitesize - Biology', url: 'https://www.bbc.co.uk/bitesize/subjects/z2pfb9q' }] },
          { name: 'Non-Living Things and Materials', videos: [{ title: 'Properties of Materials', url: 'https://www.youtube.com/watch?v=SMYB5hRIjJg' }], externalLinks: [{ title: 'DK Find Out - Materials', url: 'https://www.dkfindout.com/uk/science/materials/' }] },
        ],
      },
      {
        name: 'Cycles',
        subStrands: [
          { name: 'Life Cycles', videos: [{ title: 'Life Cycles of Animals', url: 'https://www.youtube.com/watch?v=Q7M0JMjYDhk' }], externalLinks: [{ title: 'National Geographic Kids', url: 'https://kids.nationalgeographic.com' }] },
          { name: 'Water Cycle', videos: [{ title: 'The Water Cycle', url: 'https://www.youtube.com/watch?v=al-do-HGuIk' }, { title: 'Water Cycle Song', url: 'https://www.youtube.com/watch?v=ncORPosDrjI' }], externalLinks: [{ title: 'USGS Water Cycle', url: 'https://www.usgs.gov/special-topics/water-science-school/science/water-cycle' }] },
        ],
      },
      {
        name: 'Systems',
        subStrands: [
          { name: 'The Human Body', videos: [{ title: 'Human Body Systems', url: 'https://www.youtube.com/watch?v=gEUu-A2wfSE' }], externalLinks: [{ title: 'InnerBody', url: 'https://www.innerbody.com' }] },
          { name: 'Ecosystems', videos: [{ title: 'What is an Ecosystem?', url: 'https://www.youtube.com/watch?v=Hf68hBNsOVw' }], externalLinks: [{ title: 'Khan Academy - Ecology', url: 'https://www.khanacademy.org/science/biology/ecology' }] },
          { name: 'Solar System', videos: [{ title: 'Our Solar System', url: 'https://www.youtube.com/watch?v=libKVRa01L8' }], externalLinks: [{ title: 'NASA Solar System', url: 'https://solarsystem.nasa.gov' }] },
        ],
      },
      {
        name: 'Forces and Energy',
        subStrands: [
          { name: 'Motion and Forces', videos: [{ title: 'Forces and Motion', url: 'https://www.youtube.com/watch?v=k4rkGPGixBM' }], externalLinks: [{ title: 'Physics Classroom', url: 'https://www.physicsclassroom.com' }] },
          { name: 'Energy Transformations', videos: [{ title: 'Types of Energy', url: 'https://www.youtube.com/watch?v=MVIF02n4MnM' }], externalLinks: [{ title: 'Energy Kids', url: 'https://www.eia.gov/kids/' }] },
          { name: 'Light and Sound', videos: [{ title: 'Light and Sound', url: 'https://www.youtube.com/watch?v=NKSQ6kBIoIk' }], externalLinks: [{ title: 'BBC Bitesize - Light', url: 'https://www.bbc.co.uk/bitesize/topics/zbssgk7' }] },
        ],
      },
      {
        name: 'Humans and the Environment',
        subStrands: [
          { name: 'Environmental Conservation', videos: [{ title: 'Protecting Our Environment', url: 'https://www.youtube.com/watch?v=X2YgM1Fy5IA' }], externalLinks: [{ title: 'WWF - For Kids', url: 'https://www.worldwildlife.org/teaching-resources' }] },
          { name: 'Pollution and Waste', videos: [{ title: 'Types of Pollution', url: 'https://www.youtube.com/watch?v=OasbYWF4_S8' }], externalLinks: [{ title: 'EPA Students', url: 'https://www.epa.gov/students' }] },
        ],
      },
    ],
  },
  {
    name: 'Social Studies',
    emoji: '🌍',
    color: 'from-amber-500 to-orange-600',
    strands: [
      {
        name: 'Environment',
        subStrands: [
          { name: 'Physical Environment of Ghana', videos: [{ title: 'Geography of Ghana', url: 'https://www.youtube.com/watch?v=9_Z7r5VBkiA' }], externalLinks: [{ title: 'World Atlas - Ghana', url: 'https://www.worldatlas.com/maps/ghana' }] },
          { name: 'Climate and Vegetation', videos: [{ title: 'Climate Zones', url: 'https://www.youtube.com/watch?v=G-Bg2kqGP3w' }], externalLinks: [{ title: 'National Geographic - Climate', url: 'https://education.nationalgeographic.org/resource/climate/' }] },
        ],
      },
      {
        name: 'Governance and Citizenship',
        subStrands: [
          { name: 'Government and Democracy', videos: [{ title: 'Ghana Government System', url: 'https://www.youtube.com/watch?v=EQmCQjCvNtI' }], externalLinks: [{ title: 'Ghana Government Portal', url: 'https://www.ghana.gov.gh' }] },
          { name: 'Rights and Responsibilities', videos: [{ title: 'Rights of a Citizen', url: 'https://www.youtube.com/watch?v=oh3BbLk5UIQ' }], externalLinks: [{ title: 'UN Rights of the Child', url: 'https://www.unicef.org/child-rights-convention' }] },
        ],
      },
      {
        name: 'Our Nation Ghana',
        subStrands: [
          { name: 'History of Ghana', videos: [{ title: 'History of Ghana', url: 'https://www.youtube.com/watch?v=1YVQ-z9R8LU' }], externalLinks: [{ title: 'Ghana Web History', url: 'https://www.ghanaweb.com/GhanaHomePage/history/' }] },
          { name: 'Culture and Festivals', videos: [{ title: 'Ghanaian Festivals', url: 'https://www.youtube.com/watch?v=k5QLjDXqTLk' }], externalLinks: [{ title: 'Ghana Tourism - Festivals', url: 'https://visitghana.com/festivals/' }] },
        ],
      },
      {
        name: 'Social and Economic Development',
        subStrands: [
          { name: 'Economic Activities', videos: [{ title: 'Economic Activities in Ghana', url: 'https://www.youtube.com/watch?v=I_FEQ1nEHHI' }], externalLinks: [{ title: 'World Bank - Ghana', url: 'https://www.worldbank.org/en/country/ghana' }] },
          { name: 'Trade and Industry', videos: [{ title: 'Trade in West Africa', url: 'https://www.youtube.com/watch?v=BqfCnSOsQQU' }], externalLinks: [{ title: 'Ghana Trade Info', url: 'https://www.trade.gov/ghana' }] },
        ],
      },
    ],
  },
  {
    name: 'ICT',
    emoji: '💻',
    color: 'from-cyan-500 to-teal-600',
    strands: [
      {
        name: 'Introduction to Computing',
        subStrands: [
          { name: 'Computer Hardware and Software', videos: [{ title: 'Computer Basics', url: 'https://www.youtube.com/watch?v=Cu3R5it4cQs' }, { title: 'Hardware vs Software', url: 'https://www.youtube.com/watch?v=vG_qmtdBPTU' }], externalLinks: [{ title: 'GCFGlobal - Computer Basics', url: 'https://edu.gcfglobal.org/en/computerbasics/' }] },
          { name: 'Operating Systems', videos: [{ title: 'What is an OS?', url: 'https://www.youtube.com/watch?v=26QPDBe-NB8' }], externalLinks: [{ title: 'Computer Hope - OS', url: 'https://www.computerhope.com/os.htm' }] },
        ],
      },
      {
        name: 'Productivity Tools',
        subStrands: [
          { name: 'Word Processing', videos: [{ title: 'Microsoft Word Tutorial', url: 'https://www.youtube.com/watch?v=S-nHYzK-BVg' }], externalLinks: [{ title: 'Google Docs Help', url: 'https://support.google.com/docs' }] },
          { name: 'Spreadsheets', videos: [{ title: 'Excel Basics', url: 'https://www.youtube.com/watch?v=rwbho0CgEAE' }], externalLinks: [{ title: 'Google Sheets Guide', url: 'https://support.google.com/a/users/answer/9282959' }] },
          { name: 'Presentations', videos: [{ title: 'PowerPoint Tips', url: 'https://www.youtube.com/watch?v=w3KmMtKx2M4' }], externalLinks: [{ title: 'Google Slides Help', url: 'https://support.google.com/docs/topic/9052835' }] },
        ],
      },
      {
        name: 'Internet and Digital Literacy',
        subStrands: [
          { name: 'Web Browsing and Research', videos: [{ title: 'Internet Safety', url: 'https://www.youtube.com/watch?v=HxySrSbSY7o' }], externalLinks: [{ title: 'Be Internet Awesome', url: 'https://beinternetawesome.withgoogle.com' }] },
          { name: 'Online Safety and Ethics', videos: [{ title: 'Cyber Safety for Students', url: 'https://www.youtube.com/watch?v=yiKeLOKc1tw' }], externalLinks: [{ title: 'Common Sense Media', url: 'https://www.commonsensemedia.org' }] },
        ],
      },
      {
        name: 'Programming Basics',
        subStrands: [
          { name: 'Introduction to Coding', videos: [{ title: 'What is Coding?', url: 'https://www.youtube.com/watch?v=N7ZmPYaXoic' }, { title: 'Scratch Tutorial', url: 'https://www.youtube.com/watch?v=VIpmkeqJhmQ' }], externalLinks: [{ title: 'Scratch', url: 'https://scratch.mit.edu' }, { title: 'Code.org', url: 'https://code.org' }] },
        ],
      },
    ],
  },
  {
    name: 'Creative Arts',
    emoji: '🎨',
    color: 'from-pink-500 to-rose-600',
    strands: [
      {
        name: 'Visual Arts',
        subStrands: [
          { name: 'Drawing and Painting', videos: [{ title: 'Drawing Basics', url: 'https://www.youtube.com/watch?v=ewMksAbgZBo' }], externalLinks: [{ title: 'Art for Kids Hub', url: 'https://www.artforkidshub.com' }] },
          { name: 'Craft and Design', videos: [{ title: 'Easy Craft Ideas', url: 'https://www.youtube.com/watch?v=W1CYAZHbPBk' }], externalLinks: [{ title: 'Craftsy', url: 'https://www.craftsy.com' }] },
        ],
      },
      {
        name: 'Performing Arts',
        subStrands: [
          { name: 'Music', videos: [{ title: 'Music Theory Basics', url: 'https://www.youtube.com/watch?v=rgaTLrZGlk0' }], externalLinks: [{ title: 'Music Theory.net', url: 'https://www.musictheory.net' }] },
          { name: 'Dance and Drama', videos: [{ title: 'Traditional Ghanaian Dance', url: 'https://www.youtube.com/watch?v=FHqzrR4gKKE' }], externalLinks: [{ title: 'Ghana Dance Ensemble', url: 'https://en.wikipedia.org/wiki/Ghana_Dance_Ensemble' }] },
        ],
      },
      {
        name: 'Literary Arts',
        subStrands: [
          { name: 'Poetry and Storytelling', videos: [{ title: 'How to Write Poetry', url: 'https://www.youtube.com/watch?v=JwhouCNq-Fc' }], externalLinks: [{ title: 'Poetry Foundation', url: 'https://www.poetryfoundation.org' }] },
        ],
      },
    ],
  },
  {
    name: 'French',
    emoji: '🇫🇷',
    color: 'from-red-500 to-rose-600',
    strands: [
      {
        name: 'Oral Communication',
        subStrands: [
          { name: 'Greetings and Introductions', videos: [{ title: 'French Greetings', url: 'https://www.youtube.com/watch?v=ShOoXBqvgmM' }], externalLinks: [{ title: 'Duolingo French', url: 'https://www.duolingo.com/course/fr/en/Learn-French' }] },
          { name: 'Pronunciation', videos: [{ title: 'French Pronunciation', url: 'https://www.youtube.com/watch?v=2RIhcDOrRNk' }], externalLinks: [{ title: 'Forvo French', url: 'https://forvo.com/languages/fr/' }] },
        ],
      },
      {
        name: 'Reading and Writing',
        subStrands: [
          { name: 'Vocabulary Building', videos: [{ title: 'French Vocabulary', url: 'https://www.youtube.com/watch?v=FD0tOuJ77PM' }], externalLinks: [{ title: 'French Together', url: 'https://frenchtogether.com' }] },
          { name: 'Comprehension', videos: [{ title: 'French Reading Practice', url: 'https://www.youtube.com/watch?v=RmpAaU9IMPA' }], externalLinks: [{ title: 'Lingoda', url: 'https://www.lingoda.com/en/french' }] },
        ],
      },
      {
        name: 'Grammar',
        subStrands: [
          { name: 'Verb Conjugation', videos: [{ title: 'French Verbs', url: 'https://www.youtube.com/watch?v=m0KCmRqjldo' }], externalLinks: [{ title: 'Conjugation-fr', url: 'https://www.conjugation-fr.com' }] },
          { name: 'Sentence Construction', videos: [{ title: 'French Sentence Structure', url: 'https://www.youtube.com/watch?v=uK2LnahFkHs' }], externalLinks: [{ title: 'Lawless French', url: 'https://www.lawlessfrench.com' }] },
        ],
      },
    ],
  },
  {
    name: 'Religious & Moral Education',
    emoji: '🙏',
    color: 'from-yellow-500 to-amber-600',
    strands: [
      {
        name: 'God and Creation',
        subStrands: [
          { name: 'Creation Stories', videos: [{ title: 'Creation Stories from Different Religions', url: 'https://www.youtube.com/watch?v=teu7BCZTgDs' }], externalLinks: [{ title: 'RE Online', url: 'https://www.reonline.org.uk' }] },
          { name: 'Attributes of God', videos: [{ title: 'Understanding God', url: 'https://www.youtube.com/watch?v=Zy2KcUxsNMo' }], externalLinks: [] },
        ],
      },
      {
        name: 'Moral Life',
        subStrands: [
          { name: 'Honesty and Integrity', videos: [{ title: 'Honesty for Kids', url: 'https://www.youtube.com/watch?v=B0P1OGxPrzE' }], externalLinks: [{ title: 'Character Counts', url: 'https://charactercounts.org' }] },
          { name: 'Respect and Responsibility', videos: [{ title: 'Being Responsible', url: 'https://www.youtube.com/watch?v=M5P5A2cX_jc' }], externalLinks: [] },
        ],
      },
      {
        name: 'Religious Practices',
        subStrands: [
          { name: 'Worship and Prayer', videos: [{ title: 'Different Forms of Worship', url: 'https://www.youtube.com/watch?v=uBzG9xBv2nk' }], externalLinks: [] },
          { name: 'Religious Festivals', videos: [{ title: 'World Religious Festivals', url: 'https://www.youtube.com/watch?v=4_M_sXoQ7Sg' }], externalLinks: [] },
        ],
      },
    ],
  },
  {
    name: 'Ghanaian Language',
    emoji: '🇬🇭',
    color: 'from-emerald-500 to-green-600',
    strands: [
      {
        name: 'Oral Language',
        subStrands: [
          { name: 'Listening and Speaking', videos: [{ title: 'Learn Twi Basics', url: 'https://www.youtube.com/watch?v=6hANUKkj8so' }], externalLinks: [{ title: 'Learn Akan', url: 'https://learnakan.com' }] },
          { name: 'Conversation', videos: [{ title: 'Twi Conversations', url: 'https://www.youtube.com/watch?v=dAQzKCGcpuM' }], externalLinks: [] },
        ],
      },
      {
        name: 'Reading and Writing',
        subStrands: [
          { name: 'Phonics and Vocabulary', videos: [{ title: 'Twi Alphabet', url: 'https://www.youtube.com/watch?v=9TdM2xvwXnI' }], externalLinks: [] },
          { name: 'Comprehension', videos: [], externalLinks: [] },
        ],
      },
      {
        name: 'Culture and Heritage',
        subStrands: [
          { name: 'Proverbs and Folktales', videos: [{ title: 'Ghanaian Proverbs', url: 'https://www.youtube.com/watch?v=iQGfOkPxN-U' }], externalLinks: [{ title: 'Anansi Stories', url: 'https://en.wikipedia.org/wiki/Anansi' }] },
          { name: 'Customs and Traditions', videos: [{ title: 'Ghanaian Culture', url: 'https://www.youtube.com/watch?v=JULjfkzLCaQ' }], externalLinks: [] },
        ],
      },
    ],
  },
];

// SHS subjects are the same as JHS but with additional subjects
export const shsAdditionalSubjects: SubjectData[] = [
  {
    name: 'History',
    emoji: '📜',
    color: 'from-stone-500 to-stone-700',
    strands: [
      {
        name: 'Pre-Colonial Ghana',
        subStrands: [
          { name: 'Early Kingdoms and Empires', videos: [{ title: 'Ancient Ghana Empire', url: 'https://www.youtube.com/watch?v=BeGmk3pVHBw' }], externalLinks: [{ title: 'African History', url: 'https://www.africanhistory.com' }] },
          { name: 'Trade and Commerce', videos: [{ title: 'Trans-Saharan Trade', url: 'https://www.youtube.com/watch?v=bYIrBWaX01I' }], externalLinks: [] },
        ],
      },
      {
        name: 'Colonial Era',
        subStrands: [
          { name: 'European Contact', videos: [{ title: 'Colonialism in Africa', url: 'https://www.youtube.com/watch?v=alJaltUmrGo' }], externalLinks: [] },
          { name: 'Independence Movement', videos: [{ title: 'Ghana Independence', url: 'https://www.youtube.com/watch?v=1YVQ-z9R8LU' }], externalLinks: [] },
        ],
      },
    ],
  },
  {
    name: 'Geography',
    emoji: '🗺️',
    color: 'from-teal-500 to-cyan-600',
    strands: [
      {
        name: 'Physical Geography',
        subStrands: [
          { name: 'Landforms and Drainage', videos: [{ title: 'Types of Landforms', url: 'https://www.youtube.com/watch?v=BDwMKr3ZBco' }], externalLinks: [{ title: 'National Geographic', url: 'https://education.nationalgeographic.org' }] },
          { name: 'Weather and Climate', videos: [{ title: 'Weather vs Climate', url: 'https://www.youtube.com/watch?v=vH298zSCQzY' }], externalLinks: [] },
        ],
      },
      {
        name: 'Human Geography',
        subStrands: [
          { name: 'Population Studies', videos: [{ title: 'Population Growth', url: 'https://www.youtube.com/watch?v=QsBT5EQt348' }], externalLinks: [] },
          { name: 'Urbanisation', videos: [{ title: 'Urbanisation Explained', url: 'https://www.youtube.com/watch?v=ClWsLs-V_38' }], externalLinks: [] },
        ],
      },
    ],
  },
  {
    name: 'Physical Education',
    emoji: '⚽',
    color: 'from-lime-500 to-green-600',
    strands: [
      {
        name: 'Physical Fitness',
        subStrands: [
          { name: 'Strength and Endurance', videos: [{ title: 'Fitness for Teens', url: 'https://www.youtube.com/watch?v=ml6cT4AZdqI' }], externalLinks: [{ title: 'NHS Fitness', url: 'https://www.nhs.uk/live-well/exercise/' }] },
          { name: 'Flexibility', videos: [{ title: 'Stretching Exercises', url: 'https://www.youtube.com/watch?v=sTANio_2E0Q' }], externalLinks: [] },
        ],
      },
      {
        name: 'Games and Sports',
        subStrands: [
          { name: 'Team Sports', videos: [{ title: 'Football Skills', url: 'https://www.youtube.com/watch?v=eDTAj0RaH1A' }], externalLinks: [] },
          { name: 'Athletics', videos: [{ title: 'Track and Field', url: 'https://www.youtube.com/watch?v=XFzKYN_3tQk' }], externalLinks: [] },
        ],
      },
    ],
  },
];

// Get subjects based on level
export const getSubjectsForLevel = (classGrade: string): SubjectData[] => {
  if (classGrade.startsWith('SHS')) {
    return [...jhsSubjects, ...shsAdditionalSubjects];
  }
  return jhsSubjects;
};
