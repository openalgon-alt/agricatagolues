export type Subject = {
  id: string;
  name: string;
  release: string; // dd/mm/yyyy
  releaseISO: string; // yyyy-mm-dd
  papers: number;
  isReleased: boolean;
};

export const SUBJECTS: Subject[] = [
  {
    id: "1",
    name: "Agronomy",
    release: "10/06/2026",
    releaseISO: "2026-06-10",
    papers: 7,
    isReleased: false,
  },
  {
    id: "2",
    name: "Agricultural Economics",
    release: "13/06/2026",
    releaseISO: "2026-06-13",
    papers: 7,
    isReleased: false,
  },
  {
    id: "3",
    name: "Agricultural Engineering",
    release: "14/06/2026",
    releaseISO: "2026-06-14",
    papers: 7,
    isReleased: false,
  },
  {
    id: "4",
    name: "Agricultural Entomology",
    release: "17/06/2026",
    releaseISO: "2026-06-17",
    papers: 7,
    isReleased: false,
  },
  {
    id: "5",
    name: "Agricultural Extension",
    release: "20/06/2026",
    releaseISO: "2026-06-20",
    papers: 7,
    isReleased: false,
  },
  {
    id: "6",
    name: "Agricultural Marketing and Cooperation",
    release: "22/06/2026",
    releaseISO: "2026-06-22",
    papers: 7,
    isReleased: false,
  },
  {
    id: "7",
    name: "Agricultural Microbiology",
    release: "24/06/2026",
    releaseISO: "2026-06-24",
    papers: 7,
    isReleased: false,
  },
  {
    id: "8",
    name: "Agricultural Statistics",
    release: "27/06/2026",
    releaseISO: "2026-06-27",
    papers: 7,
    isReleased: false,
  },
  {
    id: "9",
    name: "Animal Science",
    release: "30/06/2026",
    releaseISO: "2026-06-30",
    papers: 7,
    isReleased: false,
  },
  {
    id: "10",
    name: "Apiculture",
    release: "01/07/2026",
    releaseISO: "2026-07-01",
    papers: 7,
    isReleased: false,
  },
  {
    id: "11",
    name: "Biotechnology",
    release: "03/07/2026",
    releaseISO: "2026-07-03",
    papers: 7,
    isReleased: false,
  },
  {
    id: "12",
    name: "Crop Physiology",
    release: "05/07/2026",
    releaseISO: "2026-07-05",
    papers: 7,
    isReleased: false,
  },
  {
    id: "13",
    name: "Food Science and Nutrition",
    release: "07/07/2026",
    releaseISO: "2026-07-07",
    papers: 7,
    isReleased: false,
  },
  {
    id: "14",
    name: "Forestry and Environmental Science",
    release: "10/07/2026",
    releaseISO: "2026-07-10",
    papers: 7,
    isReleased: false,
  },
  {
    id: "15",
    name: "Genetics and Plant Breeding",
    release: "13/07/2026",
    releaseISO: "2026-07-13",
    papers: 7,
    isReleased: false,
  },
  {
    id: "16",
    name: "Horticulture",
    release: "15/07/2026",
    releaseISO: "2026-07-15",
    papers: 7,
    isReleased: false,
  },
  {
    id: "17",
    name: "Plant Pathology",
    release: "17/07/2026",
    releaseISO: "2026-07-17",
    papers: 7,
    isReleased: false,
  },
  {
    id: "18",
    name: "Seed Science and Technology",
    release: "18/07/2026",
    releaseISO: "2026-07-18",
    papers: 7,
    isReleased: false,
  },
  {
    id: "19",
    name: "Sericulture",
    release: "20/07/2026",
    releaseISO: "2026-07-20",
    papers: 7,
    isReleased: false,
  },
  {
    id: "20",
    name: "Soil Science and Agricultural Chemistry",
    release: "22/07/2026",
    releaseISO: "2026-07-22",
    papers: 7,
    isReleased: false,
  },
];

export function subjectStatus(
  subject: Pick<Subject, "isReleased" | "releaseISO"> | string,
  now = new Date(),
): "Available" | "Coming Soon" {
  if (typeof subject === "string") {
    return new Date(subject) <= now ? "Available" : "Coming Soon";
  }
  return subject.isReleased || new Date(subject.releaseISO) <= now ? "Available" : "Coming Soon";
}
