
import { CareerOption } from './types';

export const CAREERS: CareerOption[] = [
  { 
    field: 'Software Engineer', 
    icon: 'fa-code', 
    prompt: 'A modern software engineer in a high-tech office with monitors, wearing casual professional attire like a hoodie or tech-vest.' 
  },
  { 
    field: 'Gourmet Chef', 
    icon: 'fa-utensils', 
    prompt: 'A professional chef in a high-end kitchen, wearing a clean white chef coat and hat, surrounded by stainless steel appliances.' 
  }
];

export const SAMPLE_PROFESSIONS = [
  "Cybersecurity Expert",
  "Deep Sea Explorer",
  "Luxury Fashion Designer",
  "Formula 1 Driver",
  "Mars Architect",
  "Wildlife Photographer",
  "Samurai Warrior",
  "Quantum Physicist",
  "High-Stakes Surgeon",
  "Urban Rooftop Farmer"
];

export const PRD_CONTENT = {
  title: "PersonaShift AI Strategy",
  version: "1.2.0",
  sections: [
    {
      title: "1. Why are we building this?",
      content: "To bridge the 'visualization gap' in career exploration. We enable users to see a high-fidelity version of their future professional self, reducing the friction of imagining a career pivot."
    },
    {
      title: "2. Success Metrics",
      items: [
        "Retention: Users who complete the generation of all 10 personas.",
        "Shareability: Rate of image saves/captures per session.",
        "Precision: User-reported accuracy of facial identity preservation."
      ]
    },
    {
      title: "3. Target Users",
      items: [
        "The Pivoters: Professionals seeking inspiration for a second act.",
        "The Aspirants: Students visualizing their potential in various sectors.",
        "The Visionaries: Users exploring self-identity in speculative (Sci-Fi/Historical) contexts."
      ]
    },
    {
      title: "4. The Solution",
      content: "A zero-friction identity engine. By combining Gemini's vision-to-vision capabilities with deep-contextual LLM generation, we produce a complete professional packet (Photo + Bio + Skills) from a single input."
    }
  ]
};
