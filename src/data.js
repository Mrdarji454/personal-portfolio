// Original portfolio content, used only by the explicit database seed.
export const person = {
  name: "Mukesh Darji",
  fullName: "Mukesh Rameshbhai Darji",
  role: "MERN Stack Developer",
  location: "Anand, Gujarat, India",
  email: "mukeshdarji454@gmail.com",
  github: "https://github.com/Mrdarji454",
  linkedin: "https://www.linkedin.com/in/mukesh-darji-06132b373",
  education: "B.Tech in Computer Engineering",
  college: "Birla Vishvakarma Mahavidyalaya, V.V. Nagar",
  graduation: "2029",
  score: "9.0/10 average SPI · Semesters 1–2",
  languages: ["English", "Hindi", "Gujarati"],
  portrait: null,
  resumePdf: null,
};
export const skills = [
  {
    title: "Frontend",
    items: ["React", "JavaScript", "HTML", "CSS", "Tailwind CSS"],
  },
  {
    title: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "JWT authentication"],
  },
  { title: "Databases", items: ["MongoDB", "Basic SQL / MySQL"] },
  {
    title: "Programming & tools",
    items: ["C", "C++", "Python", "DSA", "Git", "GitHub", "VS Code"],
  },
];
export const projects = [
  {
    slug: "school-erp",
    number: "01",
    name: "School ERP",
    category: "FULL-STACK APPLICATION",
    summary: "One workspace for the everyday life of a school.",
    description:
      "A solo MERN project bringing school administration, teaching, and student workflows into a unified application.",
    stack: ["MongoDB", "Express.js", "React", "Node.js"],
    contribution: "Solo development",
    status: "In development",
    theme: "erp",
    problem:
      "School workflows span multiple roles and recurring tasks. The project explores how a shared application can organize those workflows with appropriate access for each role.",
    features: [
      "Admin, Teacher, and Student roles with role-based access",
      "Student and teacher management",
      "Attendance and timetable / time slots",
      "Teacher-uploaded mock tests",
      "News management",
    ],
    featureNote:
      "These are the project’s development scope. Source code was not available for this portfolio build, so individual features are not presented as verified or complete.",
    contributionDetail:
      "I am building this project independently, working across the React interface, backend APIs, database design, and role-based workflows.",
    challenges:
      "The design challenge is coordinating permissions and shared data across three roles while keeping everyday school tasks straightforward.",
    screenshots: [],
    repository: null,
  },
  {
    slug: "shramsetu",
    number: "02",
    name: "ShramSetu",
    category: "COOPERATIVE SERVICE MARKETPLACE",
    summary: "Connecting local skills with local needs.",
    description:
      "A team project submitted for the SIH online round: a cooperative-owned marketplace for customers, workers, cooperatives, and admins.",
    stack: ["Service marketplace", "Team project", "Solution design"],
    contribution: "Team development & solution design",
    status: "SIH online-round submission",
    theme: "market",
    problem:
      "The proposed platform brings service discovery and coordination into a cooperative-owned model, connecting customers with workers and supporting the people managing that process.",
    features: [
      "Service booking",
      "Worker verification and assignment",
      "Payment workflows",
      "AI-assisted forecasting and matching",
    ],
    featureNote:
      "All features listed here describe intended scope. Implementation and the repository’s technology stack could not be independently verified.",
    contributionDetail:
      "As a team member, I contributed across development and solution design. This is a collaborative project; I do not claim sole ownership of its implementation.",
    challenges:
      "The solution-design challenge is balancing the needs of four participant groups and defining how verification, assignment, and service coordination fit together.",
    screenshots: [],
    repository: "https://github.com/Mrdarji454/sramshetu",
  },
  {
    slug: "weather-app",
    number: "03",
    name: "Weather App",
    category: "REACT LEARNING PROJECT",
    summary: "A focused exploration of building with React.",
    description:
      "A React weather project created as part of my practical frontend learning. Detailed feature claims await source verification.",
    stack: ["React"],
    contribution: "Personal project",
    status: "Source review pending",
    theme: "weather",
    problem:
      "Use a familiar subject to practice building a focused React application.",
    features: ["React application"],
    featureNote:
      "The source was not available for inspection. Search, live data, forecasts, and other specific functionality are not claimed.",
    contributionDetail:
      "This personal React project is part of my hands-on frontend learning.",
    challenges:
      "Specific technical challenges will be documented after the project source can be reviewed.",
    screenshots: [],
    repository: null,
  },
];
export const journey = [
  {
    label: "The foundation",
    title: "Computer Engineering at BVM",
    text: "Studying at Birla Vishvakarma Mahavidyalaya, V.V. Nagar. Expected graduation in 2029; 9.0/10 average SPI across semesters 1–2.",
  },
  {
    label: "Learning by doing",
    title: "From fundamentals to full stack",
    text: "Developing web skills through practical projects, alongside C++ problem solving and data structures.",
  },
  {
    label: "Independent building",
    title: "Developing School ERP",
    text: "Bringing together frontend, backend, and database thinking in a solo MERN application.",
  },
  {
    label: "Working together",
    title: "ShramSetu / SIH online round",
    text: "Contributing to team development and solution design for a cooperative-owned service marketplace.",
  },
];
